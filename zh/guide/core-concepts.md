---
title: 核心概念
---

# 核心概念

## 模块化架构

`TopBridgeClient` 暴露 10 个功能模块，外加类型化的事件订阅面：

| 模块 | 职责 | 主要方法 |
|------|------|----------|
| `health` | 检查 TopBridge App 运行状态 | `check()` |
| `whoami` | 当前登录状态与账号 | `check()` |
| `benefits` | 校验打印权益与配额 | `check()`、`refreshBenefit()` |
| `printers` | 获取已配置打印机列表 | `list()` |
| `templates` | 模板列表、schema、JSON、刷新 | `list()`、`schema()`、`json()`、`refreshTemplates()` |
| `print` | 执行打印（schema 驱动转换） | `execute()` |
| `preflight` | 编排完整预检 | `run()` |
| `launch` | TopBridge App 唤起与重试 | `trigger()`、`ensureRunning()` |
| `printerSetup` | 打印机协议 / 字符集 / 字体 / BPAC | `load()`、`configure()`、… |
| `session` | 踢出会话以清除 SessionBlocked | `kickSession()` |
| `events` | 推送事件 + 连接生命周期 | `on()`、`off()` |

## 混合连接模型

SDK 使用**混合** WebSocket 模型（不再是纯短连接）：

- **共享长连接** — 轻量请求/响应 API 与服务端推送（`printer` / `template` / `user`）共用一条连接。空闲一段时间后优雅关闭；重连使用指数退避。
- **独立打印短连接** — `print.execute()` 使用单独短连接，避免长打印阻塞共享通道。

```
client.health.check() / client.events.on(...)
  → 共享长连接 WebSocket

client.print.execute(...)
  → 独立短连接 WebSocket
  → 获取模板 schema
  → 构建并发送打印载荷
  → 接收响应
  → 关闭连接
  → 返回 PrintResponse
```

可选生命周期控制：

```typescript
client.connect()                 // 提前打开共享连接
client.getConnectionState()      // 查询连接状态
client.close()                   // 关闭共享连接（不会自动重连）
```

## 响应结构

所有 SDK 方法返回统一响应信封：

```typescript
interface SdkResponse<T> {
  status: 'ok' | 'warning'    // 请求结果状态
  requestId?: string           // 请求追踪 ID
  data: T                      // 业务数据
  message: string              // 可读状态描述
  details?: unknown            // 扩展详情（可选）
  warnings?: SdkWarning[]      // 非致命提示（可选）
}
```

- `status: 'ok'` — 成功，直接使用 `data`
- `status: 'warning'` — 成功但有提示；`data` 仍可用
- 失败时 SDK **抛出** `TopBridgeError` 子类，不会返回错误信封

**SdkWarning**：

```typescript
interface SdkWarning {
  code: string      // 如 'DATA_FORMAT'
  reason: string    // 如 'newline_truncated'
  message: string   // 可读描述
}
```

## DataField 与 fieldType

### 什么是 DataField

**DataField**（SDK 中的 `dataField`）是**数据源字段名**——你在 `products` 数组里使用的键。

```typescript
const product = {
  name: 'Apple',           // DataField: "name"
  price: { value: 3.99 },  // DataField: "price"
  barcode: '12345',        // DataField: "barcode"
  copies: 2,               // 保留字段
}
```

### 什么是 fieldType

**fieldType** 是 schema 层的类型声明，告诉 SDK 如何转换该值（如 `'text'`、`'price'`、`'barcode'`）。

```typescript
const field = {
  name: 'price',           // DataField（协议字段 "name"）
  type: 'price',           // fieldType（协议字段 "type"）
  required: true,
  subFields: ['value', 'currency', 'unit']
}
```

### 二者如何关联

调用 `print.execute()` 时，SDK 会：

1. 获取模板 schema
2. 查找每个 DataField 的 fieldType
3. 按类型执行转换

| DataField | fieldType | SDK 转换 |
|-----------|-----------|----------|
| `name` | `'text'` | 原样保留，截断换行 |
| `price` | `'price'` | 构建 `{ value, currency?, unit? }` |
| `weight` | `'weight'` | 构建 `{ value, unit? }` |
| `barcode` | `'barcode'` | 强制为字符串 |
| `qrcode` | `'qrcode'` | 强制为字符串 |
| `copies` | `'integer'` | 规范到 [1, 9999] |

详见 [Widget 类型](/zh/guide/widgets) 与 [数据转换](/zh/guide/field-types)。
