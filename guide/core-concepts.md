---
title: Core Concepts
---

# Core Concepts

## Modular Architecture

`TopBridgeClient` exposes 10 functional modules plus a typed event surface:

| Module | Responsibility | Primary Methods |
|--------|----------------|-----------------|
| `health` | Check TopBridge App running status | `check()` |
| `whoami` | Current login status and account | `check()` |
| `benefits` | Validate print entitlements and quota | `check()`, `refreshBenefit()` |
| `printers` | Get configured printer list | `list()` |
| `templates` | Template list, schema, JSON, refresh | `list()`, `schema()`, `json()`, `refreshTemplates()` |
| `print` | Execute print jobs (schema-driven conversion) | `execute()` |
| `preflight` | Orchestrate the full preflight check | `run()` |
| `launch` | TopBridge App launch & retry | `trigger()`, `ensureRunning()` |
| `printerSetup` | Printer protocol / charset / font / BPAC | `load()`, `configure()`, … |
| `session` | Clear SessionBlocked by kicking sessions | `kickSession()` |
| `events` | Push events + connection lifecycle | `on()`, `off()` |

## Hybrid Connection Model

The SDK uses a **hybrid** WebSocket model (not short-connection-only):

- **Shared persistent connection** — Lightweight request/response APIs and server push events (`printer` / `template` / `user`) share one connection managed internally. Idle connections close after a short grace period; reconnect uses exponential backoff.
- **Independent print connection** — `print.execute()` uses a separate short connection so long print jobs do not block the shared channel.

```
client.health.check() / client.events.on(...)
  → Shared persistent WebSocket

client.print.execute(...)
  → Independent short WebSocket
  → Fetch template schema
  → Build and send print payload
  → Receive response
  → Close connection
  → Return PrintResponse
```

Optional lifecycle controls:

```typescript
client.connect()                 // Open the shared connection early
client.getConnectionState()      // 'closed' | 'connecting' | 'open' | ...
client.close()                   // Close shared connection (no auto-reconnect)
```

## Response Structure

All SDK methods return a unified response envelope:

```typescript
interface SdkResponse<T> {
  status: 'ok' | 'warning'    // Request result status
  requestId?: string           // Request trace ID
  data: T                      // Business data
  message: string              // Human-readable status description
  details?: unknown            // Extended details (optional)
  warnings?: SdkWarning[]      // Non-fatal hints (optional)
}
```

- `status: 'ok'` — Request succeeded, use `data`
- `status: 'warning'` — Succeeded with hints; `data` is still usable
- On failure the SDK **throws** a `TopBridgeError` subclass — it does not return an error envelope

**SdkWarning**:

```typescript
interface SdkWarning {
  code: string      // e.g. 'DATA_FORMAT'
  reason: string    // e.g. 'newline_truncated'
  message: string   // Human-readable description
}
```

## DataField vs fieldType

### What is a DataField

A **DataField** (`dataField` in the SDK) is the **data source field name** — the key you use in the `products` array.

```typescript
const product = {
  name: 'Apple',           // DataField: "name"
  price: { value: 3.99 },  // DataField: "price"
  barcode: '12345',        // DataField: "barcode"
  copies: 2,               // Reserved DataField
}
```

### What is fieldType

**fieldType** is the **schema-level type** that tells the SDK how to transform the value (e.g. `'text'`, `'price'`, `'barcode'`).

```typescript
const field = {
  name: 'price',           // DataField (wire: "name")
  type: 'price',           // fieldType (wire: "type")
  required: true,
  subFields: ['value', 'currency', 'unit']
}
```

### How They Relate

When you call `print.execute()`, the SDK:

1. Fetches the template schema
2. Looks up each DataField's fieldType
3. Applies the matching transformation

| DataField | fieldType | SDK Transformation |
|-----------|-----------|--------------------|
| `name` | `'text'` | Keep as-is, truncate newlines |
| `price` | `'price'` | Build `{ value, currency?, unit? }` |
| `weight` | `'weight'` | Build `{ value, unit? }` |
| `barcode` | `'barcode'` | Force to string |
| `qrcode` | `'qrcode'` | Force to string |
| `copies` | `'integer'` | Normalize to [1, 9999] |

See [Widget Types](/guide/widgets) and [Data Transformation](/guide/field-types).
