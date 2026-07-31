---
title: API 速查表
---

# API 速查表

## 模块方法 {#module-methods}

| 模块 | 方法 | 返回类型 | 说明 |
|------|------|----------|------|
| `health` | `check()` | `Promise<HealthResponse>` | 健康检查 |
| `whoami` | `check()` | `Promise<WhoAmIResponse>` | 当前登录状态 |
| `benefits` | `check()` | `Promise<BenefitsResponse>` | 权益校验 |
| `benefits` | `refreshBenefit()` | `Promise<BenefitsResponse>` | 强制刷新权益缓存 |
| `printers` | `list()` | `Promise<PrintersResponse>` | 打印机列表 |
| `templates` | `list()` | `Promise<TemplatesListResponse>` | 模板列表 |
| `templates` | `schema(template)` | `Promise<TemplateSchemaResponse>` | 模板字段定义 |
| `templates` | `json(templateIds)` | `Promise<TemplatesJsonResponse>` | 批量获取模板 JSON |
| `templates` | `refreshTemplates(...)` | overload | 强制同步模板缓存 |
| `print` | `execute(request)` | `Promise<PrintResponse>` | 执行打印 |
| `preflight` | `run(options?)` | `Promise<PreflightResult>` | 预检编排 |
| `launch` | `trigger()` | `void` | 触发 TopBridge App 唤起 |
| `launch` | `ensureRunning(fn, options?)` | `Promise<T>` | 唤起 + 重试编排 |
| `printerSetup` | `load()` | `Promise<PrinterSetupLoadResult>` | 选项 + 已安装打印机 |
| `printerSetup` | `configure(req, opts?)` | `Promise<ConfigureResult>` | 保存协议配置（可能等待 BPAC） |
| `printerSetup` | `getOptions()` / `listInstalled()` / `getBpacStatus()` | `Promise<SdkResponse<...>>` | 读取配置字典 / 状态 |
| `printerSetup` | `addCharset()` / `deleteCharset()` / `addFont()` / `deleteFont()` | `Promise<SdkResponse<...>>` | 字符集 / 字体 CRUD |
| `printerSetup` | `reset(printerName)` | `Promise<ResetPrinterResult>` | 清除协议配置（不改默认打印机） |
| `session` | `kickSession(sessionIds)` | `Promise<KickSessionResponse>` | 踢出会话以清除 SessionBlocked |
| `client` | `connect()` / `close()` / `getConnectionState()` | — | 共享连接生命周期 |
| `client.events` | `on(name, handler)` / `off(name, handler)` | unsubscribe / void | 推送 + 连接事件 |

:::tip
`printerSetup` 与 `events` 的深度指南即将推出。Session 超限流程见交互式 [Session 管理示例](/zh/examples/session-management)。其余内容可结合本表与 [迁移指南](/zh/guide/migration-0.6) 使用。
:::

### TopBridgeClientConfig

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `'Core-SDK' \| 'React-SDK' \| 'Nextjs-SDK'` | `'Core-SDK'` | SDK 来源标识 |
| `debug` | `boolean` | `false` | 开启控制台日志 |
| `logger` | `Logger` | 静默（no-op） | 自定义日志 |
| `wssEnabled` | `boolean` | `false` | 使用固定 WSS 端点 |
| `timeouts.health` | `number`（ms） | `3000` | 健康检查超时 |
| `timeouts.preflight` | `number`（ms） | `10000` | 预检 / 模板查询超时 |
| `timeouts.print` | `number`（ms） | `60000` | 打印超时 |
| `timeouts.printerSetup` | `number`（ms） | `10000` | 打印机配置超时 |
| `timeouts.refresh` | `number`（ms） | `30000` | 强制刷新超时 |

```typescript
import type { TopBridgeClientConfig } from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient({
  debug: true,
  timeouts: { health: 5000, print: 120000, refresh: 45000 },
})
```

### PrintExecuteRequest

```typescript
interface PrintExecuteRequest {
  template: string             // 模板 ID 或 Code
  printer: string              // 打印机名称
  products: PrintProductInput[] // 产品数据数组
}
```

### PrintProductInput

```typescript
interface PrintProductInput {
  [key: string]: string | number | Record<string, string | number | undefined> | undefined
  copies?: number  // 打印份数，范围 [1, 9999]，默认 1
}
```

### SyncedPrinter

```typescript
interface SyncedPrinter {
  name: string               // 打印机名称（用作 printer 参数）
  isDefault: boolean         // 是否默认打印机
  protocol?: 'TSPL' | 'ZPL' // 标签协议
}
```

### 事件名（`client.events`）

| 事件 | Payload | 说明 |
|------|---------|------|
| `printer` | `PrinterEvent` | 打印机 / BPAC 相关推送 |
| `template` | `TemplateEvent` | 模板变更推送 |
| `user` | `UserEvent` | 用户 / 登录相关推送 |
| `open` | `ConnectionLifecycleEvent` | 共享连接已打开 |
| `reconnect` | `ConnectionLifecycleEvent` | 共享连接已重连 |
| `close` | `ConnectionLifecycleEvent` | 共享连接已关闭 |
| `error` | `ConnectionLifecycleEvent` | 共享连接错误 |

```typescript
const off = client.events.on('printer', (event) => {
  console.log(event)
})
// 稍后
off()
// 或
client.events.off('printer', handler)
```

### Session 限流与强制刷新

