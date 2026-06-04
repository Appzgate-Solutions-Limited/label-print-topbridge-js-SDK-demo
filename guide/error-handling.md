---
title: Error Handling
---

# Error Handling

## Design Philosophy

The SDK adopts a three-layer error handling model: **layered inheritance + protocol error codes + structured metadata**.

1. **Layered Inheritance**: All errors extend `TopBridgeError` (which extends native `Error`), divided into 11 subclasses by business domain. Benefits:
   - Callers can use `instanceof` to catch specific errors precisely
   - TypeScript automatically narrows types without extra assertions
   - Error semantics map directly to business scenarios

2. **Protocol Error Codes**: The underlying V2 WebSocket protocol returns a `code` field (e.g., `NOT_AUTHENTICATED`, `UPDATE_REQUIRED`). SDK maps these to corresponding subclasses while preserving the original code on `error.code` for programmatic checks.

3. **Structured Metadata**: Each error object carries, in addition to `message` and `name`:
   - `code?` — Protocol-level error code
   - `details?` — Extended details (type varies by error)
   - Subclass-specific fields — e.g., `TopBridgeAuthError.storeUrl`, `TopBridgeQuotaError.reason`, `TopBridgeValidationError.field`

## Error Class Hierarchy

All SDK errors inherit from the `TopBridgeError` base class:

```
TopBridgeError (Base)
├── TopBridgeConnectionError     Connection failed / timed out / TopBridge App not running
├── TopBridgeAuthError           Authentication issue
│     .code: 'NOT_AUTHENTICATED'
│     .storeUrl?: string         Update link
│     .downloadUrl?: string      Download link
├── TopBridgeVersionError        TopBridge App version too low
│     .code: 'UPDATE_REQUIRED'
│     .storeUrl?: string         Update link
│     .downloadUrl?: string      Download link
├── TopBridgeQuotaError          Entitlement invalid / quota exhausted
│     .reason?: string           Specific reason
├── TopBridgePrintError          Print failed (when no specific error code matches)
│     .details?: unknown         Error details
├── TopBridgeConfigError         Configuration error (e.g., invalid source)
├── TopBridgeValidationError     Input validation failed
│     .field?: string            Field name that caused the error
├── TopBridgePrinterError        Printer offline / protocol not configured
├── TopBridgeTemplateError       Template does not exist or no permission
├── TopBridgeNetworkError        Cloud network disconnected
└── TopBridgeSourceError         Origin verification failed
```

## Type-Safe Handling with instanceof

All error classes support `instanceof` checks. TypeScript will automatically narrow the type:

```typescript
import {
  TopBridgeConnectionError,
  TopBridgeAuthError,
  TopBridgeVersionError,
  TopBridgeQuotaError,
  TopBridgePrintError,
  TopBridgePrinterError,
  TopBridgeTemplateError,
  TopBridgeNetworkError,
  TopBridgeSourceError,
  TopBridgeValidationError,
} from '@appzgatenz/label-print-topbridge-js'

try {
  await client.print.execute({ /* ... */ })
} catch (err) {
  if (err instanceof TopBridgeConnectionError) {
    // TopBridge App is not running or network is unreachable
  }
  else if (err instanceof TopBridgeAuthError) {
    // User is not logged in
    if (err.storeUrl) console.log('Store:', err.storeUrl)
  }
  else if (err instanceof TopBridgeVersionError) {
    // TopBridge App version is too low — guide user to update
    if (err.storeUrl) window.open(err.storeUrl)
  }
  else if (err instanceof TopBridgeQuotaError) {
    // Entitlement invalid or quota exhausted
  }
  else if (err instanceof TopBridgePrinterError) {
    // Printer offline or protocol not configured
  }
  else if (err instanceof TopBridgeTemplateError) {
    // Template does not exist or no permission
  }
  else if (err instanceof TopBridgeNetworkError) {
    // TopBridge App is online, but cloud network is disconnected
  }
  else if (err instanceof TopBridgeSourceError) {
    // Origin verification failed
  }
  else if (err instanceof TopBridgeValidationError) {
    // Input validation failed
  }
  else if (err instanceof TopBridgePrintError) {
    // Other print failures
  }
}
```

## Reading Error Details

In addition to using `instanceof` to distinguish error types, you can read common and subclass-specific properties directly to build richer error messages or logging:

