---
title: Installation & Setup
---

# Getting Started

## Installation

```bash
npm install @appzgatenz/label-print-topbridge-js
```

## Prerequisites

- **Topbridge App** >= 1.0.45 is installed and running locally — [Download](https://service.topsale.co.nz/self-service/download/topbridge)
- Browser supports WebSocket (all modern browsers)
- At least one label printer with a configured protocol (TSPL / ZPL)
- If using `launch.trigger()`, page CSP must allow `topsale:` custom protocol — see [CSP Configuration](/guide/csp)

:::tip Don't want to write code?
Try the [TopSale label printing solution](https://topsale.biz/solution/label-printing/) — no integration needed.
:::

## Initialization

```typescript
import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient()
```

The SDK communicates with Topbridge App via local WebSocket. No configuration required.

## Complete Print Workflow

```typescript
// 0. Optional: ensure Topbridge App is running
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
    { name: 'Apple', price: 3.99, currency: '$', unit: '/kg', copies: 2 },
    { name: 'Banana', price: 1.99, currency: '$', copies: 1 },
  ],
})

console.log(`Printed ${result.data.printedCopies} copies`)
```

> The SDK automatically fetches the template schema and transforms product data. No need to manually specify field types.

## Configuration Options

```typescript
const client = new TopBridgeClient({
  debug: true,                     // Enable logging
  timeouts: {
    health: 3000,                  // Health check timeout (ms)
    preflight: 10000,              // Preflight timeout (ms)
    print: 60000,                  // Print timeout (ms)
  },
})
```

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
    // Topbridge App is not running or connection timed out
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
    // Topbridge App is online, but cloud network is disconnected
  } else if (err instanceof TopBridgeSourceError) {
    // Origin verification failed
  } else if (err instanceof TopBridgePrintError) {
    // Print failed
  }
}
```

See [Error Handling](/guide/error-handling) for the complete reference.
