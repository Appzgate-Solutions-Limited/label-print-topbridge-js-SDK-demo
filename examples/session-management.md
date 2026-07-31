---
title: Session Management Example
---

# Session Management Example

When an account exceeds its active-session limit, the server blocks every authenticated API with `SESSION_LIMIT_EXCEEDED` (`TopBridgeSessionError`). This demo shows the full unblock flow: **catch → read `err.sessions` → `kickSession()` → check `withinLimit` → retry** — no re-login required.

## Live Demo

<Playground template="session-management" />

## Key points

- **Stateless by design** — the SDK does not track the blocked state; any authenticated call may throw `TopBridgeSessionError`, so catch it at every call site that matters.
- **`isCurrent: true`** marks the current device. Kicking it logs this device out — always exclude it from the kick list unless the user intends to log off.
- **`withinLimit`** on the kick response tells you whether the block is cleared (`true` → retry immediately; `false` → kick more sessions).
- **No re-login** — clearing the block does not require `ssologin` again; the TopBridge login stays valid throughout.

See [Error Handling](/guide/error-handling) for the full error class hierarchy and [API Reference](/guide/api-reference#module-methods) for `kickSession` details.
