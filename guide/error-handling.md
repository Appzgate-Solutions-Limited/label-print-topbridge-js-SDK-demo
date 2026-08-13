---
title: Error Handling
---

# Error Handling

## Design Philosophy

The SDK uses a **throw channel + return channel** hybrid model:

1. **Throw channel** — Failures become `TopBridgeError` subclasses. Callers catch with `instanceof`.
2. **Return channel** — Success (`ok` / `warning`) returns `SdkResponse<T>`. Warnings never block the main flow.
3. **Protocol codes** — V2 `code` values are preserved on `error.code` for programmatic checks.
4. **Structured metadata** — Subclass fields carry UI-ready context (`storeUrl`, `sessions`, `field`, …).

## Error Class Hierarchy

```
TopBridgeError (Base)
├── TopBridgeConnectionError     Connection failed / timed out / App not running
├── TopBridgeAuthError           Not authenticated
│     .code: 'NOT_AUTHENTICATED'
│     .storeUrl? / .downloadUrl?
├── TopBridgeVersionError        App version too low
│     .code: 'UPDATE_REQUIRED'
│     .storeUrl? / .downloadUrl?
├── TopBridgeQuotaError          Entitlement invalid / quota exhausted
│     .code: 'QUOTA_EXHAUSTED'
│     .reason?
├── TopBridgePrintError          Print failed (unclassified server error)
├── TopBridgeConfigError         Invalid client configuration
├── TopBridgeValidationError     Input validation failed
│     .field?
├── TopBridgePrinterError        Printer offline / not configured
│     .code: 'PRINTER_OFFLINE' | 'PRINTER_NOT_CONFIGURED'
├── TopBridgeTemplateError       Template missing
│     .code: 'TEMPLATE_NOT_FOUND'
├── TopBridgeNetworkError        Cloud network disconnected
│     .code: 'NETWORK_DISCONNECTED'
├── TopBridgeSourceError         Source not recognized
│     .code: 'INVALID_SOURCE'
├── TopBridgePrinterSetupError   Printer setup CRUD failed
│     .code: PrinterSetupErrorCode
└── TopBridgeSessionError        Session limit exceeded (SessionBlocked)
      .code: 'SESSION_LIMIT_EXCEEDED'
      .limit? / .usedSessions? / .sessions?
```

:::warning Breaking change from older docs
`UPDATE_REQUIRED` is **`TopBridgeVersionError`**, not `TopBridgeAuthError`. Update any `err.code === 'UPDATE_REQUIRED'` checks under `AuthError`.
:::

## Type-Safe Handling with instanceof

```typescript
import {
  TopBridgeConnectionError,
  TopBridgeAuthError,
  TopBridgeVersionError,
  TopBridgeQuotaError,
  TopBridgePrintError,
  TopBridgePrinterError,
  TopBridgePrinterSetupError,
  TopBridgeTemplateError,
  TopBridgeNetworkError,
  TopBridgeSourceError,
  TopBridgeValidationError,
  TopBridgeSessionError,
} from '@appzgatenz/label-print-topbridge-js'

try {
  await client.print.execute({ /* ... */ })
} catch (err) {
  if (err instanceof TopBridgeConnectionError) {
    // App not running — consider client.launch.ensureRunning()
  } else if (err instanceof TopBridgeAuthError) {
    // User is not logged in
  } else if (err instanceof TopBridgeVersionError) {
    if (err.storeUrl) window.open(err.storeUrl)
  } else if (err instanceof TopBridgeSessionError) {
    // Render err.sessions, then:
    // await client.session.kickSession(err.sessions.map(s => s.id))
    // Retry the original call — no re-login required
  } else if (err instanceof TopBridgeQuotaError) {
    // Show err.reason
  } else if (err instanceof TopBridgePrinterError) {
    // Offline or protocol not configured
  } else if (err instanceof TopBridgePrinterSetupError) {
    // Inspect err.code for charset/font/printer setup failures
  } else if (err instanceof TopBridgeTemplateError) {
    // Template not found
  } else if (err instanceof TopBridgeNetworkError) {
    // Cloud disconnected
  } else if (err instanceof TopBridgeSourceError) {
    // Invalid source
  } else if (err instanceof TopBridgeValidationError) {
    // err.field indicates the bad input
  } else if (err instanceof TopBridgePrintError) {
    // Other print failures
  }
}
```

:::info Why no `TopBridgeConfigError` in the catch chain?
`TopBridgeConfigError` signals a programming mistake (invalid constructor options), not a runtime failure to catch and handle. Fix it at development time — no need to add it to your `catch` chain.
:::

## Error-to-Scenario Mapping

| Scenario | Error Type | Suggested Handling |
|----------|------------|--------------------|
| App not installed / not running | `TopBridgeConnectionError` | `client.launch.ensureRunning()` |
| User not logged in | `TopBridgeAuthError` | Guide login in TopBridge App |
| App version too low | `TopBridgeVersionError` | Open `err.storeUrl` / `err.downloadUrl` |
| Session limit exceeded | `TopBridgeSessionError` | Show `err.sessions`, call `kickSession`, retry |
| Print quota exhausted | `TopBridgeQuotaError` | Display `err.reason` |
| Invalid SDK configuration | `TopBridgeConfigError` | Check `source` / constructor options |
| Printer offline / not configured | `TopBridgePrinterError` | Check connection and protocol |
| Printer setup CRUD failed | `TopBridgePrinterSetupError` | Branch on `err.code` |
| Template missing | `TopBridgeTemplateError` | Check template ID/Code |
| Cloud network disconnected | `TopBridgeNetworkError` | Check network |
| Source not recognized | `TopBridgeSourceError` | Verify SDK `source` configuration |
| Invalid products / params | `TopBridgeValidationError` | Fix `err.field` |
| Print failed (other) | `TopBridgePrintError` | Inspect `err.details` |

## Warning Handling

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

## Industry Comparison

| SDK | Base Class | Codes | Type Discrimination |
|-----|------------|-------|---------------------|
| Stripe Node.js | `StripeError` | `type` | `instanceof` subclasses |
| Prisma | known request errors | `code` (e.g. `P2002`) | `instanceof` + `code` |
| **TopBridge SDK** | `TopBridgeError` | V2 protocol `code` | `instanceof` subclasses |
