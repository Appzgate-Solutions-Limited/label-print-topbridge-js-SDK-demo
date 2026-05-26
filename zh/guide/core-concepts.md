---
title: 核心概念
---

# 核心概念

## 模块化架构

`TopBridgeClient` 包含 7 个功能模块，每个模块负责一个独立的业务域：

| 模块 | 职责 | 主要方法 |
|------|------|---------|
| `health` | 检查 TopBridge App 运行状态 | `check()` |
| `benefits` | 验证用户打印权益和配额 | `check()` |
| `printers` | 获取已配置的打印机列表 | `list()` |
| `templates` | 获取模板列表和字段定义 | `list()`, `schema()` |
| `print` | 执行打印任务（schema 驱动数据转换） | `execute()` |
| `preflight` | 编排前三步的完整预检 | `run()` |
| `launch` | TopBridge App 唤起与重试编排 | `trigger()`, `ensureRunning()` |

## 短连接模型

SDK 采用短连接通信：每次 API 调用都会独立创建一个 WebSocket 连接，发送请求，接收响应，然后关闭。你无需手动管理连接生命周期。

```
client.print.execute(...)
  → 连接本地 WebSocket
  → 获取模板 schema
  → 构建并发送打印数据
  → 接收响应
  → 关闭连接
  → 返回 PrintResponse
```

## 响应结构

所有 SDK 方法返回统一的响应信封：

```typescript
interface SdkResponse<T> {
  status: 'ok' | 'warning'    // 请求结果状态
  requestId?: string           // 请求追踪 ID
  data: T                      // 业务数据
  warnings?: SdkWarning[]      // 数据格式警告（可选）
}
```

- `status: 'ok'` — 请求成功，`data` 包含业务数据
- `status: 'warning'` — 请求成功但有附加提示（例如健康检查时网络断开）。可正常使用 `data`，同时检查 `message` 获取提示详情
- `warnings` — 非致命的数据格式提示数组。SDK 会在数据转换过程中发现潜在问题时添加，不会阻止打印执行
- `message` — 人类可读的状态描述（如 "Print job completed"）

当请求失败时，SDK **不会**返回响应——而是抛出 `TopBridgeError` 子类异常。详见 [错误处理](/zh/guide/error-handling)。

**SdkWarning 结构**：

```typescript
interface SdkWarning {
  code: string      // 大类标识，如 'DATA_FORMAT'
  reason: string    // 精确标识，如 'newline_truncated'
  message: string   // 人类可读描述
}
```

## DataField 与 fieldType 的区别

这是理解模板 schema 的关键概念。

### 什么是 DataField

**DataField**（SDK 中表示为 `dataField`）是**数据源字段名**——即你在 `products` 数组中使用的键名。例如：`name`、`price`、`barcode`、`weight`、`description`。

```typescript
// product 对象中的每个键就是一个 DataField
const product = {
  name: 'Apple',      // DataField: "name"
  price: { value: 3.99 },  // DataField: "price"
  barcode: '12345',   // DataField: "barcode"
  copies: 2,          // 保留 DataField
}
```

### 什么是 fieldType

**fieldType**（也叫 Widget Type）是 **schema 级别的数据类型声明**——它告诉 SDK 如何转换值。例如：`'text'`、`'price'`、`'barcode'`、`'weight'`、`'qrcode'`。

```typescript
// templates.schema() 返回的字段定义：
const field = {
  name: 'price',           // DataField（Wire 格式："name"）
  type: 'price',           // fieldType（Wire 格式："type"）
  required: true,
  subFields: ['value', 'currency', 'unit']
}
```

### 两者的关系

模板 schema 将 DataField 映射到 fieldType。当你调用 `print.execute()` 时，SDK：

1. 自动获取模板 schema
2. 从 schema 中查找每个 DataField 对应的 fieldType
3. 根据 fieldType 应用相应的数据转换

你**不需要**手动指定如何转换每个字段——SDK 从 schema 中读取 fieldType 并自动处理。

| DataField（你的数据键） | fieldType（来自 schema） | SDK 转换行为 |
|------------------------|------------------------|-------------|
| `name` | `'text'` | 保持原值，截断换行符 |
| `price` | `'price'` | 构建 `{ value, currency?, unit? }` |
| `weight` | `'weight'` | 构建 `{ value, unit? }` |
| `barcode` | `'barcode'` | 强制转字符串 |
| `qrcode` | `'qrcode'` | 强制转字符串 |
| `copies` | `'integer'` | 规范化到 [1, 9999] |

详见 [Widget 类型](/zh/guide/widgets)了解各 fieldType 的详细说明，以及[数据转换](/zh/guide/field-types)了解转换规则。
