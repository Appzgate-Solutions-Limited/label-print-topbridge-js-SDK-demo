---
title: API Quick Reference
---

# API Quick Reference

## Module Methods {#module-methods}

| Module | Method | Return Type | Description |
|--------|--------|-------------|-------------|
| `health` | `check()` | `Promise<HealthResponse>` | Health check |
| `whoami` | `check()` | `Promise<WhoAmIResponse>` | Current login status |
| `benefits` | `check()` | `Promise<BenefitsResponse>` | Entitlement validation |
| `benefits` | `refreshBenefit()` | `Promise<BenefitsResponse>` | Force-refresh benefit cache |
| `printers` | `list()` | `Promise<PrintersResponse>` | Printer list |
| `templates` | `list()` | `Promise<TemplatesListResponse>` | Template list |
| `templates` | `schema(template)` | `Promise<TemplateSchemaResponse>` | Template field definitions |
| `templates` | `json(templateIds)` | `Promise<TemplatesJsonResponse>` | Batch-fetch template JSON |
| `templates` | `refreshTemplates(...)` | overload | Force template-cache sync |
| `print` | `execute(request)` | `Promise<PrintResponse>` | Execute print |
| `preflight` | `run(options?)` | `Promise<PreflightResult>` | Preflight orchestration |
| `launch` | `trigger()` | `void` | Trigger TopBridge App launch |
| `launch` | `ensureRunning(fn, options?)` | `Promise<T>` | Launch + retry orchestration |
| `printerSetup` | `load()` | `Promise<PrinterSetupLoadResult>` | Options + installed printers |
| `printerSetup` | `configure(req, opts?)` | `Promise<ConfigureResult>` | Save protocol config (may await BPAC) |
| `printerSetup` | `getOptions()` / `listInstalled()` / `getBpacStatus()` | `Promise<SdkResponse<...>>` | Read setup dictionaries / status |
| `printerSetup` | `addCharset()` / `deleteCharset()` / `addFont()` / `deleteFont()` | `Promise<SdkResponse<...>>` | Charset / font CRUD |
| `printerSetup` | `reset(printerName)` | `Promise<ResetPrinterResult>` | Clear protocol config (no default-printer change) |
| `session` | `kickSession(sessionIds)` | `Promise<KickSessionResponse>` | Kick sessions to clear SessionBlocked |
| `client` | `connect()` / `close()` / `getConnectionState()` | — | Shared connection lifecycle |
| `client.events` | `on(name, handler)` / `off(name, handler)` | unsubscribe / void | Push + connection events |

:::tip
`printerSetup` and `events` deep guides are coming. For the session-limit flow, see the interactive [Session Management example](/examples/session-management). For everything else, use this table plus the [migration guide](/guide/migration-0.6).
:::

### TopBridgeClientConfig

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `source` | `'Core-SDK' \| 'React-SDK' \| 'Nextjs-SDK'` | `'Core-SDK'` | SDK source identifier |
| `debug` | `boolean` | `false` | Enable console logging |
| `logger` | `Logger` | Silent (no-op) | Custom logger |
| `wssEnabled` | `boolean` | `false` | Use fixed WSS endpoint |
| `timeouts.health` | `number` (ms) | `3000` | Health check timeout |
| `timeouts.preflight` | `number` (ms) | `10000` | Preflight / template query timeout |
| `timeouts.print` | `number` (ms) | `60000` | Print timeout |
| `timeouts.printerSetup` | `number` (ms) | `10000` | Printer setup timeout |
| `timeouts.refresh` | `number` (ms) | `30000` | Force-refresh timeout |

```typescript
import type { TopBridgeClientConfig } from '@appzgatenz/label-print-topbridge-js'

const client = new TopBridgeClient({
  debug: true,
  timeouts: { health: 5000, print: 120000, refresh: 45000 },
})
```

### PrintExecuteRequest

```typescript
interface PrintExecuteRequest {
  template: string             // Template ID or Code
  printer: string              // Printer name
  products: PrintProductInput[] // Product data array
}
```

### PrintProductInput

```typescript
interface PrintProductInput {
  [key: string]: string | number | Record<string, string | number | undefined> | undefined
  copies?: number  // Print copies, range [1, 9999], default 1
}
```

### SyncedPrinter

```typescript
interface SyncedPrinter {
  name: string               // Printer name (used as printer parameter)
  isDefault: boolean         // Whether this is the default printer
  protocol?: 'TSPL' | 'ZPL' // Label protocol
}
```

### Event names (`client.events`)

| Event | Payload | Description |
|-------|---------|-------------|
| `printer` | `PrinterEvent` | Printer / BPAC related push |
| `template` | `TemplateEvent` | Template change push |
| `user` | `UserEvent` | User / login related push |
| `open` | `ConnectionLifecycleEvent` | Shared connection opened |
| `reconnect` | `ConnectionLifecycleEvent` | Shared connection reconnected |
| `close` | `ConnectionLifecycleEvent` | Shared connection closed |
| `error` | `ConnectionLifecycleEvent` | Shared connection error |

```typescript
const off = client.events.on('printer', (event) => {
  console.log(event)
})
// later
off()
// or
client.events.off('printer', handler)
```

### Session limiting & force-refresh

