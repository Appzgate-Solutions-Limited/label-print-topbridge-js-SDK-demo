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

- **WebSocket Connection Management** — Short-connection model: auto connect, send, receive, and close for each call
- **TopBridge App Launch & Retry** — Launch orchestration via the `launch` module with automatic retry logic
- **Data Transformation** — Automatically converts product data into the structured format required by TopBridge App based on template schema
- **Structured Errors** — 10 error types, all supporting `instanceof` narrowing
- **Preflight Orchestration** — One-liner to complete "health check → entitlement validation → printer discovery"

The SDK is not bound to any UI framework and can be used in React / Vue / Svelte / vanilla JS.

## Architecture Overview

```
Your Browser Application
    │
    ▼
TopBridgeClient (SDK Entry)
    ├── health        Health check
    ├── benefits      Entitlement & quota validation
    ├── printers      Printer list
    ├── templates     Template list + field definitions
    ├── print         Print execution (with schema-driven data conversion)
    ├── preflight     Orchestration: health → benefits → printers
    └── launch        TopBridge App launch + retry orchestration
    │
    ▼  WebSocket (Local)
TopBridge App (Local Desktop Application)
    │
    ▼
Label Printer
```

## How It Works

1. **Initialize** — Create a `TopBridgeClient` instance in your browser app
2. **Preflight** — Run health check, validate entitlements, and discover printers
3. **Print** — Submit a print request with product data; the SDK automatically fetches the template schema and transforms the data into the format TopBridge App expects

The SDK handles all WebSocket communication internally. You only interact with the high-level module API — no need to manage connections, parse protocol messages, or handle data transformation manually.

## SDK Modules

The SDK provides 7 independent modules, all accessed via `TopBridgeClient`:

| Module | Access | Description |
|--------|--------|-------------|
| health | `client.health` | TopBridge App health check |
| benefits | `client.benefits` | Entitlement and quota validation |
| printers | `client.printers` | Synced printer list |
| templates | `client.templates` | Template list and field schema |
| print | `client.print` | Execute label print with auto data conversion |
| preflight | `client.preflight` | Orchestration: health → benefits → printers |
| launch | `client.launch` | TopBridge App launch and retry |

## Package Info

| Property | Value |
|----------|-------|
| Package | `@appzgatenz/label-print-topbridge-js` |
| Size | ~3.2 KB gzipped |
| Dependencies | Zero runtime dependencies |
| Formats | ESM + CJS dual output |
| Tree-shaking | Supported (`sideEffects: false`) |
| Node.js | >= 18 |
