---
title: 错误处理
---

# 错误处理

## 整体设计思路

SDK 采用**分层继承 + 协议错误码 + 结构化元数据**的三层模型处理错误：

1. **分层继承**：所有错误继承自 `TopBridgeError`（再继承原生 `Error`），并按业务领域划分为 9 个子类。这种设计的优势是：
   - 调用方可以用 `instanceof` 精确捕获特定错误
   - TypeScript 会自动窄化类型，无需额外类型断言
   - 错误语义与业务场景一一对应，降低认知成本

2. **协议错误码**：底层 V2 WebSocket 协议返回的 `code` 字段（如 `NOT_AUTHENTICATED`、`UPDATE_REQUIRED`）会被映射到对应错误类，同时保留在 `error.code` 上，方便程序化判断。

3. **结构化元数据**：每个错误对象除 `message` 和 `name` 外，还包含：
   - `code?` — 协议层错误码
   - `details?` — 扩展详情（任意类型，视具体错误而定）
   - 子类专属字段 — 如 `TopBridgeAuthError.storeUrl`、`TopBridgeQuotaError.reason`、`TopBridgeValidationError.field`

## 错误类层次

所有 SDK 错误继承自 `TopBridgeError` 基类：

```
TopBridgeError (基类)
├── TopBridgeConnectionError     连接失败 / 超时 / Topbridge App 未运行
├── TopBridgeAuthError           认证或版本问题
│     .code: 'NOT_AUTHENTICATED' | 'UPDATE_REQUIRED'
│     .storeUrl?: string         更新链接（仅 UPDATE_REQUIRED）
│     .downloadUrl?: string      下载链接（仅 UPDATE_REQUIRED）
├── TopBridgeQuotaError          权益无效 / 配额耗尽
│     .reason?: string           具体原因
├── TopBridgePrintError          打印失败（未命中特定错误码时）
│     .details?: unknown         错误详情
├── TopBridgeConfigError         配置错误
├── TopBridgeValidationError     输入校验失败
│     .field?: string            出错的字段名
├── TopBridgePrinterError        打印机离线 / 未配置协议
├── TopBridgeTemplateError       模板不存在或无权限
├── TopBridgeNetworkError        云端网络断开
└── TopBridgeSourceError         来源验证失败
```

## 使用 instanceof 进行类型安全处理

所有错误类支持 `instanceof` 检查，TypeScript 会自动窄化类型：

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
  TopBridgeValidationError,
} from '@appzgatenz/label-print-topbridge-js'

