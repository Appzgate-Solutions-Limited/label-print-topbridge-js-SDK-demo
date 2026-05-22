---
title: Overview & Architecture
---

# Overview & Architecture

## What is TopBridge

TopBridge is a desktop application running on the user's local machine (referred to as "Topbridge App"). It manages label printers, templates, and user entitlements. It exposes APIs via the WebSocket protocol locally, allowing browser applications to send print commands.

> **Download**: [Get Topbridge App](https://service.topsale.co.nz/self-service/download/topbridge)

:::tip Looking for a complete solution?
Visit the [TopSale label printing website](https://topsale.biz/solution/label-printing/) to learn more about our fully managed platform.
:::

## What Problems Does the SDK Solve

`@appzgatenz/label-print-topbridge-js` is a Headless (no UI) browser SDK that encapsulates all communication details with Topbridge App:

- **WebSocket Connection Management** — Short-connection model: auto connect, send, receive, and close for each call
- **Topbridge App Launch & Retry** — Launch orchestration via the `launch` module with automatic retry logic
- **Data Transformation** — Automatically converts flat product data into the nested structure required by Topbridge App based on template schema
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
    └── launch        Topbridge App launch + retry orchestration
    │
    ▼  WebSocket (Local)
Topbridge App (Local Desktop Application)
    │
    ▼
Label Printer
```

## How It Works

1. **Initialize** — Create a `TopBridgeClient` instance in your browser app
2. **Preflight** — Run health check, validate entitlements, and discover printers
3. **Print** — Submit a print request with flat product data; the SDK automatically fetches the template schema and transforms the data into the format Topbridge App expects

The SDK handles all WebSocket communication internally. You only interact with the high-level module API — no need to manage connections, parse protocol messages, or handle data transformation manually.

## Internal Architecture

The SDK is organized in four conceptual layers:

```
Public API Layer     TopBridgeClient (Facade)
                         │
Module Layer         health · benefits · printers · templates · print · preflight · launch
                         │
Transport Layer      Communication with Topbridge App (short-connection model)
                         │
Utility Layer        Data transformation · Input validation · Launch orchestration
```

- **Public API Layer** — `TopBridgeClient` is the single entry point. It orchestrates all modules and hides internal complexity.
- **Module Layer** — 7 independent modules, each responsible for a specific business domain. All public methods are async and return typed responses.
- **Transport Layer** — Handles communication with Topbridge App using a short-connection model (connect → send → receive → close per call).
- **Utility Layer** — Provides data transformation, input validation, and launch orchestration used internally by modules.

## Package Info

| Property | Value |
|----------|-------|
| Package | `@appzgatenz/label-print-topbridge-js` |
| Size | ~3.2 KB gzipped |
| Dependencies | Zero runtime dependencies |
| Formats | ESM + CJS dual output |
| Tree-shaking | Supported (`sideEffects: false`) |
| Node.js | >= 18 |
