---
title: 安装与初始化
---

# 快速开始

## 安装

```bash
npm install @appzgatenz/label-print-topbridge-js
```

## 前置条件

| # | 条件 | 说明 |
|---|------|------|
| 1 | 支持 WebSocket 的现代浏览器 | Chrome 16+, Firefox 11+, Safari 7+, Edge 12+ |
| 2 | Topbridge App >= 1.0.45 已安装 | [下载](https://service.topsale.co.nz/self-service/download/topbridge) |
| 3 | Topbridge App 正在运行 | 健康检查返回 `pong` |
| 4 | 用户已登录 Topbridge App | `data.isLoggedIn === true` |
| 5 | 打印权益有效 | 权益验证通过 |
| 6 | 至少一台打印机已配置协议（TSPL/ZPL） | 打印机列表非空 |
| 7 | CSP 允许 `topsale:` 协议（使用 launch 时） | 详见 [CSP 配置](/zh/guide/csp) |

:::tip 不想写代码？
试试 [TopSale 标签打印方案](https://topsale.biz/solution/label-printing/)，无需集成即可使用。
:::

## 初始化

```typescript
import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient()
```

SDK 通过本地 WebSocket 与 Topbridge App 通信，无需配置。

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
  source: 'Core-SDK',             // SDK 来源标识
  debug: true,                     // 开启控制台日志
  logger: customLogger,            // 自定义日志器实现
  timeouts: {
    health: 3000,                  // 健康检查超时（ms）
    preflight: 10000,              // 预检超时（ms）
    print: 60000,                  // 打印超时（ms）
  },
})
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `'Core-SDK' \| 'React-SDK' \| 'Nextjs-SDK'` | `'Core-SDK'` | SDK 来源标识 |
| `debug` | `boolean` | `false` | 启用控制台日志（前缀：`[TopBridge]`） |
| `logger` | `Logger` | 静默（空操作） | 自定义日志器实现 |
| `timeouts.health` | `number` (ms) | `3000` | 健康检查超时 |
| `timeouts.preflight` | `number` (ms) | `10000` | 预检 / 模板查询超时 |
| `timeouts.print` | `number` (ms) | `60000` | 打印执行超时 |

### Logger

你可以提供自定义日志器，对接监控服务（如 Sentry、Datadog）：

```typescript
interface Logger {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}
```

日志器优先级：自定义 `logger` > `debug: true` 控制台日志 > 静默（默认）。

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
    // 来源验证失败
  } else if (err instanceof TopBridgePrintError) {
    // 打印失败
  }
}
```

完整错误处理参考请见[错误处理](/zh/guide/error-handling)。
