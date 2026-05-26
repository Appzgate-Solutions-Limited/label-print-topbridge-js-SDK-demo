---
title: 完整集成教程
---

# 完整集成教程

本节通过一个端到端的示例，逐步演示如何从零集成标签打印功能。

## 第一步：预检（Preflight） {#step-1-preflight}

在执行打印之前，需要确认三件事：TopBridge App 在运行且用户已登录、权益有效、打印机可用。`preflight.run()` 一次性完成这些检查。

> **前置条件**：需安装 TopBridge App >= 1.0.45（[下载](https://service.topsale.co.nz/self-service/download/topbridge)）。

:::tip 更倾向免代码方案？
[试试 TOPSALE 标签打印方案](https://topsale.biz/solution/label-printing/) —— 无需任何开发，几分钟即可开始打印标签。
:::

> `preflight` 是推荐的最佳实践但非强制——你也可以直接调用 `print.execute()`。不过，使用 preflight 可以在打印前提前发现并处理问题，提供更好的用户体验。
>
> 注意：`preflight.run()` 不会自动唤起 TopBridge App。如需自动唤起，使用 `client.launch.ensureRunning()` 包装。

```typescript
try {
  // 使用 ensureRunning 包装，自动处理 TopBridge App 唤起和重试
  const preflight = await client.launch.ensureRunning(
    () => client.preflight.run({
      onStepChange: (step) => {
        console.log(`正在检查: ${step}`)  // health → benefits → printers
      }
    }),
    { onLaunching: () => console.log('正在启动 TopBridge...') }
  )

  const { health, benefits, printers } = preflight
  // 预期输出:
  // {
  //   health: { status: 'ok', data: { isLoggedIn: true, version: '1.0.45' } },
  //   benefits: { status: 'ok', data: { isValid: true, remainingPrints: -1 } },
  //   printers: { status: 'ok', data: { count: 1, defaultPrinter: 'TSC DA220', printers: [...] } }
  // }
} catch (err) {
  // 预检失败，根据错误类型处理（见错误处理）
}
```

**预检执行流程**：

```
preflight.run()
  ├─ health.check()                   ← 纯健康检查，不自动唤起
  │    ├─ 成功 → 继续
  │    └─ 失败 → 抛 TopBridgeConnectionError / TopBridgeAuthError
  ├─ benefits.check()                 ← 权益验证
  │    ├─ 有效 → 继续
  │    └─ 无效 → 抛 TopBridgeQuotaError
  └─ printers.list()                  ← 获取打印机
       ├─ 有打印机 → 返回 PreflightResult
       └─ 无打印机 → 抛 TopBridgePrinterError
```

## 第二步：获取模板 {#step-2-get-templates}

预检通过后，获取可用的标签模板：

```typescript
const templatesResult = await client.templates.list()

// 预期输出:
// {
//   status: 'ok',
//   data: {
//     count: 2,
//     templates: [
//       { id: '1', code: 'PRICE_LABEL', name: 'Price Label 40x30', isEnabled: true },
//       { id: '2', code: 'SHIPPING_LABEL', name: 'Shipping Label 100x150', isEnabled: true }
//     ]
//   }
// }
```

可选：获取模板的详细字段定义，了解需要提供哪些数据：

```typescript
const schema = await client.templates.schema('PRICE_LABEL')

// 预期输出:
// {
//   status: 'ok',
//   data: {
//     templateId: 'template-id-1',
//     code: 'PRICE_LABEL',
//     name: '价格标签',
//     fields: [
//       { name: 'name', type: 'text', required: true },
//       { name: 'price', type: 'price', required: true,
//         subFields: [
//           { name: 'value', type: 'text', required: true },
//           { name: 'currency', type: 'text' },
//           { name: 'unit', type: 'text' },
//         ]
//       },
//       { name: 'barcode', type: 'barcode', required: false },
//       { name: 'copies', type: 'integer', required: false, default: 1 }
//     ]
//   }
// }
```

> 使用 `templates.schema()` 在需要动态构建打印表单时特别有用。详见 [Widget 类型](/zh/guide/widgets)了解 fieldType 详情。

## 第三步：执行打印 {#step-3-execute-print}

使用预检获得的打印机和模板信息，构建打印请求：

```typescript
// 输入: 产品数据
const result = await client.print.execute({
  template: 'PRICE_LABEL',
  printer: preflight.printers.data.defaultPrinter,
  products: [
    { name: 'Apple', price: { value: 3.99, currency: '$', unit: '/kg' }, copies: 2 },
    { name: 'Banana', price: { value: 1.99, currency: '$' }, copies: 1 },
  ],
})

// 预期输出:
// {
//   status: 'ok',
//   message: 'Printed successfully',
//   data: {
//     printedCopies: 3,
//     jobId: 'job-123',
//     templateName: 'Price Label 40x30'
//   }
// }
```

**关键点**：

- `products` 是 JSON 对象，SDK 自动获取模板 schema 并根据 fieldType 转换数据
- `template` 可以传模板 ID（`'1'`）或 Code（`'PRICE_LABEL'`）
- `printer` 传打印机名称字符串
- `copies` 默认为 1，范围 [1, 9999]
- 无需传 `fieldTypes`——SDK 自动处理数据转换

## 完整示例

以下是一个可以在浏览器中直接运行的完整示例：

```typescript
import {
  TopBridgeClient,
  TopBridgeConnectionError,
  TopBridgeAuthError,
  TopBridgeQuotaError,
  TopBridgePrinterError,
  TopBridgePrintError,
} from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient({ debug: true })

async function printPriceLabels() {
  try {
    // 1. 确保 TopBridge App 运行 + 预检
    const preflight = await client.launch.ensureRunning(
      () => client.preflight.run({
        onStepChange: (step) => console.log(`检查: ${step}`)
      }),
      { onLaunching: () => console.log('正在启动 TopBridge...') }
    )

    // 2. 执行打印
    const result = await client.print.execute({
      template: 'PRICE_LABEL',
      printer: preflight.printers.data.defaultPrinter,
      products: [
        { name: 'Apple', price: { value: 3.99, currency: '$', unit: '/kg' }, copies: 2 },
        { name: 'Banana', price: { value: 1.99, currency: '$' }, copies: 1 },
      ],
    })

    console.log(`打印成功: ${result.data.printedCopies} 份`)

  } catch (err) {
    if (err instanceof TopBridgeConnectionError) {
      console.error('无法连接到 TopBridge，请确认桌面应用已启动')
    } else if (err instanceof TopBridgeAuthError) {
      if (err.code === 'UPDATE_REQUIRED') {
        console.error('TopBridge 版本过低，请更新')
        const updateUrl = err.storeUrl ?? err.downloadUrl
        if (updateUrl) window.open(updateUrl)
      } else {
        console.error('请先登录 TopBridge App')
      }
    } else if (err instanceof TopBridgeQuotaError) {
      console.error('打印配额不足:', err.reason)
    } else if (err instanceof TopBridgePrinterError) {
      console.error('打印机错误，请在 TopBridge App 中检查打印机配置')
    } else if (err instanceof TopBridgePrintError) {
      console.error('打印失败:', err.message)
    } else {
      console.error('未知错误:', err)
    }
  }
}

printPriceLabels()
```
