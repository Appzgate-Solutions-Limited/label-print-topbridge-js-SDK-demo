---
title: 安全模型
---

# 安全模型

## 概述

`@appzgatenz/label-print-topbridge-js` 采用多层安全防御机制，防止未授权调用和数据泄露。

## 1. 固定本地连接

SDK 使用固定的、不可配置的连接端点。默认模式连接本地 TopBridge App，也可选启用安全（WSS）模式。这从根本上防止 SDK 流量被重定向到任意服务器。

## 2. 来源校验

SDK 在所有请求中包含调用方来源标识（`source`）进行来源验证。未授权的调用会被 TopBridge App 拒绝。

## 3. URL 安全校验

在展示 TopBridge App 错误响应中的外部链接前，SDK 会校验协议：

```typescript
// 仅允许以下协议
'https://' ✅
'ms-windows-store://' ✅
'http://' ❌
'javascript:' ❌
'data:' ❌
```

## 4. 输入净化

SDK 自动从打印数据中剥离公式注入前缀，防止注入攻击。处理 `textfield` 类型字段时，以 `=` 或 `=@` 开头的值会被自动清洗：

```
'=SUM(A1:A10)'  →  'SUM(A1:A10)'
'=@cmd'          →  'cmd'
'==nested'       →  'nested'
```

此防护自动生效，开发者无需手动清洗数据。

## 5. 构建时防护

发布的 npm 包应用了多重构建时防护：

- **代码压缩** — 生产代码经过压缩和混淆处理
- **Tree-shaking** — 构建时消除未使用代码
- **无 source map** — npm 包不发布 source map 文件

## 已知限制

| 限制 | 说明 | 缓解措施 |
|------|------|---------|
| 浏览器无法防止页面模拟 | 其他网页可能尝试与打印服务交互 | TopBridge App 内置来源校验机制 |
| 本地模式未加密 | 默认 localhost 连接不加密 | 启用 WSS 模式可加密通信；本地模式无网络传输风险 |
