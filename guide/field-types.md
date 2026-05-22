---
title: Data Transformation (fieldTypes)
---

# Data Transformation

The SDK automatically transforms your flat product data into the structured format Topbridge App expects. This is done **schema-driven**: when you call `print.execute()`, the SDK internally fetches the template schema and applies transformations based on each field's `fieldType`.

You do **not** need to manually specify field types — the SDK handles everything automatically.

## How It Works

```
print.execute({ template, printer, products })
  ├─ 1. Auto-fetch template schema (automatic, no manual call needed)
  ├─ 2. Classify fields by fieldType
  │     ├─ Widget fields: text, textfield, price, weight, barcode, qrcode
  │     ├─ Protocol fields: integer
  │     └─ Layout fields: line (skipped)
  ├─ 3. Transform each product's data
  └─ 4. Send print command to Topbridge App
```

`print.execute()` handles the entire pipeline automatically — you only need to provide the product data with the correct field names.

## Transformation Rules

| fieldType | Input | Output | Notes |
|-----------|-------|--------|-------|
| `text` | `'Apple\nOrganic'` | `'Apple'` | Truncates to first line + warning |
| `textfield` | `'Line 1\nLine 2'` | `'Line 1\nLine 2'` | Preserves newlines, strips `=`/`=@` |
| `price` | `3.99` | `{ value: 3.99 }` | Scalar auto-wrap |
| `price` | `3.99, currency: '$', unit: '/kg'` | `{ value: 3.99, currency: '$', unit: '/kg' }` | Flat fields auto-grouped |
| `price` | `{ value: 3.99, currency: '$' }` | `{ value: 3.99, currency: '$' }` | Nested object preserved |
| `weight` | `0.5` | `{ value: 0.5 }` | Scalar auto-wrap |
| `weight` | `0.5, unit: 'kg'` | `{ value: 0.5, unit: 'kg' }` | Flat fields auto-grouped |
| `barcode` | `12345` | `'12345'` | Force string |
| `barcode` | `null` | `''` | null → empty string |
| `qrcode` | `'https://...'` | `'https://...'` | Force string |
| `integer` | `42` | `'42'` | Force string |
| `line` | *(any)* | *(skipped)* | No data binding |

## Product Data Format

Products are flat JSON objects. You can mix flat values with nested objects:

```typescript
const products = [
  // Flat values — SDK auto-groups based on schema fieldType
  { name: 'Apple', price: 3.99, currency: '$', unit: '/kg', barcode: 12345, copies: 2 },
  { name: 'Banana', price: 1.99, currency: '$', copies: 1 },
]

// After SDK transformation (price fieldType groups currency+unit):
// [
//   { name: 'Apple', price: { value: 3.99, currency: '$', unit: '/kg' }, barcode: '12345', copies: 2 },
//   { name: 'Banana', price: { value: 1.99, currency: '$' }, copies: 1 },
// ]
```

### Nested Object Syntax

For structured fields (price, weight), you can explicitly use nested objects:

```typescript
const products = [
  { name: 'Apple', price: { value: 3.99, currency: '$', unit: '/kg' }, copies: 2 },
]
```

### Dot-Path Syntax

For structured fields (price, weight only), you can use dot-path keys:

```typescript
const products = [
  { name: 'Apple', 'price.value': 3.99, 'price.currency': '$', 'price.unit': '/kg' },
]
```

Both syntaxes produce identical output.

## copies Rules {#copies-rules}

`copies` is a reserved key that controls the number of print copies:

| Rule | Description |
|------|-------------|
| Range | [1, 9999], values outside are clamped |
| Default | 1 (omitted from output when equal to default) |
| Invalid Values | null, NaN, non-numeric → fallback to 1 |
| Decimals | Rounded via `Math.round()` |

```typescript
// copies: 2 → output includes copies: 2
// copies: 1 → output omits copies (default)
// copies: 0 → output copies: 1 (clamped)
// copies: 10000 → output copies: 9999 (clamped)
// copies: null → output omits copies (default 1)
```

## Text Newline Handling

The TSPL protocol parses instructions line by line. Newline characters (`\n`, `\r`, `\r\n`) in `text` type fields will break the TSPL instruction structure.

When a `text` field value contains newlines, the SDK:
1. Truncates to the first line
2. Adds a warning to the response: `{ code: 'DATA_FORMAT', reason: 'newline_truncated', message: '...' }`

This only applies to fields with `text` fieldType in the schema. `textfield` preserves newlines.

## Warning Types

`PrintResponse.warnings` may contain warnings from two sources:

| code | reason | Source | Description |
|------|--------|--------|-------------|
| `DATA_FORMAT` | `newline_truncated` | SDK client | A `text` field contained newlines; auto-truncated to first line |
| `DPI_MISMATCH` | — | Topbridge App | Printer DPI does not match the template design DPI |

Both are merged into a single `warnings[]` array on the response. These are non-fatal — the print job still executes.

## Formula Injection Prevention

For `textfield` type fields, the SDK automatically strips formula injection prefixes (`=` and `=@`) from input values. This is a built-in safety measure — you do not need to sanitize data manually.

```
Input:  '=SUM(A1:A10)'   →   Output: 'SUM(A1:A10)'
Input:  '=@cmd'           →   Output: 'cmd'
```

## Deprecated Parameters

::: warning
The `fieldTypes` and `rawProducts` parameters have been removed. Passing them will throw `TopBridgeValidationError`.
:::

```typescript
// ❌ Old (will throw error)
await client.print.execute({
  template: 'PRICE_LABEL',
  printer: 'TSC DA220',
  products: [{ name: 'Apple', price: 3.99 }],
  fieldTypes: { price: 'price' },  // REMOVED
})

// ✅ New (correct)
await client.print.execute({
  template: 'PRICE_LABEL',
  printer: 'TSC DA220',
  products: [{ name: 'Apple', price: 3.99, currency: '$', unit: '/kg' }],
})
```
