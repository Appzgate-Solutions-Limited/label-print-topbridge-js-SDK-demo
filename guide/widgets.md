---
title: Widget Types
---

# Widget Types

Widget Types (also called `fieldType` in the schema) define how the SDK transforms your product data before sending it to TopBridge App. Each field in a template schema has a `type` that determines its transformation behavior.

## Classification

Widget types are organized into three categories:

| Category | Types | Behavior |
|----------|-------|----------|
| **Widget Fields** | `text`, `textfield`, `price`, `weight`, `barcode`, `qrcode` | Active data transformation |
| **Protocol Fields** | `integer` | Forced string conversion |
| **Layout Fields** | `line` | No data binding (skipped) |

## Widget Fields

### `text` — Single-line Text

Static text display. Newlines are automatically truncated to the first line.

```typescript
// Input
{ name: 'Apple' }
// Output (sent to TopBridge App)
{ name: 'Apple' }

// If input contains newlines:
{ name: 'Apple\nOrganic' }
// Output
{ name: 'Apple' }  // + warning: newline_truncated
```

### `textfield` — Multi-line Text

Editable text input. Preserves newlines and strips formula-injection prefixes (`=`, `=@`).

```typescript
// Input
{ description: 'Fresh organic apple\nFrom New Zealand' }
// Output
{ description: 'Fresh organic apple\nFrom New Zealand' }
```

### `price` — Price Structure

Builds a structured object with `value`, `currency`, and `unit`.

```typescript
// Input
{ price: { value: 3.99, currency: '$', unit: '/kg' } }
// Output
{ price: { value: 3.99, currency: '$', unit: '/kg' } }
```

### `weight` — Weight Structure

Builds a structured object with `value` and `unit`.

```typescript
// Input
{ weight: { value: 0.5, unit: 'kg' } }
// Output
{ weight: { value: 0.5, unit: 'kg' } }
```

### `barcode` — Barcode

Forces value to string. `null` becomes empty string.

```typescript
// Input
{ barcode: 12345 }
// Output
{ barcode: '12345' }

// Input
{ barcode: null }
// Output
{ barcode: '' }
```

### `qrcode` — QR Code

Forces value to string. `null` becomes empty string.

```typescript
// Input
{ qrcode: 'https://example.com/product/123' }
// Output
{ qrcode: 'https://example.com/product/123' }
```

## Protocol Fields

### `integer` — Integer Value

Forces to string. The `copies` reserved field is handled separately (see [Data Transformation](/guide/field-types#copies-rules)).

```typescript
// Input
{ quantity: 42 }
// Output
{ quantity: '42' }
```

## Layout Fields

### `line` — Decorative Separator

No data binding. The SDK automatically skips `line` type fields during data building — you don't need to include them in your product data.

## Schema Field Definition

Each field in the template schema returned by `templates.schema()` follows this structure:

```typescript
interface TemplateFieldSchema {
  name: string            // DataField name (maps to products key)
  type: WidgetFieldType   // Widget type / fieldType
  required: boolean       // Whether the field is required
  default?: any           // Default value
  subFields?: TemplateFieldSchema[]  // Nested sub-fields (price/weight only)
}
```

## How to Discover Widget Types

Call `templates.schema()` to get the field definitions for a specific template:

```typescript
// Input
const schema = await client.templates.schema('PRICE_LABEL')

// Output
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

You can use this information to dynamically generate forms in your UI. See the [Advanced Dynamic Form example](/examples/advanced-form) for a complete implementation.
