---
title: 安装与初始化
---

# 快速开始

## 安装

```bash
npm install @appzgatenz/label-print-topbridge-js
```

:::tip
`@appzgatenz/label-print-topbridge-js@0.6.2` 已发布到 npm。本站文档所述 API 已稳定；从 0.5.x 升级请参阅[迁移指南](/zh/guide/migration-0.6)。
:::

## 前置条件

| # | 条件 | 说明 |
|---|------|------|
| 1 | 支持 WebSocket 的现代浏览器 | Chrome、Firefox、Safari、Edge（ES2020+） |
| 2 | 已安装 TopBridge App | [下载](https://service.topsale.co.nz/self-service/download/topbridge) |
| 3 | TopBridge App 正在运行 | 健康检查返回 `pong` |
| 4 | 用户已登录 TopBridge App | `data.isLoggedIn === true` |
| 5 | 打印权益有效 | 权益验证通过 |
| 6 | 至少一台打印机已配置协议（TSPL/ZPL） | 打印机列表非空 |
| 7 | TopBridge App 版本兼容 | 健康检查返回 `pong` |
| 8 | CSP 允许 `topsale:` 协议（使用 launch 时） | 详见 [CSP 配置](/zh/guide/csp) |

:::tip 不想写代码？
试试 [TOPSALE 标签打印方案](https://topsale.biz/solution/label-printing/)，无需集成即可使用。
:::

## 初始化

```typescript
import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient()
```

SDK 默认自动连接本地 TopBridge App。设置 `wssEnabled: true` 可使用固定安全（WSS）端点。

## 完整打印流程

```typescript
// 0. 可选：确保 TopBridge App 正在运行
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
    { name: 'Apple', price: { value: 3.99, currency: '$', unit: '/kg' }, copies: 2 },
    { name: 'Banana', price: { value: 1.99, currency: '$' }, copies: 1 },
  ],
})

console.log(`已打印 ${result.data.printedCopies} 份`)
```

> SDK 会自动获取模板 schema 并转换产品数据，无需手动指定字段类型。

会话限制、打印机配置与推送事件详见 [API 速查表](/zh/guide/api-reference) 与 [迁移到 0.6](/zh/guide/migration-0.6)。专题指南将在后续更新中提供。

## 配置选项

```typescript
const client = new TopBridgeClient({
  source: 'Core-SDK',              // SDK 来源标识（默认值）
  debug: true,                     // 开启控制台日志
  wssEnabled: false,               // 使用固定 WSS 端点
  logger: customLogger,            // 自定义日志实现
  timeouts: {
    health: 3000,                  // 健康检查超时（ms）
    preflight: 10000,              // 预检 / 模板查询超时（ms）
    print: 60000,                  // 打印超时（ms）
    printerSetup: 10000,           // 打印机配置超时（ms）
    refresh: 30000,                // 模板/权益强制刷新超时（ms）
  },
})
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `'Core-SDK' \| 'React-SDK' \| 'Nextjs-SDK'` | `'Core-SDK'` | SDK 来源标识（供上层包装 SDK 使用） |
| `debug` | `boolean` | `false` | 开启控制台日志（前缀：`[TopBridge]`） |
| `wssEnabled` | `boolean` | `false` | 使用固定 WSS 端点（不接受自定义 URL） |
| `logger` | `Logger` | 静默（no-op） | 自定义日志实现 |
| `timeouts.health` | `number`（ms） | `3000` | 健康检查超时 |
| `timeouts.preflight` | `number`（ms） | `10000` | 预检 / 模板查询超时 |
| `timeouts.print` | `number`（ms） | `60000` | 打印执行超时 |
| `timeouts.printerSetup` | `number`（ms） | `10000` | 打印机配置超时 |
| `timeouts.refresh` | `number`（ms） | `30000` | 模板/权益强制刷新超时 |

### Logger

```typescript
interface Logger {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}
```

日志优先级：自定义 `logger` > `debug: true` 控制台日志 > 静默（默认）。

## 错误处理

```typescript
import {
  TopBridgeConnectionError,
  TopBridgeAuthError,
  TopBridgeVersionError,
  TopBridgeQuotaError,
  TopBridgePrintError,
  TopBridgeConfigError,
  TopBridgeValidationError,
  TopBridgePrinterError,
  TopBridgePrinterSetupError,
  TopBridgeTemplateError,
  TopBridgeNetworkError,
  TopBridgeSourceError,
  TopBridgeSessionError,
} from '@appzgatenz/label-print-topbridge-js'

try {
  await client.print.execute({ /* ... */ })
} catch (err) {
  if (err instanceof TopBridgeConnectionError) {
    // TopBridge App 未运行或连接超时
  } else if (err instanceof TopBridgeAuthError) {
    // 未登录
  } else if (err instanceof TopBridgeVersionError) {
    // 版本过低 — 用 err.storeUrl / err.downloadUrl 引导更新
  } else if (err instanceof TopBridgeSessionError) {
    // 会话超限 — 渲染 err.sessions，再调用 kickSession
  } else if (err instanceof TopBridgeQuotaError) {
    // 权益无效或配额耗尽
  } else if (err instanceof TopBridgePrinterError) {
    // 打印机离线或未配置协议
  } else if (err instanceof TopBridgePrinterSetupError) {
    // 打印机配置 CRUD 失败 — 查看 err.code
  } else if (err instanceof TopBridgeTemplateError) {
    // 模板不存在或无权限
  } else if (err instanceof TopBridgeNetworkError) {
    // Tray App 在线，但云端网络断开
  } else if (err instanceof TopBridgeSourceError) {
    // source 不被 TopBridge App 识别
  } else if (err instanceof TopBridgeValidationError) {
    // 输入校验失败 — err.field 指向具体字段
  } else if (err instanceof TopBridgePrintError) {
    // 打印失败
  } else if (err instanceof TopBridgeConfigError) {
    // 客户端配置错误
  }
}
```

完整说明见 [错误处理](/zh/guide/error-handling)。
