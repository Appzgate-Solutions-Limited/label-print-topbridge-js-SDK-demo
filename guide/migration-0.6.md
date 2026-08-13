---
title: Migrating to 0.6
---

# Migrating to 0.6

This guide helps you move from documentation and integrations based on the ~0.3 to 0.5.x SDK surface to `@appzgatenz/label-print-topbridge-js@0.6.x`.

:::tip
`@appzgatenz/label-print-topbridge-js@0.6.2` is published to npm. The 0.6.x API surface is stable.
:::

## What changed at a glance

| Area | ~0.3 mental model | 0.6 behavior |
|------|-------------------|--------------|
| Connection | Short connection for every call | **Hybrid**: shared persistent connection for light APIs + events; independent short connection for print |
| Modules | 7 modules | **10 modules** + `client.events` (`whoami`, `printerSetup`, `session`) |
| Errors | ~11 classes; `UPDATE_REQUIRED` often shown under Auth | **14 classes**; `UPDATE_REQUIRED` → `TopBridgeVersionError`; added `PrinterSetup` / `Session` errors |
| Config | `health` / `preflight` / `print` timeouts | Added `timeouts.printerSetup`, `timeouts.refresh`; default `source: 'Core-SDK'` |
| Templates / benefits | list + schema / check | Added `templates.json`, `templates.refreshTemplates`, `benefits.refreshBenefit` |
| Lifecycle | Implicit only | `connect()`, `close()`, `getConnectionState()` |

## Recommended upgrade steps

1. Install `0.6.x` (stable from npm when available; beta via CodeArtifact on `develop`).
2. Fix error handling: move `UPDATE_REQUIRED` to `TopBridgeVersionError`.
3. Keep your existing print path (`preflight` → `templates` → `print`) — it still works.
4. Add new handlers only where needed:
   - SessionBlocked → `TopBridgeSessionError` + `client.session.kickSession`
   - Printer protocol / BPAC → `client.printerSetup`
   - Live updates → `client.events.on(...)`
5. Optionally tune `timeouts.refresh` / `timeouts.printerSetup`.

## Breaking / high-impact callouts

### 1. `UPDATE_REQUIRED` is no longer an AuthError

```typescript
// Before (incorrect on 0.6)
if (err instanceof TopBridgeAuthError && err.code === 'UPDATE_REQUIRED') { /* ... */ }

// After
if (err instanceof TopBridgeVersionError) {
  window.open(err.storeUrl ?? err.downloadUrl)
}
```

### 2. Do not assume every call opens a fresh short connection

Light APIs and event subscriptions reuse one shared connection. If you previously closed resources assuming "one call = one socket", switch to `client.close()` only when you intentionally tear down the shared channel.

### 3. New errors you should catch in production UIs

```typescript
catch (err) {
  if (err instanceof TopBridgeSessionError) {
    const ids = (err.sessions ?? []).map((s) => s.id)
    await client.session.kickSession(ids)
    // retry original request
  }
  if (err instanceof TopBridgePrinterSetupError) {
    console.error(err.code, err.message)
  }
}
```

### 4. `template` / `user` event payloads are now discriminated unions

In 0.5.x, `TemplateEvent` and `UserEvent` were flat interfaces where `before`/`after` were always present (nullable). In 0.6 they are discriminated unions keyed by `action`, so the fields available depend on the variant. Code that reads `event.before` unconditionally, or checks `event.action === 'created'`, will no longer type-check.

```typescript
// 0.5.x — flat: 'created' existed, before/after always present
client.events.on('template', (e) => {
  if (e.action === 'created') { /* ... */ } // 'created' no longer exists
  console.log(e.before?.templateName)        // 'before' removed
})

// 0.6 — discriminated union: narrow on `action`
client.events.on('template', (e) => {
  if (e.action === 'updated') { console.log(e.after.templateName) }
  if (e.action === 'deleted') { /* e has no `after` */ }
})

client.events.on('user', (e) => {
  if (e.action === 'login' && e.sessionLimitExceeded) {
    // e.sessionLimit is the SessionLimit snapshot (blocked)
  }
  if (e.action === 'session_updated') {
    // new action — no before/after, just sessionLimitExceeded + sessionLimit
  }
})
```

Key removals: `TemplateEvent` no longer emits `'created'` (new templates arrive as `'updated'`) and has no `before`. `UserEvent` gains `'session_updated'`; `before`/`after` exist only on `'login'`/`'logout'`.

:::warning TypeScript breaking
If you consume `template` or `user` events on 0.5.x, expect compile errors after upgrading. Narrow on `action` and drop `before` / `'created'` references.
:::

## Additive APIs (non-breaking if unused)

```typescript
await client.whoami.check()
await client.benefits.refreshBenefit()
await client.templates.json(['tpl-1', 'tpl-2'])
await client.templates.refreshTemplates()

const setup = await client.printerSetup.load()
const off = client.events.on('template', (e) => console.log(e))
```

The interactive [Session Management example](/examples/session-management) covers the session-limit flow. Deep guides for printer setup and events are planned; until then use the [API Quick Reference](/guide/api-reference).

## Compatibility checklist

- [ ] Replaced AuthError `UPDATE_REQUIRED` branches with `TopBridgeVersionError`
- [ ] Catch `TopBridgeSessionError` where multi-device session limits apply
- [ ] Catch `TopBridgePrinterSetupError` if you call `printerSetup.*`
- [ ] Narrowed `template`/`user` event handlers on `action` (dropped `'created'` / `before`)
- [ ] Verified CSP still allows `topsale:` if you use `launch`
- [ ] Confirmed Tray App speaks WebSocket API V2 (`/v2`)
