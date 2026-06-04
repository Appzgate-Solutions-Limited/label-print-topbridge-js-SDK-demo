---
title: Troubleshooting
---

# Troubleshooting

## Q: TopBridgeConnectionError thrown when calling API

**Cause**: Cannot connect to TopBridge App. The SDK communicates with TopBridge App via an internal local communication channel.

**Troubleshooting**:
1. Confirm TopBridge App is installed ([download](https://service.topsale.co.nz/self-service/download/topbridge)) and running
2. Check if the app is blocked by firewall
3. Confirm app version >= 1.0.45 (supports V2 API)
4. Use `client.launch.ensureRunning()` to automatically handle TopBridge App launch and retry

:::tip Still having issues?
Visit the [TOPSALE Self-Service](https://service.topsale.co.nz/self-service) for support resources and account management.
:::

## Q: TopBridgeAuthError(code: 'NOT_AUTHENTICATED') thrown

**Cause**: TopBridge App is running but the user is not logged in.

**Handling**: Guide the user to open TopBridge App and complete login, then retry.

## Q: TopBridgeAuthError(code: 'UPDATE_REQUIRED') thrown

**Cause**: The installed TopBridge App version is below the minimum requirement.

**Handling**: Use `err.storeUrl` (Microsoft Store) or `err.downloadUrl` (direct download) to guide the user to update.

## Q: TopBridgeQuotaError but user confirms quota is sufficient

**Troubleshooting**:
- Check if `benefits.data.expiresAt` has expired
- Check if `benefits.data.hasPrintBenefit` is `true`
- `err.reason` contains the specific cause

## Q: TopBridgePrinterError thrown but user confirms printer is connected

**Cause**: TopBridge App requires the printer to have a communication protocol (TSPL / ZPL) configured. Simply connecting is not enough.

**Troubleshooting**:
1. Confirm the printer is synced in TopBridge App
2. Confirm a TSPL or ZPL protocol has been configured for the printer
3. Printers without a configured protocol will not appear in `printers.list()` results

## Q: Error when using in Next.js SSR

**Cause**: The SDK depends on the browser-native `WebSocket` API, which does not exist in the Node.js server.

**Solution**: Ensure SDK is only called on the client side. Use dynamic imports:

```typescript
// In a Next.js page component
useEffect(() => {
  import('@appzgatenz/label-print-topbridge-js').then(({ TopBridgeClient }) => {
    const client = new TopBridgeClient()
    // ... use client here
  })
}, [])
```

Or use the `'use client'` directive to ensure the component is only rendered on the client.

## Q: Print succeeded but response contains warnings

**Cause**: The SDK or the TopBridge Tray App detected non-fatal issues. Printing still executed normally, but the output may not match expectations.

**Common warnings**:

| code | Meaning | Suggested Action |
|------|---------|-----------------|
| `DPI_MISMATCH` | Printer DPI does not match template DPI | Check if the printer DPI setting is correct; expect possible scaling or alignment offset |
| `SIZE_MISMATCH` | Template size does not match the printer's loaded media size | Check if the loaded label media matches the template design size; content may be truncated or offset (currently only Brother printers) |
| `DATA_FORMAT` | SDK automatically fixed a data format issue (e.g., truncated newlines) | Usually safe to ignore; review `w.message` for details |

```typescript
if (result.warnings?.length) {
  for (const w of result.warnings) {
    if (w.code === 'SIZE_MISMATCH' || w.code === 'DPI_MISMATCH') {
      console.warn(`Print quality warning: ${w.message}`)
    }
  }
}
```

See [Warning Handling](/guide/error-handling#warning-handling) for details.
