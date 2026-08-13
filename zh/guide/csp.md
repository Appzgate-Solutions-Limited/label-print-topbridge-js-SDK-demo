---
title: CSP 配置
---

# CSP 配置

## 什么是 CSP

**内容安全策略（Content Security Policy，CSP）** 是一个 HTTP 安全响应头，用于控制你的网页允许加载哪些资源。它通过指定允许的脚本、样式、框架、连接等资源来源，帮助防止跨站脚本攻击（XSS）和其他代码注入攻击。

> **了解更多**：[MDN — 内容安全策略（CSP）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP)

## 为什么需要配置

TopBridge SDK 使用两个浏览器特性，如果 CSP 策略较严格，可能会被拦截：

1. **WebSocket 连接** — SDK 通过 `ws://localhost:8765/v2`（默认）或 `wss://topbridge.topsale.co.nz:8764/v2`（WSS 模式）与 TopBridge App 通信。如果你的 CSP 限制了 `connect-src`，这些连接会被**静默拦截** — SDK 报告 `NOT_RUNNING`，但 TopBridge App 实际已安装且正在运行。

2. **自定义协议 iframe** — `client.launch.trigger()` 通过创建隐藏 iframe 并设置 `src="topsale://callback"` 来自动唤起桌面应用。如果你的 CSP 限制了 `frame-src`，iframe 加载会被阻止，唤起静默失败。

## 必要配置

### `connect-src` — WebSocket（始终必需）

SDK 始终需要通过 WebSocket 访问 TopBridge App。两个端点都必须放行：

```
Content-Security-Policy: connect-src 'self' ws://localhost:8765 wss://topbridge.topsale.co.nz:8764
```

::: tip 为什么要同时放行两个端点？
即使你只使用默认 WS 模式（`wssEnabled: false`），也应同时放行 `ws://localhost:8765` 和 `wss://topbridge.topsale.co.nz:8764`，这样在运行时切换 `wssEnabled` 不会中断连接。
:::

### `frame-src` — 唤起协议（条件必需）

仅在使用 `client.launch.trigger()` 或 `client.launch.ensureRunning()` 时需要：

```
Content-Security-Policy: frame-src 'self' topsale:
```

如果已有包含 `frame-src` 的 CSP 策略，追加 `topsale:` 即可：

```
Content-Security-Policy: frame-src 'self' https://trusted.cdn.com topsale:
```

::: info 仅在使用唤起功能时需要
如果不使用 `client.launch.trigger()` 或 `client.launch.ensureRunning()`，则无需配置 `frame-src topsale:`。但上方的 `connect-src` 指令始终必需。
:::

### 合并策略

大多数应用应在单个 CSP 响应头中同时设置两个指令：

```
Content-Security-Policy: connect-src 'self' ws://localhost:8765 wss://topbridge.topsale.co.nz:8764; frame-src 'self' topsale:
```

## 各框架配置方式

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

Vite 项目可通过中间件或托管配置。CRA 项目可在 `public/index.html` 中使用 `<meta>` 标签：

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

## 验证方法

验证 CSP 配置是否正确：

1. 在浏览器中打开你的页面
2. 打开开发者工具 → 控制台
3. **WebSocket 验证**：调用 `client.printers.list()`（或任何需要连接的 SDK 方法）。如果没有 CSP 违规报错且方法执行成功，说明 `connect-src` 配置正确。注意查找类似 `Refused to connect to 'ws://localhost:8765/...'` 或 `Refused to connect to 'wss://topbridge.topsale.co.nz:8764/...'` 的错误。
4. **唤起验证**：调用 `client.launch.trigger()`。如果没有 CSP 违规报错且 TopBridge App 成功打开，说明 `frame-src` 配置正确。注意查找类似 `Refused to frame 'topsale://...'` 的错误。

## 常见问题

### WebSocket 连接静默失败

**症状**：SDK 方法返回 `NOT_RUNNING` 或 `TopBridgeConnectionError`，但 TopBridge App 已安装且正在运行。

**原因**：CSP 拦截了到 `ws://localhost:8765` 或 `wss://topbridge.topsale.co.nz:8764` 的 WebSocket 连接。检查控制台中是否有 `Refused to connect to 'ws://...'` 的 CSP 违规消息。

**修复**：将两个 WebSocket 端点添加到 `connect-src` 指令中。

### 唤起静默失败

**症状**：`ensureRunning()` 不断重试但 TopBridge App 没有打开。

**原因**：CSP 阻止了 `topsale:` 协议。检查控制台中是否有 CSP 违规消息。

### 与现有 CSP 冲突

如果你的应用已有 CSP 响应头，不要替换它——将 TopBridge 所需的指令追加到现有策略中。如果没有 `connect-src` 或 `frame-src`，添加整个指令。

### `<meta>` 标签 vs HTTP 响应头

两种方式都有效。HTTP 响应头（由服务器或框架配置）优先于 `<meta>` 标签。两者同时存在时，仅使用 HTTP 响应头。