```typescript
try {
  await client.print.execute({ /* ... */ })
} catch (err) {
  if (err instanceof TopBridgeError) {
    // Common properties available on all SDK errors
    console.error('Error:', err.name, '-', err.message)
    if (err.code) console.error('Code:', err.code)
    if (err.details) console.error('Details:', err.details)

    // Subclass-specific properties
    if (err instanceof TopBridgeAuthError) {
      if (err.storeUrl) console.log('Store URL:', err.storeUrl)
      if (err.downloadUrl) console.log('Download URL:', err.downloadUrl)
    }
    if (err instanceof TopBridgeQuotaError) {
      if (err.reason) console.log('Quota reason:', err.reason)
    }
    if (err instanceof TopBridgeValidationError) {
      if (err.field) console.log('Invalid field:', err.field)
    }
  } else {
    // Non-SDK errors (runtime exceptions, bugs)
    console.error('Unexpected error:', err)
  }
}
```

## Error-to-Scenario Mapping

| Scenario | Error Type | Suggested Handling |
|----------|------------|--------------------|
| TopBridge App not installed / not running | `TopBridgeConnectionError` | Use `client.launch.ensureRunning()` for auto-launch and retry |
| User not logged in | `TopBridgeAuthError` | Guide user to log in to TopBridge App |
| TopBridge App version too low | `TopBridgeVersionError` | Use `err.storeUrl` to guide update |
| Print quota exhausted | `TopBridgeQuotaError` | Display `err.reason`, guide to renew |
| Invalid SDK configuration | `TopBridgeConfigError` | Check initialization parameters |
| Printer offline | `TopBridgePrinterError` | Check printer connection and protocol configuration |
| Template does not exist | `TopBridgeTemplateError` | Check if template ID/Code is correct |
| Cloud network disconnected | `TopBridgeNetworkError` | Check network connection |
| Origin verification failed | `TopBridgeSourceError` | Check `source` configuration |
| products is empty or invalid | `TopBridgeValidationError` | `err.field` indicates the problematic field |
| Print failed (other) | `TopBridgePrintError` | Check `err.details` for details |

## Warning Handling

The SDK may return non-fatal warnings alongside successful responses. These do not block execution:

```typescript
const result = await client.print.execute({ /* ... */ })
if (result.warnings?.length) {
  for (const w of result.warnings) {
    switch (w.code) {
      case 'DPI_MISMATCH':
        console.warn(`DPI mismatch: ${w.message}`)
        break
      case 'SIZE_MISMATCH':
        console.warn(`Size mismatch: ${w.message}`)
        break
      case 'DATA_FORMAT':
        console.warn(`Data format hint: ${w.message}`)
        break
    }
  }
}
```

| code | reason | Trigger Condition |
|------|--------|-------------------|
| `DPI_MISMATCH` | `dpi_mismatch` | Printer DPI does not match template DPI, which may cause printed content scaling or alignment offset |
| `SIZE_MISMATCH` | `size_mismatch` | Template design size does not match the printer's loaded media size, which may cause content to be truncated or offset (currently effective only for Brother printers) |
| `DATA_FORMAT` | `newline_truncated` | A `text` field in the schema contains newlines; SDK automatically truncated to first line |

## Industry Best Practice Comparison

Modern JS SDKs generally adopt a three-layer model: **base class + domain subclasses + error codes**. Here is a brief comparison:

| SDK | Base Class Design | Error Code Mechanism | Debug Metadata | Type Discrimination |
|-----|-------------------|---------------------|----------------|---------------------|
| **AWS SDK v3** | `ServiceException` interface | `$metadata` + `name` | requestId, httpStatusCode, extendedRequestId | `instanceof` / `error.name` |
| **Stripe Node.js** | `StripeError` base class | `type` field | `raw`, `headers`, `requestId`, `statusCode` | `instanceof` subclasses |
| **Twilio Node.js** | `RestException` | `code` + `status` | `moreInfo`, `details` | `instanceof` |
| **Prisma** | `PrismaClientKnownRequestError`, etc. | `code` (e.g., `P2002`) | `meta`, `clientVersion` | `instanceof` + `code` |
| **TopBridge SDK** | `TopBridgeError` base class | `code` (V2 protocol codes) | `details`, subclass-specific fields | `instanceof` subclasses |

**Conclusion**: TopBridge SDK's error handling design is on par with Stripe and Prisma, employing semantic class hierarchies, programmable error codes, and subclass fields that carry business context. It aligns with the mainstream direction of modern JS SDKs.
