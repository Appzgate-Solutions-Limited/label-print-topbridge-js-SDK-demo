---
title: 安装与初始化
---

# 快速开始

## 安装

```bash
npm install @appzgatenz/label-print-topbridge-js
```

## 前置条件

- **Topbridge App** >= 1.0.45 已安装并运行 — [下载](https://service.topsale.co.nz/self-service/download/topbridge)
- 浏览器支持 WebSocket（所有现代浏览器）
- 至少一台已配置协议（TSPL / ZPL）的标签打印机
- 如使用 `launch.trigger()`，页面 CSP 需允许 `topsale:` 自定义协议 — 详见 [CSP 配置](/zh/guide/csp)

## 初始化

```typescript
import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient()
```

SDK 连接 `ws://localhost:8765`（内部自动拼接 `/v2`），无需任何配置。

## 完整打印流程

```typescript
// 0. 可选：确保 Topbridge App 正在运行
const { printers } = await client.launch.ensureRunning(
  () => client.preflight.run({
    onStepChange: (step) => console.log(`正在检查 ${step}...`)
  })
)

// 或直接运行预检（不自动唤起）
// const { printers } = await client.preflight.run()

// 1. 获取可用模板
const templates = await client.templates.list()

// 2. 可选：获取模板字段定义
const schema = await client.templates.schema('PRICE_LABEL')

// 3. 执行打印
const result = await client.print.execute({
  template: 'PRICE_LABEL',       // 模板 ID 或 Code
  printer: 'TSC DA220',          // 打印机名称
  products: [
    { name: 'Apple', price: 3.99, currency: '$', unit: '/kg', copies: 2 },
    { name: 'Banana', price: 1.99, currency: '$', copies: 1 },
  ],
})

console.log(`已打印 ${result.data.printedCopies} 份`)
```

> SDK 自动获取模板 schema 并转换产品数据，无需手动指定字段类型。

## 配置选项

```typescript
const client = new TopBridgeClient({
  debug: true,                     // 开启日志
  timeouts: {
    health: 3000,                  // 健康检查超时（ms）
    preflight: 10000,              // 预检超时（ms）
    print: 60000,                  // 打印超时（ms）
  },
})
```

## 错误处理

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
    // Topbridge App 未运行或连接超时
  } else if (err instanceof TopBridgeAuthError) {
    // 未登录或需要更新
    if (err.code === 'UPDATE_REQUIRED') {
      window.open(err.storeUrl) // 引导用户更新
    }
  } else if (err instanceof TopBridgeQuotaError) {
    // 权益无效或配额耗尽
  } else if (err instanceof TopBridgePrinterError) {
    // 打印机离线或未配置协议
  } else if (err instanceof TopBridgeTemplateError) {
    // 模板不存在或无权限
  } else if (err instanceof TopBridgeNetworkError) {
    // Topbridge App 在线，但云端网络断开
  } else if (err instanceof TopBridgeSourceError) {
    // source 不在白名单
  } else if (err instanceof TopBridgePrintError) {
    // 打印失败
  }
}
```

完整错误处理参考请见[错误处理](/zh/guide/error-handling)。
