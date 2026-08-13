---
title: Overview & Architecture
---

# Overview & Architecture

## What is TopBridge

TopBridge is a desktop application running on the user's local machine (referred to as "TopBridge App"). It manages label printers, templates, and user entitlements. It exposes APIs via the WebSocket protocol locally, allowing browser applications to send print commands.

> **Download**: [Get TopBridge App](https://service.topsale.co.nz/self-service/download/topbridge)

:::tip Looking for a complete solution?
Visit the [TOPSALE label printing website](https://topsale.biz/solution/label-printing/) to learn more about our fully managed platform.
:::

## What Problems Does the SDK Solve

`@appzgatenz/label-print-topbridge-js` is a Headless (no UI) browser SDK that encapsulates all communication details with TopBridge App:

- **Hybrid WebSocket management** — Lightweight APIs and push events share one persistent connection; print jobs keep an independent short connection
- **TopBridge App launch & retry** — Launch orchestration via the `launch` module with automatic retry logic
- **Data transformation** — Automatically converts product data into the structured format required by TopBridge App based on template schema
- **Structured errors** — 14 error classes (1 base + 13 subclasses), all supporting `instanceof` narrowing
- **Preflight orchestration** — One-liner to complete "health check → entitlement validation → printer discovery"
- **Printer setup & session unblock** — Configure protocols / BPAC and clear SessionBlocked via `printerSetup` / `session`
- **Push events** — Subscribe to printer, template, user, and connection lifecycle events via `client.events`

The SDK is not bound to any UI framework and can be used in React / Vue / Svelte / vanilla JS.

## Architecture Overview

```
Your Browser Application
    │
    ▼
TopBridgeClient (SDK Entry)
    ├── health         Health check
    ├── whoami         Current login status
    ├── benefits       Entitlement & quota (+ refreshBenefit)
    ├── printers       Printer list
    ├── templates      Template list / schema / json / refresh
    ├── print          Print execution (schema-driven conversion)
    ├── preflight      Orchestration: health → benefits → printers
    ├── launch         TopBridge App launch + retry
    ├── printerSetup   Printer configuration & BPAC
    ├── session        Session-limit unblock (kickSession)
    └── events         Push events + connection lifecycle
    │
    ▼  WebSocket connection (local or secure WSS mode)
TopBridge App (Local Desktop Application)
    │
    ▼
Label Printer
```

## How It Works

1. **Initialize** — Create a `TopBridgeClient` instance in your browser app
2. **Preflight** — Run health check, validate entitlements, and discover printers
3. **Optional setup** — Configure printers / handle session limits when required
4. **Print** — Submit a print request with product data; the SDK fetches the template schema and transforms the data
5. **Optional events** — Subscribe to Tray App push events on the shared connection

You only interact with the high-level module API — no need to manage raw WebSocket frames or protocol message formats.

## SDK Modules

| Module | Access | Description |
|--------|--------|-------------|
| health | `client.health` | TopBridge App health check |
| whoami | `client.whoami` | Current login status and account |
| benefits | `client.benefits` | Entitlement validation + force refresh |
| printers | `client.printers` | Synced printer list |
| templates | `client.templates` | Template list, schema, JSON batch, refresh |
| print | `client.print` | Execute label print with auto data conversion |
| preflight | `client.preflight` | Orchestration: health → benefits → printers |
| launch | `client.launch` | TopBridge App launch and retry |
| printerSetup | `client.printerSetup` | Printer protocol / charset / font / BPAC |
| session | `client.session` | Kick sessions to clear SessionBlocked |
| events | `client.events` | Typed `on` / `off` subscriptions |

Lifecycle helpers on the client: `connect()`, `close()`, `getConnectionState()`.

## Package Info

| Property | Value |
|----------|-------|
| Package | `@appzgatenz/label-print-topbridge-js` |
| Size | ~9 KB gzipped |
| Dependencies | Zero runtime dependencies |
| Formats | ESM + CJS dual output |
| Tree-shaking | Supported (`sideEffects: false`) |
| Node.js (build toolchain) | >= 18 |