```typescript
// Session-limit unblock: catch SESSION_LIMIT_EXCEEDED, kick stale sessions, retry.
try {
  await client.templates.list()
} catch (err) {
  if (err instanceof TopBridgeSessionError) {
    // err.sessions[] — render a picker; isCurrent marks this device (don't kick it)
    const toKick = (err.sessions ?? []).filter((s) => !s.isCurrent).map((s) => s.id)
    const result = await client.session.kickSession(toKick)
    if (result.data.withinLimit) {
      await client.templates.list() // block cleared — no re-login needed
    }
  }
}

// Force-refresh benefit cache (after purchase/upgrade); throws TopBridgeQuotaError if invalid.
const benefits = await client.benefits.refreshBenefit()

// Force-sync templates — full mode (no args) vs by-ID mode (validates loggedAccount).
await client.templates.refreshTemplates()
await client.templates.refreshTemplates({
  templateIds: ['tpl-1', 'tpl-2'],  // single string also accepted
  loggedAccount: 'user@example.com', // must match the current TopBridge login
})
```

| API | Key behavior |
|-----|--------------|
| `session.kickSession(ids)` | Stateless passthrough; `withinLimit === true` → block cleared; per-session failures land in `failedSessionIds` (never `SESSION_NOT_FOUND`) |
| `benefits.refreshBenefit()` | Bypasses local cache; same shape as `check()`; `isValid === false` throws `TopBridgeQuotaError` |
| `templates.refreshTemplates()` | Full sync (no args) vs by-ID sync (`{ templateIds, loggedAccount }`); `ACCOUNT_MISMATCH` when the account differs |

### Printer protocol options

`printerSetup.getOptions()` returns a protocol dictionary for rendering a dropdown:

```typescript
interface PrinterOptionsData {
  TSPL: { label: string; charsets: PrinterCharsetOption[] }
  ZPL: { label: string; charsets: PrinterCharsetOption[] }
  BPAC: { label: string; sdkInstalled: boolean; paperColors: BpacOption[]; fonts: BpacOption[] }
  UNKNOWN: { label: string } // unconfigured printer sentinel
}
```

`UNKNOWN` is the sentinel for an unconfigured printer — render it alongside `TSPL`/`ZPL`/`BPAC` so the dropdown always offers a valid choice. Each protocol's `label` is display-ready text. `reset(printerName)` returns a printer to this `UNKNOWN` state.

## Response Types {#response-types}

| Type | Key Fields |
|------|------------|
| `HealthResponse` | `type: 'pong'`, `isRunning: true`, `data.isLoggedIn`, `data.version?`, `data.networkStatus?` |
| `WhoAmIResponse` | `data.isLoggedIn`, `data.loggedAccount?`, `data.userId?` |
| `BenefitsResponse` | `data.isValid`, `data.remainingPrints`, `data.expiresAt`, `data.reason`, `data.hasPrintBenefit`, `data.hasSessionBenefit` |
| `PrintersResponse` | `data.count`, `data.defaultPrinter`, `data.printers[]` |
| `TemplatesListResponse` | `data.count`, `data.templates[]` |
| `TemplateSchemaResponse` | `data.fields[]`, `data.code`, `data.name` |
| `TemplatesJsonResponse` | batch template JSON payload |
| `PrintResponse` | `message`, `data.printedCopies`, `data.jobId`, `data.templateName`, `data.userId?`, `details?`, `warnings?` |
| `KickSessionResponse` | `data.withinLimit`, `data.kickedSessionIds[]`, `data.failedSessionIds[]`, `data.sessions[]` |
| `PreflightResult` | `health`, `benefits`, `printers` |
| `ConfigureResult` | printer configure result (may include BPAC install outcome) |

### SdkResponse\<T\> {#sdk-response}

```typescript
interface SdkResponse<T> {
  status: 'ok' | 'warning'
  requestId?: string
  data: T
  message: string
  details?: unknown
  warnings?: SdkWarning[]
}
```

| Status | Behavior |
|--------|----------|
| `'ok'` | Succeeded. Use `data`. |
| `'warning'` | Succeeded with hints. `data` is usable. |
| *(error)* | Throws a `TopBridgeError` subclass. |

## Export List {#export-list}

```typescript
// Classes
import { TopBridgeClient, LaunchModule, PrinterSetupModule } from '@appzgatenz/label-print-topbridge-js'

// Error classes (1 base + 13 subclasses)
import {
  TopBridgeError,
  TopBridgeConnectionError,
  TopBridgeAuthError,
  TopBridgeVersionError,
  TopBridgeQuotaError,
  TopBridgePrintError,
  TopBridgeConfigError,
  TopBridgeValidationError,
  TopBridgePrinterError,
  TopBridgeTemplateError,
  TopBridgeNetworkError,
  TopBridgeSourceError,
  TopBridgePrinterSetupError,
  TopBridgeSessionError,
} from '@appzgatenz/label-print-topbridge-js'

// Types (import on demand)
import type {
  TopBridgeClientConfig,
  TopBridgeSource,
  Logger,
  SdkWarning,
  V2WarningCode,
  SdkEvents,
  HealthResponse,
  WhoAmIResponse,
  BenefitsResponse,
  PrintersResponse,
  SyncedPrinter,
  TemplatesListResponse,
  TemplateSchemaResponse,
  TemplatesJsonResponse,
  PrintResponse,
  PrintExecuteRequest,
  PrintProductInput,
  PreflightResult,
  PreflightOptions,
  EnsureRunningOptions,
  PrinterSetupLoadResult,
  ConfigureResult,
  ConfigureOptions,
  KickSessionResponse,
  SessionInfo,
  SdkEventMap,
  ConnectionState,
  PrinterSetupErrorCode,
} from '@appzgatenz/label-print-topbridge-js'
```
