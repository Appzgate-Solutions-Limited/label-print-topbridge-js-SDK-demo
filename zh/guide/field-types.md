---
title: 数据转换
---

# 数据转换

SDK 自动将你的扁平产品数据转换为 Topbridge App 所需的结构化格式。这是**schema 驱动**的：当你调用 `print.execute()` 时，SDK 内部自动获取模板 schema，并根据每个字段的 `fieldType` 应用转换。

你**不需要**手动指定字段类型——SDK 自动处理一切。

## 工作原理

```
print.execute({ template, printer, products })
  ├─ 1. 自动获取模板 schema (action: "template")
  ├─ 2. 按 fieldType 分类字段 (planFields)
  │     ├─ Widget 字段: text, textfield, price, weight, barcode, qrcode
  │     ├─ Protocol 字段: integer
  │     └─ Layout 字段: line (跳过)
  ├─ 3. 转换每个产品的数据 (buildProducts)
  └─ 4. 发送转换后的数据给 Topbridge App (action: "print")
```

## 转换规则

| fieldType | 输入 | 输出 | 说明 |
|-----------|------|------|------|
| `text` | `'Apple\n有机水果'` | `'Apple'` | 截取第一行 + 警告 |
| `textfield` | `'第一行\n第二行'` | `'第一行\n第二行'` | 保留换行，过滤 `=`/`=@` |
| `price` | `3.99` | `{ value: 3.99 }` | 标量自动包装 |
| `price` | `3.99, currency: '$', unit: '/kg'` | `{ value: 3.99, currency: '$', unit: '/kg' }` | 扁平字段自动分组 |
| `price` | `{ value: 3.99, currency: '$' }` | `{ value: 3.99, currency: '$' }` | 嵌套对象保留 |
| `weight` | `0.5` | `{ value: 0.5 }` | 标量自动包装 |
| `weight` | `0.5, unit: 'kg'` | `{ value: 0.5, unit: 'kg' }` | 扁平字段自动分组 |
| `barcode` | `12345` | `'12345'` | 强制转字符串 |
| `barcode` | `null` | `''` | null → 空字符串 |
| `qrcode` | `'https://...'` | `'https://...'` | 强制转字符串 |
| `integer` | `42` | `'42'` | 强制转字符串 |
| `line` | *(任意)* | *(跳过)* | 无数据绑定 |

## 产品数据格式

Products 是扁平 JSON 对象。你可以混合使用扁平值和嵌套对象：

```typescript
const products = [
  // 扁平值 — SDK 根据 schema 的 fieldType 自动分组
  { name: 'Apple', price: 3.99, currency: '$', unit: '/kg', barcode: 12345, copies: 2 },
  { name: 'Banana', price: 1.99, currency: '$', copies: 1 },
]

// SDK 转换后（price fieldType 会自动分组 currency 和 unit）：
// [
//   { name: 'Apple', price: { value: 3.99, currency: '$', unit: '/kg' }, barcode: '12345', copies: 2 },
//   { name: 'Banana', price: { value: 1.99, currency: '$' }, copies: 1 },
// ]
```

### 嵌套对象语法

对于结构化字段（price、weight），可以直接使用嵌套对象：

```typescript
const products = [
  { name: 'Apple', price: { value: 3.99, currency: '$', unit: '/kg' }, copies: 2 },
]
```

### 点路径语法

对于结构化字段（仅限 price 和 weight），可以使用点路径键：

```typescript
const products = [
  { name: 'Apple', 'price.value': 3.99, 'price.currency': '$', 'price.unit': '/kg' },
]
```

两种语法产生完全相同的输出。

## copies 规则 {#copies-rules}

`copies` 是保留关键字，控制打印份数：

| 规则 | 说明 |
|------|------|
| 范围 | [1, 9999]，超出自动截断 |
| 默认值 | 1（等于默认值时输出中省略） |
| 无效值 | null、NaN、非数字 → 回退到 1 |
| 小数 | 自动取整（`Math.round()`） |

```typescript
// copies: 2 → 输出包含 copies: 2
// copies: 1 → 输出省略 copies（默认值）
// copies: 0 → 输出 copies: 1（截断）
// copies: 10000 → 输出 copies: 9999（截断）
// copies: null → 输出省略 copies（默认 1）
```

## 文本换行处理

TSPL 协议按行解析指令。`text` 类型字段值中的换行符（`\n`、`\r`、`\r\n`）会破坏 TSPL 指令结构。

当 `text` 字段值包含换行符时，SDK：
1. 截取第一行
2. 在响应中添加警告：`{ code: 'DATA_FORMAT', reason: 'newline_truncated', message: '...' }`

这仅适用于 schema 中 fieldType 为 `text` 的字段。`textfield` 会保留换行符。

## 已废弃的参数

::: warning
`fieldTypes` 和 `rawProducts` 参数已被移除。传入会抛出 `TopBridgeValidationError`。
:::

```typescript
// ❌ 旧写法（会报错）
await client.print.execute({
  template: 'PRICE_LABEL',
  printer: 'TSC DA220',
  products: [{ name: 'Apple', price: 3.99 }],
  fieldTypes: { price: 'price' },  // 已移除
})

// ✅ 新写法（正确）
await client.print.execute({
  template: 'PRICE_LABEL',
  printer: 'TSC DA220',
  products: [{ name: 'Apple', price: 3.99, currency: '$', unit: '/kg' }],
})
```
