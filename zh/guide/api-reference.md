---
title: API 速查表
---

# API 速查表

## 模块方法一览 {#module-methods}

| 模块 | 方法 | 返回类型 | 说明 |
|------|------|---------|------|
| `health` | [`check()`](/zh/guide/integration-tutorial#step-1-preflight) | `Promise<HealthResponse>` | 健康检查 |
| `benefits` | [`check()`](/zh/guide/integration-tutorial#step-1-preflight) | `Promise<BenefitsResponse>` | 权益验证 |
| `printers` | [`list()`](/zh/guide/integration-tutorial#step-1-preflight) | `Promise<PrintersResponse>` | 打印机列表 |
| `templates` | [`list()`](/zh/guide/integration-tutorial#step-2-get-templates) | `Promise<TemplatesListResponse>` | 模板列表 |
| `templates` | [`schema(template)`](/zh/guide/integration-tutorial#step-2-get-templates) | `Promise<TemplateSchemaResponse>` | 模板字段定义 |
| `print` | [`execute(request)`](/zh/guide/integration-tutorial#step-3-execute-print) | `Promise<PrintResponse>` | 执行打印 |
| `preflight` | [`run(options?)`](/zh/guide/integration-tutorial#step-1-preflight) | `Promise<PreflightResult>` | 预检编排 |
| `launch` | [`trigger()`](/zh/guide/launch-module#trigger) | `void` | 触发 Topbridge App 唤起 |
| `launch` | [`ensureRunning(fn, options?)`](/zh/guide/launch-module#ensurerunning-fn-options) | `Promise<T>` | 唤起 + 重试编排 |

### PrintExecuteRequest

```typescript
interface PrintExecuteRequest {
  template: string             // 模板 ID 或 Code
  printer: string              // 打印机名称
  products: PrintProductInput[] // 产品数据数组
}
```

## 响应类型一览 {#response-types}

| 类型 | 关键字段 |
|------|---------|
| `HealthResponse` | `type: 'pong'`, `isRunning: true`, `data.isLoggedIn`, `data.version`(可选), `data.networkStatus`(可选) |
| `BenefitsResponse` | `data.isValid`, `data.remainingPrints`, `data.expiresAt`, `data.reason`, `data.hasPrintBenefit`, `data.hasSessionBenefit` |
| `PrintersResponse` | `data.count`, `data.defaultPrinter`, `data.printers[]` |
| `TemplatesListResponse` | `data.count`, `data.templates[]` |
| `TemplateSchemaResponse` | `data.fields[]`, `data.code`, `data.name` |
| `PrintResponse` | `message`(顶层), `data.printedCopies`, `data.jobId`, `data.templateName`, `data.userId`(可选), `details`(可选), `warnings`(可选) |
| `PreflightResult` | `health`, `benefits`, `printers` |

## 导出清单 {#export-list}

```typescript
// 类
import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'
import { LaunchModule } from '@appzgatenz/label-print-topbridge-js'

// 错误类（10 个）
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

// 类型（按需导入）
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
