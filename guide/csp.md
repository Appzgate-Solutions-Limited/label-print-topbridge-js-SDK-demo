---
title: CSP Configuration
---

# CSP Configuration

## What is CSP

**Content Security Policy (CSP)** is an HTTP security header that controls which resources your web page is allowed to load. It helps prevent cross-site scripting (XSS) and other code injection attacks by specifying approved sources for scripts, styles, frames, and other resources.

> **Learn more**: [MDN — Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Why Topbridge Needs CSP

Topbridge App uses a custom protocol (`topsale://`) for auto-launch. The SDK triggers this by creating a hidden iframe with `src="topsale://callback"". If your page has a CSP that restricts frame sources, this iframe load will be silently blocked — Topbridge App won't launch and `ensureRunning()` will fail.

## Required Configuration

Add `topsale:` to your `frame-src` directive:

```
Content-Security-Policy: frame-src 'self' topsale:
```

If you already have a CSP with `frame-src`, append `topsale:` to the existing policy:

```
Content-Security-Policy: frame-src 'self' https://trusted.cdn.com topsale:
```

> **Only needed for launch features**: If you don't use `client.launch.trigger()` or `client.launch.ensureRunning()`, no CSP configuration is needed.

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
            value: "frame-src 'self' topsale:",
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
<meta http-equiv="Content-Security-Policy" content="frame-src 'self' topsale:">
```

### Vue / Nuxt.js

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/**': {
      headers: {
        'Content-Security-Policy': "frame-src 'self' topsale:",
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
    "frame-src 'self' topsale:"
  )
  return response
}
```

## Verification

To verify your CSP is correctly configured:

1. Open your page in a browser
2. Open DevTools → Console
3. Look for CSP violation errors like `Refused to frame 'topsale://...'`
4. If no errors appear when calling `client.launch.trigger()`, your CSP is correctly configured

## Common Issues

### Launch silently fails

**Symptom**: `ensureRunning()` keeps retrying but Topbridge App doesn't open.

**Cause**: CSP is blocking the `topsale:` protocol. Check the Console for CSP violation messages.

### Mixed with existing CSP

If your application already has a CSP header, don't replace it — append `topsale:` to the existing `frame-src` directive. If your CSP doesn't have `frame-src`, add the entire directive.

### Using `<meta>` tag vs HTTP header

Both approaches work. HTTP headers (set by your server or framework config) take priority over `<meta>` tags. If both are present, only the HTTP header is used.
