---
title: 调试与日志
---

# 调试与日志

## 快速调试

开发环境设置 `debug: true` 即可在浏览器控制台查看所有 SDK 通信日志：

```typescript
const client = new TopBridgeClient({ debug: true })
```

日志格式：`[TopBridge] [模块名] 消息内容`

## 自定义 Logger

将 SDK 日志接入监控系统（Sentry / Datadog 等）：

```typescript
import type { Logger } from '@appzgatenz/label-print-topbridge-js'

const logger: Logger = {
  debug: (...args) => { /* 开发环境输出 */ },
  info: (...args) => { /* 记录信息 */ },
  warn: (...args) => { /* 记录警告 */ },
  error: (...args) => Sentry.captureException(args[0]),
}

const client = new TopBridgeClient({ logger })
```

自定义 Logger 优先级高于 `debug: true`。提供了自定义 Logger 时，`debug` 标志会被忽略。

## 生产环境建议

- **不设置 `debug: true`** — 生产环境默认关闭所有日志
- **使用自定义 Logger** — 仅将 error 级别日志发送到监控系统，避免泄露通信细节
- **不要在用户可见的 UI 中展示原始错误消息** — 使用[错误与场景对照表](/zh/guide/error-handling#错误与场景对照)将错误转换为用户友好的提示
