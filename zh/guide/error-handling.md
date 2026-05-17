---
title: 错误处理
---

# 错误处理

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
└── TopBridgeSourceError         source 缺失或不在白名单
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
    // source 不在白名单
  }
  else if (err instanceof TopBridgeValidationError) {
    // 输入校验失败
  }
  else if (err instanceof TopBridgePrintError) {
    // 其他打印失败
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