```typescript
// Session 超限解除：捕获 SESSION_LIMIT_EXCEEDED，踢出旧会话，重试。
try {
  await client.templates.list()
} catch (err) {
  if (err instanceof TopBridgeSessionError) {
    // err.sessions[]——用于渲染选择 UI；isCurrent 标记当前设备（勿踢）
    const toKick = (err.sessions ?? []).filter((s) => !s.isCurrent).map((s) => s.id)
    const result = await client.session.kickSession(toKick)
    if (result.data.withinLimit) {
      await client.templates.list() // 阻断已解除——无需重新登录
    }
  }
}

// 强制刷新权益缓存（购买/升级后）；isValid===false 抛 TopBridgeQuotaError。
const benefits = await client.benefits.refreshBenefit()

// 强制同步模板——全量模式（无参）与指定 ID 模式（校验 loggedAccount）。
await client.templates.refreshTemplates()
await client.templates.refreshTemplates({
  templateIds: ['tpl-1', 'tpl-2'],  // 也兼容单个字符串
  loggedAccount: 'user@example.com', // 必须与当前 TopBridge 登录账号一致
})
```

| API | 关键行为 |
|-----|----------|
| `session.kickSession(ids)` | 无状态透传；`withinLimit === true` → 阻断已解除；逐个失败归入 `failedSessionIds`（从不返回 `SESSION_NOT_FOUND`） |
| `benefits.refreshBenefit()` | 绕过本地缓存；结构与 `check()` 一致；`isValid === false` 抛 `TopBridgeQuotaError` |
| `templates.refreshTemplates()` | 全量同步（无参）与指定 ID 同步（`{ templateIds, loggedAccount }`）；账号不一致返回 `ACCOUNT_MISMATCH` |

### 打印机协议选项

`printerSetup.getOptions()` 返回协议字典，用于渲染下拉框：

```typescript
interface PrinterOptionsData {
  TSPL: { label: string; charsets: PrinterCharsetOption[] }
  ZPL: { label: string; charsets: PrinterCharsetOption[] }
  BPAC: { label: string; sdkInstalled: boolean; paperColors: BpacOption[]; fonts: BpacOption[] }
  UNKNOWN: { label: string } // 未配置打印机哨兵
}
```

`UNKNOWN` 是未配置打印机的哨兵值——与 `TSPL`/`ZPL`/`BPAC` 一并渲染，确保下拉框始终有合法选项。各协议的 `label` 是可直接展示的文案。`reset(printerName)` 会将打印机恢复到此 `UNKNOWN` 状态。

## 响应类型 {#response-types}

| 类型 | 关键字段 |
|------|----------|
| `HealthResponse` | `type: 'pong'`、`isRunning: true`、`data.isLoggedIn`、`data.version?`、`data.networkStatus?` |
| `WhoAmIResponse` | `data.isLoggedIn`、`data.loggedAccount?`、`data.userId?` |
| `BenefitsResponse` | `data.isValid`、`data.remainingPrints`、`data.expiresAt`、`data.reason`、`data.hasPrintBenefit`、`data.hasSessionBenefit` |
| `PrintersResponse` | `data.count`、`data.defaultPrinter`、`data.printers[]` |
| `TemplatesListResponse` | `data.count`、`data.templates[]` |
| `TemplateSchemaResponse` | `data.fields[]`、`data.code`、`data.name` |
| `TemplatesJsonResponse` | 批量模板 JSON 载荷 |
| `PrintResponse` | `message`、`data.printedCopies`、`data.jobId`、`data.templateName`、`data.userId?`、`details?`、`warnings?` |
| `KickSessionResponse` | `data.withinLimit`、`data.kickedSessionIds[]`、`data.failedSessionIds[]`、`data.sessions[]` |
| `PreflightResult` | `health`、`benefits`、`printers` |
| `ConfigureResult` | 打印机配置结果（可能含 BPAC 安装结果） |

### SdkResponse\<T\> {#sdk-response}

```typescript
interface SdkResponse<T> {
  status: 'ok' | 'warning'
  requestId?: string
  data: T
  message: string
  details?: unknown
  warnings?: SdkWarning[]
}
```

| 状态 | 行为 |
|------|------|
| `'ok'` | 成功，使用 `data` |
| `'warning'` | 成功但有提示，`data` 仍可用 |
| *(error)* | 抛出 `TopBridgeError` 子类 |

## 导出清单 {#export-list}

```typescript
// 类
import { TopBridgeClient, LaunchModule, PrinterSetupModule } from '@appzgatenz/label-print-topbridge-js'

// 错误类（1 基类 + 13 子类）
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
  TopBridgePrinterSetupError,
  TopBridgeSessionError,
} from '@appzgatenz/label-print-topbridge-js'

// 类型（按需导入）
import type {
  TopBridgeClientConfig,
  TopBridgeSource,
  Logger,
  SdkWarning,
  V2WarningCode,
  SdkEvents,
  HealthResponse,
  WhoAmIResponse,
  BenefitsResponse,
  PrintersResponse,
  SyncedPrinter,
  TemplatesListResponse,
  TemplateSchemaResponse,
  TemplatesJsonResponse,
  PrintResponse,
  PrintExecuteRequest,
  PrintProductInput,
  PreflightResult,
  PreflightOptions,
  EnsureRunningOptions,
  PrinterSetupLoadResult,
  ConfigureResult,
  ConfigureOptions,
  KickSessionResponse,
  SessionInfo,
  SdkEventMap,
  ConnectionState,
  PrinterSetupErrorCode,
} from '@appzgatenz/label-print-topbridge-js'
```
