---
title: Widget 类型
---

# Widget 类型

Widget 类型（在 schema 中也叫 `fieldType`）定义了 SDK 如何转换你的产品数据后再发送给 TopBridge App。模板 schema 中的每个字段都有一个 `type`，决定了其转换行为。

## 分类

Widget 类型分为三大类：

| 分类 | 类型 | 行为 |
|------|------|------|
| **Widget 字段** | `text`, `textfield`, `price`, `weight`, `barcode`, `qrcode` | 主动数据转换 |
| **Protocol 字段** | `integer` | 强制转字符串 |
| **Layout 字段** | `line` | 无数据绑定（跳过） |

## Widget 字段

### `text` — 单行文本

静态文本显示。换行符自动截取第一行。

```typescript
// 输入
{ name: 'Apple' }
// 输出（发送给 TopBridge App）
{ name: 'Apple' }

// 如果输入包含换行符：
{ name: 'Apple\n有机水果' }
// 输出
{ name: 'Apple' }  // + 警告: newline_truncated
```

### `textfield` — 多行文本

可编辑文本输入。保留换行符，过滤公式注入前缀（`=`、`=@`）。

```typescript
// 输入
{ description: '新鲜有机苹果\n产地新西兰' }
// 输出
{ description: '新鲜有机苹果\n产地新西兰' }
```

### `price` — 价格结构

构建包含 `value`、`currency`、`unit` 的结构化对象。

```typescript
// 输入
{ price: { value: 3.99, currency: '$', unit: '/kg' } }
// 输出
{ price: { value: 3.99, currency: '$', unit: '/kg' } }
```

### `weight` — 重量结构

构建包含 `value`、`unit` 的结构化对象。

```typescript
// 输入
{ weight: { value: 0.5, unit: 'kg' } }
// 输出
{ weight: { value: 0.5, unit: 'kg' } }
```

### `barcode` — 条形码

强制转字符串。`null` 转为空字符串。

```typescript
// 输入
{ barcode: 12345 }
// 输出
{ barcode: '12345' }

// 输入
{ barcode: null }
// 输出
{ barcode: '' }
```

### `qrcode` — 二维码

强制转字符串。`null` 转为空字符串。

```typescript
// 输入
{ qrcode: 'https://example.com/product/123' }
// 输出
{ qrcode: 'https://example.com/product/123' }
```

## Protocol 字段

### `integer` — 整数值

强制转字符串。`copies` 保留字段单独处理（见[数据转换](/zh/guide/field-types#copies-rules)）。

```typescript
// 输入
{ quantity: 42 }
// 输出
{ quantity: '42' }
```

## Layout 字段

### `line` — 装饰线

无数据绑定。SDK 在数据构建时自动跳过 `line` 类型字段——你不需要在产品数据中包含它。

## Schema 字段定义

`templates.schema()` 返回的模板 schema 中，每个字段遵循以下结构：

```typescript
interface TemplateFieldSchema {
  name: string            // DataField 名称（映射到 products 的键）
  type: WidgetFieldType   // Widget 类型 / fieldType
  required: boolean       // 字段是否必填
  default?: any           // 默认值
  subFields?: TemplateFieldSchema[]  // 嵌套子字段（仅 price/weight）
}
```

## 如何发现 Widget 类型

调用 `templates.schema()` 获取指定模板的字段定义：

```typescript
// 输入
const schema = await client.templates.schema('PRICE_LABEL')

// 输出
// {
//   data: {
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
//       { name: 'weight', type: 'weight', required: false },
//       { name: 'divider', type: 'line', required: false },
//       { name: 'copies', type: 'integer', required: false, default: 1 },
//     ]
//   }
// }
```

你可以利用这些信息在 UI 中动态生成表单。完整实现请参考[高级动态表单示例](/zh/examples/advanced-form)。
