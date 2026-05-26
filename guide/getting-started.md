---
title: Installation & Setup
---

# Getting Started

## Installation

```bash
npm install @appzgatenz/label-print-topbridge-js
```

## Prerequisites

| # | Requirement | Details |
|---|-------------|---------|
| 1 | Modern browser with WebSocket support | Chrome 16+, Firefox 11+, Safari 7+, Edge 12+ |
| 2 | TopBridge App >= 1.0.45 installed | [Download](https://service.topsale.co.nz/self-service/download/topbridge) |
| 3 | TopBridge App is running | Health check returns `pong` |
| 4 | User is logged in to TopBridge App | `data.isLoggedIn === true` |
| 5 | Print entitlement is valid | Benefits check passes |
| 6 | At least one printer configured with protocol (TSPL/ZPL) | Printer list is non-empty |
| 7 | CSP allows `topsale:` protocol (if using `launch`) | See [CSP Configuration](/guide/csp) |

:::tip Don't want to write code?
Try the [TOPSALE label printing solution](https://topsale.biz/solution/label-printing/) — no integration needed.
:::

## Initialization

```typescript
import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient()
```

The SDK communicates with TopBridge App via local WebSocket. No configuration required.

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

## Configuration Options

```typescript
const client = new TopBridgeClient({
  debug: true,                     // Enable console logging
  logger: customLogger,            // Custom logger implementation
  timeouts: {
    health: 3000,                  // Health check timeout (ms)
    preflight: 10000,              // Preflight timeout (ms)
    print: 60000,                  // Print timeout (ms)
  },
})
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `source` | `string` | `'(internal)'` | SDK source identifier (set internally, do not configure manually) |
| `debug` | `boolean` | `false` | Enable console logging (prefix: `[TopBridge]`) |
| `logger` | `Logger` | Silent (no-op) | Custom logger implementation |
| `timeouts.health` | `number` (ms) | `3000` | Health check timeout |
| `timeouts.preflight` | `number` (ms) | `10000` | Preflight / template query timeout |
| `timeouts.print` | `number` (ms) | `60000` | Print execution timeout |

### Logger

You can provide a custom logger to integrate with monitoring services (e.g., Sentry, Datadog):

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
  TopBridgeQuotaError,
  TopBridgePrintError,
  TopBridgePrinterError,
  TopBridgeTemplateError,
  TopBridgeNetworkError,
  TopBridgeSourceError,
} from '@appzgatenz/label-print-topbridge-js'

try {
  await client.print.execute({ /* ... */ })
} catch (err) {
  if (err instanceof TopBridgeConnectionError) {
    // TopBridge App is not running or connection timed out
  } else if (err instanceof TopBridgeAuthError) {
    // Not logged in or update required
    if (err.code === 'UPDATE_REQUIRED') {
      window.open(err.storeUrl) // Guide user to update
    }
  } else if (err instanceof TopBridgeQuotaError) {
    // Benefit invalid or quota exhausted
  } else if (err instanceof TopBridgePrinterError) {
    // Printer offline or protocol not configured
  } else if (err instanceof TopBridgeTemplateError) {
    // Template does not exist or no permission
  } else if (err instanceof TopBridgeNetworkError) {
    // TopBridge App is online, but cloud network is disconnected
  } else if (err instanceof TopBridgeSourceError) {
    // Origin verification failed
  } else if (err instanceof TopBridgePrintError) {
    // Print failed
  }
}
```

See [Error Handling](/guide/error-handling) for the complete reference.
