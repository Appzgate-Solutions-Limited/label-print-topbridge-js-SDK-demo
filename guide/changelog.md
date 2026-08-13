---
title: Changelog
---

# Changelog

:::tip
This page mirrors the [CHANGELOG.md](https://github.com/Appzgate-Solutions-Limited/label-print-topbridge-js/blob/main/CHANGELOG.md) of `@appzgatenz/label-print-topbridge-js` and is synced manually on each SDK release.
:::

## 0.6.2

### Patch Changes

- Tolerate flattened dotted schema field names for structured widgets. Some TopBridge App builds emit `price.currency` / `price.value` entries in the `template` schema instead of a single parent `price` field; `planFields` now registers the dotted prefix (`price`) as the structured field so nested-object and dot-path product inputs validate correctly. An explicitly declared parent field always takes precedence.

All notable changes to this package are documented in this file. Entries through 0.6.1 were reconstructed from tagged Git history when [Changesets](https://github.com/changesets/changesets) was adopted; later entries are generated from changeset fragments. See the [authoring and release workflow](https://github.com/Appzgate-Solutions-Limited/label-print-topbridge-js/blob/main/docs/changelog-and-release.md) in the SDK repository.

## 0.6.1

### Patch Changes

- 3c4cf12: Added `printerSetup.reset()` to clear a printer's protocol configuration without changing the Windows default printer. `printerSetup.list()` and `printerSetup.getOptions()` now also return `protocol` and `protocolLabel` fields describing each printer's configuration.

## 0.6.1-beta.0

### Patch Changes

- c866d5f: Aligned the public push-event contracts with WebSocket API v2. `TemplateEvent` and `UserEvent` are now discriminated unions keyed by `action`; `BenefitsData.expiresAt` may now be `null`; `RefreshTemplatesFullResponse` now distinguishes `ok` (sync counts) from `warning` (a full sync is already running).

## 0.6.0

### Minor Changes

- aad57ba: Added the `session` module with `client.session.kickSession()` to unblock SessionBlocked logins by kicking existing Keycloak sessions. Session-limit breaches are now surfaced as the new `TopBridgeSessionError` (server code `SESSION_LIMIT_EXCEEDED`).
- aad57ba: Added forced-refresh APIs: `client.benefits.refreshBenefit()` to re-validate printing rights on demand, and `client.templates.refreshTemplates()` supporting both full-sync and by-ID modes.

## 0.5.3

### Minor Changes

- 90c7246: Added `templates.json()` to batch-fetch full JSON data for specified templates; missing templates are reported as warnings instead of failing the whole request.

## 0.5.2-beta.1

### Minor Changes

- f8bf178: **Breaking** — aligned BPAC install failure reasons with WebSocket API v2: `INSTALL_NOT_COMPLETED` was removed in favor of `INSTALL_FAILED` / `INSTALL_TIMEOUT`, and `InstallResult.detail` was renamed to `message`.
- fdd1078: **Breaking** — dropped BPAC font management. `addFont` / `deleteFont` no longer accept protocol `'BPAC'`; such requests are now rejected client-side because the server reports them as unsupported.

## 0.5.2-beta.0

### Minor Changes

- a9d94e5: Added charset and font management to `printerSetup` (`addCharset` / `deleteCharset` / `addFont` / `deleteFont`) with client-side input validation.
- 1c1b138: Added asynchronous BPAC install handling — `printerSetup.configure()` now bridges `pending` install states and resolves when the BPAC wizard finishes.
- 1c1b138: Improved connection resilience: the shared connection now closes automatically after an idle grace period, and reconnection uses exponential backoff with jitter and a capped attempt count.

## 0.5.0

### Minor Changes

- 168f2ad: Added the `printerSetup` module for configuring installed printers (loading options, listing printers, updating settings).
- 0525054: Introduced the hybrid connection model: lightweight requests and server push events (`printer` / `template` / `user`) share one persistent connection managed by `ConnectionManager`, while `print` keeps an independent short connection to avoid head-of-line blocking.
- 0525054: Added typed push-event subscriptions via `client.events`, explicit connection control (`client.connect()` / `client.close()` / `client.getConnectionState()`), and the new `TopBridgePrinterSetupError`.

---

_Versions before 0.5.0 (0.3.x–0.4.0) predate changelog tracking and are not covered here._
