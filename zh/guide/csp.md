---
title: CSP 配置
---

# CSP 配置

## 什么是 CSP

**内容安全策略（Content Security Policy，CSP）** 是一个 HTTP 安全响应头，用于控制你的网页允许加载哪些资源。它通过指定允许的脚本、样式、框架等资源来源，帮助防止跨站脚本攻击（XSS）和其他代码注入攻击。

> **了解更多**：[MDN — 内容安全策略（CSP）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP)

## 为什么需要配置

TopBridge App 使用自定义协议（`topsale://`）实现自动唤起。SDK 通过创建隐藏 iframe 并设置 `src="topsale://callback"` 来触发唤起。如果你的页面有 CSP 限制 frame 来源，iframe 加载会被静默阻止——TopBridge App 无法唤起，`ensureRunning()` 会失败。

## 必要配置

在你的 `frame-src` 指令中添加 `topsale:`：

```
Content-Security-Policy: frame-src 'self' topsale:
```

如果已有包含 `frame-src` 的 CSP 策略，追加 `topsale:` 即可：

```
Content-Security-Policy: frame-src 'self' https://trusted.cdn.com topsale:
```

> **仅在使用唤起功能时需要**：如果不使用 `client.launch.trigger()` 或 `client.launch.ensureRunning()`，则无需配置 CSP。

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
            value: "frame-src 'self' topsale:",
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

## 验证方法

验证 CSP 配置是否正确：

1. 在浏览器中打开你的页面
2. 打开开发者工具 → 控制台
3. 查找类似 `Refused to frame 'topsale://...'` 的 CSP 违规错误
4. 如果调用 `client.launch.trigger()` 时没有报错，说明 CSP 配置正确

## 常见问题

### 唤起静默失败

**症状**：`ensureRunning()` 不断重试但 TopBridge App 没有打开。

**原因**：CSP 阻止了 `topsale:` 协议。检查控制台中是否有 CSP 违规消息。

### 与现有 CSP 冲突

如果你的应用已有 CSP 响应头，不要替换它——在现有 `frame-src` 指令中追加 `topsale:`。如果没有 `frame-src`，添加整个指令。

### `<meta>` 标签 vs HTTP 响应头

两种方式都有效。HTTP 响应头（由服务器或框架配置）优先于 `<meta>` 标签。两者同时存在时，仅使用 HTTP 响应头。
