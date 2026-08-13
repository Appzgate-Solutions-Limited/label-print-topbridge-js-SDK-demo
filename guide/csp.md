---
title: CSP Configuration
---

# CSP Configuration

## What is CSP

**Content Security Policy (CSP)** is an HTTP security header that controls which resources your web page is allowed to load. It helps prevent cross-site scripting (XSS) and other code injection attacks by specifying approved sources for scripts, styles, frames, connections, and other resources.

> **Learn more**: [MDN — Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Why TopBridge Needs CSP

TopBridge SDK uses two browser features that a restrictive CSP can block:

1. **WebSocket connections** — The SDK communicates with TopBridge App via `ws://localhost:8765/v2` (default) or `wss://topbridge.topsale.co.nz:8764/v2` (WSS mode). If your CSP restricts `connect-src`, these connections will be **silently blocked** — the SDK reports `NOT_RUNNING` even though TopBridge App is installed and running.

2. **Custom protocol iframe** — `client.launch.trigger()` creates a hidden iframe with `src="topsale://callback"` to auto-launch the desktop app. If your CSP restricts `frame-src`, the iframe load will be blocked and the launch fails silently.

## Required Configuration

### `connect-src` — WebSocket (always required)

The SDK always needs WebSocket access to TopBridge App. Both endpoints must be allowed:

```
Content-Security-Policy: connect-src 'self' ws://localhost:8765 wss://topbridge.topsale.co.nz:8764
```

::: tip Why both endpoints?
Even if you only use the default WS mode (`wssEnabled: false`), allow both `ws://localhost:8765` and `wss://topbridge.topsale.co.nz:8764` so that switching `wssEnabled` at runtime does not break the connection.
:::

### `frame-src` — Launch protocol (conditional)

Required only if you use `client.launch.trigger()` or `client.launch.ensureRunning()`:

```
Content-Security-Policy: frame-src 'self' topsale:
```

If you already have a CSP with `frame-src`, append `topsale:` to the existing policy:

```
Content-Security-Policy: frame-src 'self' https://trusted.cdn.com topsale:
```

::: info Only needed for launch features
If you don't use `client.launch.trigger()` or `client.launch.ensureRunning()`, the `frame-src topsale:` directive is not needed. The `connect-src` directives above are always required.
:::

### Combined policy

Most applications should set both directives in a single CSP header:

```
Content-Security-Policy: connect-src 'self' ws://localhost:8765 wss://topbridge.topsale.co.nz:8764; frame-src 'self' topsale:
```

## Framework-Specific Configuration

### Next.js (App Router)

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "connect-src 'self' ws://localhost:8765 wss://topbridge.topsale.co.nz:8764",
              "frame-src 'self' topsale:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
```

### React (Vite / CRA)

For Vite, configure CSP via a middleware or hosting config. For CRA, use a `<meta>` tag in `public/index.html`:

```html
<meta http-equiv="Content-Security-Policy" content="connect-src 'self' ws://localhost:8765 wss://topbridge.topsale.co.nz:8764; frame-src 'self' topsale:">
```

### Vue / Nuxt.js

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/**': {
      headers: {
        'Content-Security-Policy': [
          "connect-src 'self' ws://localhost:8765 wss://topbridge.topsale.co.nz:8764",
          "frame-src 'self' topsale:",
        ].join('; '),
      },
    },
  },
})
```

### SvelteKit

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event)
  response.headers.set(
    'Content-Security-Policy',
    [
      "connect-src 'self' ws://localhost:8765 wss://topbridge.topsale.co.nz:8764",
      "frame-src 'self' topsale:",
    ].join('; '),
  )
  return response
}
```

## Verification

To verify your CSP is correctly configured:

1. Open your page in a browser
2. Open DevTools → Console
3. **For WebSocket**: call `client.printers.list()` (or any SDK method that connects). If no CSP violation appears and the method succeeds, `connect-src` is correctly configured. Look for errors like `Refused to connect to 'ws://localhost:8765/...'` or `Refused to connect to 'wss://topbridge.topsale.co.nz:8764/...'`.
4. **For Launch**: call `client.launch.trigger()`. If no CSP violation appears and TopBridge App opens, `frame-src` is correctly configured. Look for errors like `Refused to frame 'topsale://...'`.

## Common Issues

### WebSocket connection silently fails

**Symptom**: SDK methods return `NOT_RUNNING` or `TopBridgeConnectionError`, but TopBridge App is installed and running.

**Cause**: CSP is blocking the WebSocket connection to `ws://localhost:8765` or `wss://topbridge.topsale.co.nz:8764`. Check the Console for `Refused to connect to 'ws://...'` CSP violation messages.

**Fix**: Add both WebSocket endpoints to your `connect-src` directive.

### Launch silently fails

**Symptom**: `ensureRunning()` keeps retrying but TopBridge App doesn't open.

**Cause**: CSP is blocking the `topsale:` protocol. Check the Console for CSP violation messages.

### Mixed with existing CSP

If your application already has a CSP header, don't replace it — append the TopBridge directives to your existing policy. If your CSP doesn't have `connect-src` or `frame-src`, add the entire directive.

### Using `<meta>` tag vs HTTP header

Both approaches work. HTTP headers (set by your server or framework config) take priority over `<meta>` tags. If both are present, only the HTTP header is used.
