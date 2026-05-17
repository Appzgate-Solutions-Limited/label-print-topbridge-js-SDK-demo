---
title: 安全模型
---

# 安全模型

## 概述

`@appzgatenz/label-print-topbridge-js` 采用多层安全防御机制，防止未授权调用和数据泄露。

## 1. 固定本地连接

SDK 仅与本地运行的 Topbridge App 通信。没有连接地址的配置选项，从根本上防止将 SDK 重定向到远程服务器。

## 2. 来源校验

SDK 请求携带调用方来源标识，由服务端验证。来自未授权来源的请求会被 Topbridge App 拒绝。

## 3. URL 安全校验

在展示 Topbridge App 错误响应中的外部链接前，SDK 会校验协议：

```typescript
// 仅允许以下协议
'https://' ✅
'ms-windows-store://' ✅
'http://' ❌
'javascript:' ❌
'data:' ❌
```

## 4. 输入净化

SDK 自动从打印数据中剥离公式注入前缀（如 `=` 和 `=@`），防止注入攻击。

## 已知限制

| 限制 | 说明 | 缓解措施 |
|------|------|---------|
| 浏览器无法防止页面模拟 | 恶意页面可以自行实现 WS 协议 | Topbridge App 来源校验 + 服务端验证 |
| WS 协议未加密 | localhost 通信默认不加密 | 本地通信无需加密（无网络传输风险） |
