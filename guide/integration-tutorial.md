---
title: Integration Tutorial
---

# Integration Tutorial

This section walks through an end-to-end example, demonstrating how to integrate label printing from scratch.

## Step 1: Preflight {#step-1-preflight}

Before printing, confirm three things: Topbridge App is running and the user is logged in, entitlements are valid, and printers are available. `preflight.run()` completes these checks in one go.

> **Prerequisite**: Topbridge App >= 1.0.45 must be installed ([download](https://service.topsale.co.nz/self-service/download/topbridge)).

:::tip Prefer a no-code solution?
[Try TopSale out-of-the-box](https://label-printing.topsale.biz/) — start printing labels in minutes without any development.
:::

> `preflight` is the recommended best practice but not mandatory — you can also call `print.execute()` directly. However, using preflight allows you to discover and handle issues before printing, providing a better user experience.
>
> Note: `preflight.run()` does not automatically launch Topbridge App. For auto-launch, wrap it with `client.launch.ensureRunning()`.

```typescript
try {
  // Use ensureRunning wrapper for automatic Topbridge App launch and retry
  const preflight = await client.launch.ensureRunning(
    () => client.preflight.run({
      onStepChange: (step) => {
        console.log(`Checking: ${step}`)  // health → benefits → printers
      }
    }),
    { onLaunching: () => console.log('Launching TopBridge...') }
  )

  const { health, benefits, printers } = preflight
  // Expected output:
  // {
  //   health: { status: 'ok', data: { isLoggedIn: true, version: '1.0.45' } },
  //   benefits: { status: 'ok', data: { isValid: true, remainingPrints: -1 } },
  //   printers: { status: 'ok', data: { count: 1, defaultPrinter: 'TSC DA220', printers: [...] } }
  // }
} catch (err) {
  // Preflight failed, handle according to error type (see Error Handling)
}
```

**Preflight Execution Flow**:

```
preflight.run()
  ├─ health.check()                   ← Pure health check, no auto-launch
  │    ├─ Success → Continue
  │    └─ Failure → Throw TopBridgeConnectionError / TopBridgeAuthError
  ├─ benefits.check()                 ← Entitlement validation
  │    ├─ Valid → Continue
  │    └─ Invalid → Throw TopBridgeQuotaError
  └─ printers.list()                  ← Get printers
       ├─ Has printers → Return PreflightResult
       └─ No printers → Throw TopBridgePrinterError
```

## Step 2: Get Templates {#step-2-get-templates}

After preflight passes, get available label templates:

```typescript
const templatesResult = await client.templates.list()

// Expected output:
// {
//   status: 'ok',
//   data: {
//     count: 2,
//     templates: [
//       { id: '1', code: 'PRICE_LABEL', name: 'Price Label 40x30', isEnabled: true },
//       { id: '2', code: 'SHIPPING_LABEL', name: 'Shipping Label 100x150', isEnabled: true }
//     ]
//   }
// }
```

Optional: get detailed field definitions for a template to understand what data is required:

```typescript
const schema = await client.templates.schema('PRICE_LABEL')

// Expected output:
// {
//   status: 'ok',
//   data: {
//     templateId: 'template-id-1',
//     code: 'PRICE_LABEL',
//     name: 'Price Label',
//     fields: [
//       { name: 'name', type: 'text', required: true },
//       { name: 'price', type: 'price', required: true,
//         subFields: [
//           { name: 'value', type: 'text', required: true },
//           { name: 'currency', type: 'text' },
//           { name: 'unit', type: 'text' },
//         ]
//       },
//       { name: 'barcode', type: 'barcode', required: false },
//       { name: 'copies', type: 'integer', required: false, default: 1 }
//     ]
//   }
// }
```

> Use `templates.schema()` when you need to dynamically build print forms. See [Widget Types](/guide/widgets) for fieldType details.

## Step 3: Execute Print {#step-3-execute-print}

Use the printer and template information from preflight to build the print request:

```typescript
// Input: flat product data
const result = await client.print.execute({
  template: 'PRICE_LABEL',
  printer: preflight.printers.data.defaultPrinter,
  products: [
    { name: 'Apple', price: 3.99, currency: '$', unit: '/kg', copies: 2 },
    { name: 'Banana', price: 1.99, currency: '$', copies: 1 },
  ],
})

// Expected output:
// {
//   status: 'ok',
//   message: 'Printed successfully',
//   data: {
//     printedCopies: 3,
//     jobId: 'job-123',
//     templateName: 'Price Label 40x30'
//   }
// }
```

**Key Points**:

- `products` is a flat JSON object — the SDK auto-fetches the template schema and converts data based on fieldType
- `template` accepts a template ID (`'1'`) or Code (`'PRICE_LABEL'`)
- `printer` is a printer name string
- `copies` defaults to 1, range [1, 9999]
- No need to pass `fieldTypes` — the SDK handles transformation automatically

## Complete Example

Here is a complete example that can run directly in the browser:

```typescript
import {
  TopBridgeClient,
  TopBridgeConnectionError,
  TopBridgeAuthError,
  TopBridgeQuotaError,
  TopBridgePrinterError,
  TopBridgePrintError,
} from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient({ debug: true })

async function printPriceLabels() {
  try {
    // 1. Ensure Topbridge App is running + preflight
    const preflight = await client.launch.ensureRunning(
      () => client.preflight.run({
        onStepChange: (step) => console.log(`Checking: ${step}`)
      }),
      { onLaunching: () => console.log('Launching TopBridge...') }
    )

    // 2. Execute print
    const result = await client.print.execute({
      template: 'PRICE_LABEL',
      printer: preflight.printers.data.defaultPrinter,
      products: [
        { name: 'Apple', price: 3.99, currency: '$', unit: '/kg', copies: 2 },
        { name: 'Banana', price: 1.99, currency: '$', copies: 1 },
      ],
    })

    console.log(`Print success: ${result.data.printedCopies} copies`)

  } catch (err) {
    if (err instanceof TopBridgeConnectionError) {
      console.error('Cannot connect to TopBridge, please confirm the app is running')
    } else if (err instanceof TopBridgeAuthError) {
      if (err.code === 'UPDATE_REQUIRED') {
        console.error('TopBridge version is too low, please update')
        const updateUrl = err.storeUrl ?? err.downloadUrl
        if (updateUrl) window.open(updateUrl)
      } else {
        console.error('Please log in to Topbridge App first')
      }
    } else if (err instanceof TopBridgeQuotaError) {
      console.error('Print quota insufficient:', err.reason)
    } else if (err instanceof TopBridgePrinterError) {
      console.error('Printer error, please check printer configuration in Topbridge App')
    } else if (err instanceof TopBridgePrintError) {
      console.error('Print failed:', err.message)
    } else {
      console.error('Unknown error:', err)
    }
  }
}

printPriceLabels()
```
