---
title: Overview & Architecture
---

# Overview & Architecture

## What is TopBridge

TopBridge is a desktop application running on the user's local machine (referred to as "Topbridge App"). It manages label printers, templates, and user entitlements. It exposes APIs via the WebSocket protocol locally, allowing browser applications to send print commands.

> **Download**: [Get Topbridge App](https://service.topsale.co.nz/self-service/download/topbridge)

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
    ▼  WebSocket (fixed ws://localhost:8765/v2)
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
