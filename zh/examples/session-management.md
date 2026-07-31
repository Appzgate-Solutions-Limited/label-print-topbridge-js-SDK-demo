---
title: Session 管理示例
---

# Session 管理示例

当账号活跃会话数超限时，服务端会以 `SESSION_LIMIT_EXCEEDED`（`TopBridgeSessionError`）阻断所有需要鉴权的 API。本示例演示完整解除流程：**捕获 → 读取 `err.sessions` → `kickSession()` → 检查 `withinLimit` → 重试**——无需重新登录。

## 实时演示

<Playground template="session-management" />

## 关键要点

- **设计上无状态**——SDK 不维护阻断状态，每次鉴权调用都可能抛 `TopBridgeSessionError`，因此需在关键调用处逐一捕获。
- **`isCurrent: true`** 标记当前设备。踢掉它会导致本机立即登出——除非用户有意登出，否则始终将其排除在踢出列表之外。
- **`withinLimit`** 标识阻断是否已解除（`true` → 立即重试；`false` → 继续踢出更多会话）。
- **无需重新登录**——解除阻断不需要再次 `ssologin`，TopBridge 登录态全程有效。

完整错误类层级见[错误处理](/zh/guide/error-handling)，`kickSession` 签名见 [API 参考](/zh/guide/api-reference)。
