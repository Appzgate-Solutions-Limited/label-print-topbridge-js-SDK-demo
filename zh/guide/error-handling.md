---
title: 错误处理
---

# 错误处理

## 设计理念

SDK 采用 **Throw 通道 + Return 通道** 混合模型：

1. **Throw 通道** — 失败抛出 `TopBridgeError` 子类，用 `instanceof` 捕获。
2. **Return 通道** — 成功（`ok` / `warning`）返回 `SdkResponse<T>`；警告不阻断主流程。
3. **协议错误码** — V2 的 `code` 保留在 `error.code` 上供程序判断。
4. **结构化元数据** — 子类字段携带可直接用于 UI 的上下文（`storeUrl`、`sessions`、`field` 等）。

## 错误类层级

```
TopBridgeError（基类）
├── TopBridgeConnectionError     连接失败 / 超时 / App 未运行
├── TopBridgeAuthError           未认证
│     .code: 'NOT_AUTHENTICATED'
│     .storeUrl? / .downloadUrl?
├── TopBridgeVersionError        App 版本过低
│     .code: 'UPDATE_REQUIRED'
│     .storeUrl? / .downloadUrl?
├── TopBridgeQuotaError          权益无效 / 配额耗尽
│     .code: 'QUOTA_EXHAUSTED'
│     .reason?
├── TopBridgePrintError          打印失败（未分类服务端错误）
├── TopBridgeConfigError         客户端配置错误
├── TopBridgeValidationError     输入校验失败
│     .field?
├── TopBridgePrinterError        打印机离线 / 未配置
│     .code: 'PRINTER_OFFLINE' | 'PRINTER_NOT_CONFIGURED'
├── TopBridgeTemplateError       模板不存在
│     .code: 'TEMPLATE_NOT_FOUND'
├── TopBridgeNetworkError        云端网络断开
│     .code: 'NETWORK_DISCONNECTED'
├── TopBridgeSourceError         source 未被识别
│     .code: 'INVALID_SOURCE'
├── TopBridgePrinterSetupError   打印机配置 CRUD 失败
│     .code: PrinterSetupErrorCode
└── TopBridgeSessionError        会话超限（SessionBlocked）
      .code: 'SESSION_LIMIT_EXCEEDED'
      .limit? / .usedSessions? / .sessions?
```

:::warning 相对旧文档的破坏性变更
`UPDATE_REQUIRED` 对应 **`TopBridgeVersionError`**，不再是 `TopBridgeAuthError`。请更新原先写在 `AuthError` 下的 `err.code === 'UPDATE_REQUIRED'` 判断。
:::

## 用 instanceof 做类型安全处理

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
    // App 未运行 — 可考虑 client.launch.ensureRunning()
  } else if (err instanceof TopBridgeAuthError) {
    // 用户未登录
  } else if (err instanceof TopBridgeVersionError) {
    if (err.storeUrl) window.open(err.storeUrl)
  } else if (err instanceof TopBridgeSessionError) {
    // 渲染 err.sessions，然后：
    // await client.session.kickSession(err.sessions.map(s => s.id))
    // 重试原调用 — 无需重新登录
  } else if (err instanceof TopBridgeQuotaError) {
    // 展示 err.reason
  } else if (err instanceof TopBridgePrinterError) {
    // 离线或未配置协议
  } else if (err instanceof TopBridgePrinterSetupError) {
    // 按 err.code 区分 charset/font/打印机配置失败
  } else if (err instanceof TopBridgeTemplateError) {
    // 模板不存在
  } else if (err instanceof TopBridgeNetworkError) {
    // 云端断开
  } else if (err instanceof TopBridgeSourceError) {
    // 非法 source
  } else if (err instanceof TopBridgeValidationError) {
    // err.field 指向问题字段
  } else if (err instanceof TopBridgePrintError) {
    // 其他打印失败
  }
}
```

:::info 为什么 catch 链中没有 `TopBridgeConfigError`？
`TopBridgeConfigError` 表示编程错误（构造参数非法），不是需要运行时捕获和处理的故障。在开发阶段修复即可，无需加入 `catch` 链。
:::

## 场景对照表 {#error-to-scenario-mapping}

| 场景 | 错误类型 | 建议处理 |
|------|----------|----------|
| App 未安装 / 未运行 | `TopBridgeConnectionError` | `client.launch.ensureRunning()` |
| 用户未登录 | `TopBridgeAuthError` | 引导在 TopBridge App 登录 |
| App 版本过低 | `TopBridgeVersionError` | 打开 `err.storeUrl` / `err.downloadUrl` |
| 会话超限 | `TopBridgeSessionError` | 展示 `err.sessions`，调用 `kickSession` 后重试 |
| 打印配额耗尽 | `TopBridgeQuotaError` | 展示 `err.reason` |
| SDK 配置非法 | `TopBridgeConfigError` | 检查 `source` / 构造参数 |
| 打印机离线 / 未配置 | `TopBridgePrinterError` | 检查连接与协议 |
| 打印机配置 CRUD 失败 | `TopBridgePrinterSetupError` | 按 `err.code` 分支 |
| 模板不存在 | `TopBridgeTemplateError` | 检查模板 ID/Code |
| 云端网络断开 | `TopBridgeNetworkError` | 检查网络 |
| source 未被识别 | `TopBridgeSourceError` | 检查 SDK `source` 配置 |
| products / 参数非法 | `TopBridgeValidationError` | 修复 `err.field` |
| 打印失败（其他） | `TopBridgePrintError` | 查看 `err.details` |

## 警告处理 {#warning-handling}

```typescript
const result = await client.print.execute({ /* ... */ })
if (result.warnings?.length) {
  for (const w of result.warnings) {
    switch (w.code) {
      case 'DPI_MISMATCH':
        console.warn(`DPI 不匹配: ${w.message}`)
        break
      case 'SIZE_MISMATCH':
        console.warn(`尺寸不匹配: ${w.message}`)
        break
      case 'DATA_FORMAT':
        console.warn(`数据格式提示: ${w.message}`)
        break
    }
  }
}
```

| code | reason | 触发条件 |
|------|--------|---------|
| `DPI_MISMATCH` | `dpi_mismatch` | 打印机 DPI 与模板预设 DPI 不匹配，可能导致打印内容的缩放或对齐发生偏移 |
| `SIZE_MISMATCH` | `size_mismatch` | 模板设计的尺寸与打印机当前装载的物理介质尺寸不匹配，可能导致内容被截断或发生偏移（目前仅针对 Brother 打印机有效） |
| `DATA_FORMAT` | `newline_truncated` | schema 中 `text` 类型的字段值包含换行符，SDK 已自动截取第一行 |

## 行业对照

| SDK | 基类 | 错误码 | 类型判别 |
|-----|------|--------|----------|
| Stripe Node.js | `StripeError` | `type` | `instanceof` 子类 |
| Prisma | known request errors | `code`（如 `P2002`） | `instanceof` + `code` |
| **TopBridge SDK** | `TopBridgeError` | V2 协议 `code` | `instanceof` 子类 |
