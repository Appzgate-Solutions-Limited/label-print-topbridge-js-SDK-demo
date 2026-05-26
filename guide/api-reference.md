---
title: API Quick Reference
---

# API Quick Reference

## Module Methods {#module-methods}

| Module | Method | Return Type | Description |
|--------|--------|-------------|-------------|
| `health` | [`check()`](/guide/integration-tutorial#step-1-preflight) | `Promise<HealthResponse>` | Health check |
| `benefits` | [`check()`](/guide/integration-tutorial#step-1-preflight) | `Promise<BenefitsResponse>` | Entitlement validation |
| `printers` | [`list()`](/guide/integration-tutorial#step-1-preflight) | `Promise<PrintersResponse>` | Printer list |
| `templates` | [`list()`](/guide/integration-tutorial#step-2-get-templates) | `Promise<TemplatesListResponse>` | Template list |
| `templates` | [`schema(template)`](/guide/integration-tutorial#step-2-get-templates) | `Promise<TemplateSchemaResponse>` | Template field definitions |
| `print` | [`execute(request)`](/guide/integration-tutorial#step-3-execute-print) | `Promise<PrintResponse>` | Execute print |
| `preflight` | [`run(options?)`](/guide/integration-tutorial#step-1-preflight) | `Promise<PreflightResult>` | Preflight orchestration |
| `launch` | [`trigger()`](/guide/launch-module#trigger) | `void` | Trigger TopBridge App launch |
| `launch` | [`ensureRunning(fn, options?)`](/guide/launch-module#ensurerunning-fn-options) | `Promise<T>` | Launch + retry orchestration |

### TopBridgeClientConfig

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `source` | `'Core-SDK' \| 'React-SDK' \| 'Nextjs-SDK'` | `'Core-SDK'` | SDK source identifier |
| `debug` | `boolean` | `false` | Enable console logging (prefix: `[TopBridge]`) |
| `logger` | `Logger` | Silent (no-op) | Custom logger implementation |
| `timeouts.health` | `number` (ms) | `3000` | Health check timeout |
| `timeouts.preflight` | `number` (ms) | `10000` | Preflight / template query timeout |
| `wssEnabled` | `boolean` | `false` | Enable WSS secure connection mode |
| `timeouts.print` | `number` (ms) | `60000` | Print execution timeout |

```typescript
import type { TopBridgeClientConfig } from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient({
  source: 'Core-SDK',
  debug: true,
  timeouts: { health: 5000, print: 120000 },
})
```

### PrintExecuteRequest

```typescript
interface PrintExecuteRequest {
  template: string             // Template ID or Code
  printer: string              // Printer name
  products: PrintProductInput[] // Product data array
}
```

### PrintProductInput

```typescript
interface PrintProductInput {
  [key: string]: string | number | Record<string, string | number | undefined> | undefined
  copies?: number  // Print copies, range [1, 9999], default 1
}
```

### SyncedPrinter

```typescript
interface SyncedPrinter {
  name: string               // Printer name (used as printer parameter)
  isDefault: boolean         // Whether this is the default printer
  protocol?: 'TSPL' | 'ZPL' // Label protocol
}
```

## Response Types {#response-types}

| Type | Key Fields |
|------|------------|
| `HealthResponse` | `type: 'pong'`, `isRunning: true`, `data.isLoggedIn`, `data.version`(optional), `data.networkStatus`(optional) |
| `BenefitsResponse` | `data.isValid`, `data.remainingPrints`, `data.expiresAt`, `data.reason`, `data.hasPrintBenefit`, `data.hasSessionBenefit` |
| `PrintersResponse` | `data.count`, `data.defaultPrinter`, `data.printers[]` |
| `TemplatesListResponse` | `data.count`, `data.templates[]` |
| `TemplateSchemaResponse` | `data.fields[]`, `data.code`, `data.name` |
| `PrintResponse` | `message`(top-level), `data.printedCopies`, `data.jobId`, `data.templateName`, `data.userId`(optional), `details`(optional), `warnings`(optional) |
| `PreflightResult` | `health`, `benefits`, `printers` |

### SdkResponse\<T\> {#sdk-response}

All SDK methods return a unified response envelope:

```typescript
interface SdkResponse<T> {
  status: 'ok' | 'warning'  // Request result status
  requestId?: string         // Request trace ID
  data: T                    // Business data
  message: string            // Human-readable status description
  details?: unknown          // Extended details (optional)
  warnings?: SdkWarning[]    // Non-fatal format hints (optional)
}
```

| Status | Behavior |
|--------|----------|
| `'ok'` | Request succeeded. Use `data` directly. |
| `'warning'` | Request succeeded with hints. `data` is usable, check `message` and `warnings` for details. |
| *(error)* | SDK throws a `TopBridgeError` subclass. No return value. |

## Export List {#export-list}

```typescript
// Classes
import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'
import { LaunchModule } from '@appzgatenz/label-print-topbridge-js'

// Error Classes (11 total)
import {
  TopBridgeError,
  TopBridgeConnectionError,
  TopBridgeAuthError,
  TopBridgeVersionError,
  TopBridgeQuotaError,
  TopBridgePrintError,
  TopBridgeConfigError,
  TopBridgeValidationError,
  TopBridgePrinterError,
  TopBridgeTemplateError,
  TopBridgeNetworkError,
  TopBridgeSourceError,
} from '@appzgatenz/label-print-topbridge-js'

// Types (import on demand)
import type {
  TopBridgeClientConfig,
  TopBridgeSource,
  Logger,
  SdkWarning,
  HealthResponse,
  HealthData,
  BenefitsResponse,
  BenefitsData,
  PrintersResponse,
  PrintersData,
  SyncedPrinter,
  TemplatesListResponse,
  TemplatesListData,
  TemplateItem,
  TemplateSchemaResponse,
  TemplateSchema,
  TemplateFieldSchema,
  PrintResponse,
  PrintData,
  PrintExecuteRequest,
  PrintProductInput,
  PreflightResult,
  PreflightOptions,
  PreflightStep,
  EnsureRunningOptions,
} from '@appzgatenz/label-print-topbridge-js'
```
