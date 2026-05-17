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
| `launch` | [`trigger()`](/guide/launch-module#trigger) | `void` | Trigger Topbridge App launch |
| `launch` | [`ensureRunning(fn, options?)`](/guide/launch-module#ensurerunning-fn-options) | `Promise<T>` | Launch + retry orchestration |

### PrintExecuteRequest

```typescript
interface PrintExecuteRequest {
  template: string             // Template ID or Code
  printer: string              // Printer name
  products: PrintProductInput[] // Product data array
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

## Export List {#export-list}

```typescript
// Classes
import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'
import { LaunchModule } from '@appzgatenz/label-print-topbridge-js'

// Error Classes (10 total)
import {
  TopBridgeError,
  TopBridgeConnectionError,
  TopBridgeAuthError,
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
