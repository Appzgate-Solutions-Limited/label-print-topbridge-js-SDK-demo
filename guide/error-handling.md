---
title: Error Handling
---

# Error Handling

## Error Class Hierarchy

All SDK errors inherit from the `TopBridgeError` base class:

```
TopBridgeError (Base)
├── TopBridgeConnectionError     Connection failed / timed out / Topbridge App not running
├── TopBridgeAuthError           Authentication or version issue
│     .code: 'NOT_AUTHENTICATED' | 'UPDATE_REQUIRED'
│     .storeUrl?: string         Update link (UPDATE_REQUIRED only)
│     .downloadUrl?: string      Download link (UPDATE_REQUIRED only)
├── TopBridgeQuotaError          Entitlement invalid / quota exhausted
│     .reason?: string           Specific reason
├── TopBridgePrintError          Print failed (when no specific error code matches)
│     .details?: unknown         Error details
├── TopBridgeConfigError         Configuration error
├── TopBridgeValidationError     Input validation failed
│     .field?: string            Field name that caused the error
├── TopBridgePrinterError        Printer offline / protocol not configured
├── TopBridgeTemplateError       Template does not exist or no permission
├── TopBridgeNetworkError        Cloud network disconnected
└── TopBridgeSourceError         Source missing or not in allowlist
```

## Type-Safe Handling with instanceof

All error classes support `instanceof` checks. TypeScript will automatically narrow the type:

```typescript
import {
  TopBridgeConnectionError,
  TopBridgeAuthError,
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
    // Topbridge App is not running or network is unreachable
  }
  else if (err instanceof TopBridgeAuthError) {
    if (err.code === 'NOT_AUTHENTICATED') {
      // User is not logged in
    }
    if (err.code === 'UPDATE_REQUIRED') {
      // Topbridge App version is too low
      if (err.storeUrl) window.open(err.storeUrl)
    }
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
    // Topbridge App is online, but cloud network is disconnected
  }
  else if (err instanceof TopBridgeSourceError) {
    // Source is not in the allowlist
  }
  else if (err instanceof TopBridgeValidationError) {
    // Input validation failed
  }
  else if (err instanceof TopBridgePrintError) {
    // Other print failures
  }
}
```

## Error-to-Scenario Mapping

| Scenario | Error Type | Suggested Handling |
|----------|------------|--------------------|
| Topbridge App not installed / not running | `TopBridgeConnectionError` | Use `client.launch.ensureRunning()` for auto-launch and retry |
| User not logged in | `TopBridgeAuthError(NOT_AUTHENTICATED)` | Guide user to log in to Topbridge App |
| Topbridge App version too low | `TopBridgeAuthError(UPDATE_REQUIRED)` | Use `err.storeUrl` to guide update |
| Print quota exhausted | `TopBridgeQuotaError` | Display `err.reason`, guide to renew |
| Printer offline | `TopBridgePrinterError` | Check printer connection and protocol configuration |
| Template does not exist | `TopBridgeTemplateError` | Check if template ID/Code is correct |
| Cloud network disconnected | `TopBridgeNetworkError` | Check network connection |
| products is empty | `TopBridgeValidationError` | `err.field` indicates the problematic field |
| Print failed (other) | `TopBridgePrintError` | Check `err.details` for details |

## Warning Handling

The SDK may return non-fatal warnings alongside successful responses. These do not block execution:

```typescript
const result = await client.print.execute({ /* ... */ })
if (result.warnings?.length) {
  for (const w of result.warnings) {
    if (w.code === 'DATA_FORMAT' && w.reason === 'newline_truncated') {
      console.warn(`Data format hint: ${w.message}`)
    }
  }
}
```

| code | reason | Trigger Condition |
|------|--------|-------------------|
| `DATA_FORMAT` | `newline_truncated` | A `text` field in the schema contains newlines; SDK automatically truncated to first line |