try {
  await client.print.execute({ /* ... */ })
} catch (err) {
  if (err instanceof TopBridgeConnectionError) {
    // Topbridge App 未运行或网络不通
  }
  else if (err instanceof TopBridgeAuthError) {
    if (err.code === 'NOT_AUTHENTICATED') {
      // 用户未登录
    }
    if (err.code === 'UPDATE_REQUIRED') {
      // Topbridge App 版本过低
      if (err.storeUrl) window.open(err.storeUrl)
    }
  }
  else if (err instanceof TopBridgeQuotaError) {
    // 权益无效或配额耗尽
  }
  else if (err instanceof TopBridgePrinterError) {
    // 打印机离线或未配置协议
  }
  else if (err instanceof TopBridgeTemplateError) {
    // 模板不存在或无权限
  }
  else if (err instanceof TopBridgeNetworkError) {
    // Topbridge App 在线，但云端网络断开
  }
  else if (err instanceof TopBridgeSourceError) {
    // 来源验证失败
  }
  else if (err instanceof TopBridgeValidationError) {
    // 输入校验失败
  }
  else if (err instanceof TopBridgePrintError) {
    // 其他打印失败
  }
}
```

## 获取错误详情

除了用 `instanceof` 区分错误类型，你还可以直接读取错误对象上的通用属性和子类专属属性，构建更精细的错误提示或日志上报：

```typescript
try {
  await client.print.execute({ /* ... */ })
} catch (err) {
  if (err instanceof TopBridgeError) {
    // 通用属性：所有 SDK 错误都有
    console.error('Error:', err.name, '-', err.message)
    if (err.code) console.error('Code:', err.code)
    if (err.details) console.error('Details:', err.details)

    // 子类专属属性
    if (err instanceof TopBridgeAuthError) {
      if (err.storeUrl) console.log('Store URL:', err.storeUrl)
      if (err.downloadUrl) console.log('Download URL:', err.downloadUrl)
    }
    if (err instanceof TopBridgeQuotaError) {
      if (err.reason) console.log('Quota reason:', err.reason)
    }
    if (err instanceof TopBridgeValidationError) {
      if (err.field) console.log('Invalid field:', err.field)
    }
  } else {
    // 非 SDK 错误（如运行时异常、代码 Bug）
    console.error('Unexpected error:', err)
  }
}
```

## 错误与场景对照

| 场景 | 错误类型 | 处理建议 |
|------|---------|---------|
| Topbridge App 未安装/未运行 | `TopBridgeConnectionError` | 使用 `client.launch.ensureRunning()` 自动唤起重试 |
| 用户未登录 | `TopBridgeAuthError(NOT_AUTHENTICATED)` | 引导用户登录 Topbridge App |
| Topbridge App 版本过低 | `TopBridgeAuthError(UPDATE_REQUIRED)` | 使用 `err.storeUrl` 引导更新 |
| 打印配额耗尽 | `TopBridgeQuotaError` | 展示 `err.reason`，引导续费 |
| 打印机离线 | `TopBridgePrinterError` | 检查打印机连接和协议配置 |
| 模板不存在 | `TopBridgeTemplateError` | 检查模板 ID/Code 是否正确 |
| 云端网络断开 | `TopBridgeNetworkError` | 检查网络连接 |
| products 为空 | `TopBridgeValidationError` | `err.field` 指明问题字段 |
| 打印失败（其他） | `TopBridgePrintError` | 查看 `err.details` 获取详情 |

## 警告处理

SDK 可能在成功响应中返回非致命警告，不会阻止执行：

```typescript
const result = await client.print.execute({ /* ... */ })
if (result.warnings?.length) {
  for (const w of result.warnings) {
    if (w.code === 'DATA_FORMAT' && w.reason === 'newline_truncated') {
      console.warn(`数据格式提示: ${w.message}`)
    }
  }
}
```

| code | reason | 触发条件 |
|------|--------|---------|
| `DATA_FORMAT` | `newline_truncated` | schema 中 `text` 类型的字段值包含换行符，SDK 已自动截取第一行 |

## 业界最佳实践对比

现代 JS SDK 普遍采用**"基类 + 领域子类 + 错误码"**的三层模型。以下是 TopBridge SDK 与主流 SDK 的简要对比：

| SDK | 基类设计 | 错误码机制 | 调试元数据 | 类型区分方式 |
|-----|---------|-----------|-----------|-------------|
| **AWS SDK v3** | `ServiceException` 接口 | `$metadata` + `name` | requestId, httpStatusCode, extendedRequestId | `instanceof` / `error.name` |
| **Stripe Node.js** | `StripeError` 基类 | `type` 字段 | `raw`, `headers`, `requestId`, `statusCode` | `instanceof` 子类 |
| **Twilio Node.js** | `RestException` | `code` + `status` | `moreInfo`, `details` | `instanceof` |
| **Prisma** | `PrismaClientKnownRequestError` 等 | `code`（如 `P2002`） | `meta`, `clientVersion` | `instanceof` + `code` |
| **TopBridge SDK** | `TopBridgeError` 基类 | `code`（V2 协议码） | `details`, 子类专属字段 | `instanceof` 子类 |

**结论**：TopBridge SDK 的错误处理设计与 Stripe、Prisma 处于同一水准，采用语义化的类层级、可程序化的错误码以及携带业务上下文元数据的子类字段，符合现代 JS SDK 的主流方向。
