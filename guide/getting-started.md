---
title: Installation & Setup
---

# Getting Started

## Installation

```bash
npm install @appzgatenz/label-print-topbridge-js
```

:::tip
`@appzgatenz/label-print-topbridge-js@0.6.1` is published to npm. The APIs documented on this site are stable; see the [migration guide](/guide/migration-0.6) when upgrading from 0.5.x.
:::

## Prerequisites

| # | Requirement | Details |
|---|-------------|---------|
| 1 | Modern browser with WebSocket support | Chrome, Firefox, Safari, Edge (ES2020+) |
| 2 | TopBridge App installed | [Download](https://service.topsale.co.nz/self-service/download/topbridge) |
| 3 | TopBridge App is running | Health check returns `pong` |
| 4 | User is logged in to TopBridge App | `data.isLoggedIn === true` |
| 5 | Print entitlement is valid | Benefits check passes |
| 6 | At least one printer configured with protocol (TSPL/ZPL) | Printer list is non-empty |
| 7 | Tray App speaks WebSocket API V2 | Unified entry `/v2` |
| 8 | CSP allows `topsale:` protocol (if using `launch`) | See [CSP Configuration](/guide/csp) |

:::tip Don't want to write code?
Try the [TOPSALE label printing solution](https://topsale.biz/solution/label-printing/) — no integration needed.
:::

## Initialization

```typescript
import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient()
```

The SDK connects to `ws://localhost:8765` by default (internally appends `/v2`). Set `wssEnabled: true` to use the fixed WSS endpoint `wss://topbridge.topsale.co.nz:8764/v2`.

## Complete Print Workflow

```typescript
// 0. Optional: ensure TopBridge App is running
const { printers } = await client.launch.ensureRunning(
  () => client.preflight.run({
    onStepChange: (step) => console.log(`Checking ${step}...`)
  })
)

// Or run preflight directly (without auto-launching)
// const { printers } = await client.preflight.run()

// 1. Get available templates
const templates = await client.templates.list()

// 2. Optional: get template field definitions
const schema = await client.templates.schema('PRICE_LABEL')

// 3. Execute print
const result = await client.print.execute({
  template: 'PRICE_LABEL',       // Template ID or Code
  printer: 'TSC DA220',          // Printer name
  products: [
    { name: 'Apple', price: { value: 3.99, currency: '$', unit: '/kg' }, copies: 2 },
    { name: 'Banana', price: { value: 1.99, currency: '$' }, copies: 1 },
  ],
})

console.log(`Printed ${result.data.printedCopies} copies`)
```

> The SDK automatically fetches the template schema and transforms product data. No need to manually specify field types.

For session limits, printer setup, and push events, see the [API Quick Reference](/guide/api-reference) and [Migrating to 0.6](/guide/migration-0.6). Dedicated guides arrive in a follow-up update.

## Configuration Options

```typescript
const client = new TopBridgeClient({
  source: 'Core-SDK',              // SDK source identifier (default)
  debug: true,                     // Enable console logging
  wssEnabled: false,               // Use fixed WSS endpoint
  logger: customLogger,            // Custom logger implementation
  timeouts: {
    health: 3000,                  // Health check timeout (ms)
    preflight: 10000,              // Preflight / template query timeout (ms)
    print: 60000,                  // Print execution timeout (ms)
    printerSetup: 10000,           // Printer setup timeout (ms)
    refresh: 30000,                // Template/benefit force-refresh timeout (ms)
  },
})
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `source` | `'Core-SDK' \| 'React-SDK' \| 'Nextjs-SDK'` | `'Core-SDK'` | SDK source identifier (used by wrapper SDKs) |
| `debug` | `boolean` | `false` | Enable console logging (prefix: `[TopBridge]`) |
| `wssEnabled` | `boolean` | `false` | Use the fixed WSS endpoint (no custom URLs) |
| `logger` | `Logger` | Silent (no-op) | Custom logger implementation |
| `timeouts.health` | `number` (ms) | `3000` | Health check timeout |
| `timeouts.preflight` | `number` (ms) | `10000` | Preflight / template query timeout |
| `timeouts.print` | `number` (ms) | `60000` | Print execution timeout |
| `timeouts.printerSetup` | `number` (ms) | `10000` | Printer setup timeout |
| `timeouts.refresh` | `number` (ms) | `30000` | Template/benefit force-refresh timeout |

### Logger

```typescript
interface Logger {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}
```

Logger priority: custom `logger` > `debug: true` console logs > silent (default).

## Error Handling

```typescript
import {
  TopBridgeConnectionError,
  TopBridgeAuthError,
  TopBridgeVersionError,
  TopBridgeQuotaError,
  TopBridgePrintError,
  TopBridgeConfigError,
  TopBridgeValidationError,
  TopBridgePrinterError,
  TopBridgePrinterSetupError,
  TopBridgeTemplateError,
  TopBridgeNetworkError,
  TopBridgeSourceError,
  TopBridgeSessionError,
} from '@appzgatenz/label-print-topbridge-js'

try {
  await client.print.execute({ /* ... */ })
} catch (err) {
  if (err instanceof TopBridgeConnectionError) {
    // TopBridge App is not running or connection timed out
  } else if (err instanceof TopBridgeAuthError) {
    // Not logged in
  } else if (err instanceof TopBridgeVersionError) {
    // App version too low — guide update via err.storeUrl / err.downloadUrl
  } else if (err instanceof TopBridgeSessionError) {
    // Session limit exceeded — render err.sessions, then kickSession
  } else if (err instanceof TopBridgeQuotaError) {
    // Benefit invalid or quota exhausted
  } else if (err instanceof TopBridgePrinterError) {
    // Printer offline or protocol not configured
  } else if (err instanceof TopBridgePrinterSetupError) {
    // Printer setup CRUD failed — inspect err.code
  } else if (err instanceof TopBridgeTemplateError) {
    // Template does not exist or no permission
  } else if (err instanceof TopBridgeNetworkError) {
    // TopBridge App is online, but cloud network is disconnected
  } else if (err instanceof TopBridgeSourceError) {
    // Source rejected by Tray App whitelist
  } else if (err instanceof TopBridgeValidationError) {
    // Input validation failed — err.field points to the field
  } else if (err instanceof TopBridgePrintError) {
    // Print failed
  } else if (err instanceof TopBridgeConfigError) {
    // Invalid client configuration
  }
}
```

See [Error Handling](/guide/error-handling) for the complete reference.
