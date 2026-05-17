---
title: Core Concepts
---

# Core Concepts

## Modular Architecture

`TopBridgeClient` contains 7 functional modules, each responsible for an independent business domain:

| Module | Responsibility | Primary Methods |
|--------|----------------|-----------------|
| `health` | Check Topbridge App running status | `check()` |
| `benefits` | Validate user print entitlements and quota | `check()` |
| `printers` | Get configured printer list | `list()` |
| `templates` | Get template list and field definitions | `list()`, `schema()` |
| `print` | Execute print jobs (schema-driven data conversion) | `execute()` |
| `preflight` | Orchestrate the full preflight check | `run()` |
| `launch` | Topbridge App launch & retry orchestration | `trigger()`, `ensureRunning()` |

## Short-Connection Model

The SDK uses short WebSocket connections: each API call independently creates a WebSocket connection, sends the request, receives the response, and then closes. You do not need to manually manage the connection lifecycle.

```
client.print.execute(...)
  → Connect to ws://localhost:8765/v2
  → Fetch template schema (action: "template")
  → Build and send print payload (action: "print")
  → Receive response
  → Close connection
  → Return PrintResponse
```

## Response Structure

All SDK methods return a unified response envelope:

```typescript
interface SdkResponse<T> {
  status: 'ok' | 'warning'    // Request result status
  requestId?: string           // Request trace ID
  data: T                      // Business data
  warnings?: SdkWarning[]      // Data format warnings (optional)
}
```

- `status: 'ok'` — Request succeeded, `data` contains business data
- `status: 'warning'` — Request succeeded with additional hints (e.g., network disconnected during health check). You can use `data` normally, and check `message` for details
- `warnings` — Non-fatal data format hints. The SDK adds these when potential issues are found during data conversion, without blocking print execution

**SdkWarning Structure**:

```typescript
interface SdkWarning {
  code: string      // Category identifier, e.g., 'DATA_FORMAT'
  reason: string    // Precise identifier, e.g., 'newline_truncated'
  message: string   // Human-readable description
}
```

## DataField vs fieldType

This is a key distinction to understand when working with template schemas.

### What is a DataField

A **DataField** (represented as `dataField` in the SDK) is the **data source field name** — the key you use in the `products` array. For example: `name`, `price`, `barcode`, `weight`, `description`.

```typescript
// Each key in the product object is a DataField
const product = {
  name: 'Apple',      // DataField: "name"
  price: 3.99,        // DataField: "price"
  barcode: '12345',   // DataField: "barcode"
  copies: 2,          // Reserved DataField
}
```

### What is fieldType

**fieldType** (also called Widget Type) is the **schema-level data type declaration** — it tells the SDK how to transform the value. For example: `'text'`, `'price'`, `'barcode'`, `'weight'`, `'qrcode'`.

```typescript
// From templates.schema() response:
const field = {
  name: 'price',           // DataField (Wire format: "name")
  type: 'price',           // fieldType (Wire format: "type")
  required: true,
  subFields: ['value', 'currency', 'unit']
}
```

### How They Relate

The template schema maps DataFields to fieldTypes. When you call `print.execute()`, the SDK:

1. Automatically fetches the template schema
2. Looks up each DataField's fieldType from the schema
3. Applies the appropriate transformation based on the fieldType

You do **not** need to manually specify how to transform each field — the SDK reads the fieldType from the schema and handles it automatically.

| DataField (your data key) | fieldType (from schema) | SDK Transformation |
|---------------------------|------------------------|--------------------|
| `name` | `'text'` | Keep as-is, truncate newlines |
| `price` | `'price'` | Build `{ value, currency?, unit? }` |
| `weight` | `'weight'` | Build `{ value, unit? }` |
| `barcode` | `'barcode'` | Force to string |
| `qrcode` | `'qrcode'` | Force to string |
| `copies` | `'integer'` | Normalize to [1, 9999] |

See [Widget Types](/guide/widgets) for detailed fieldType descriptions and [Data Transformation](/guide/field-types) for transformation rules.
