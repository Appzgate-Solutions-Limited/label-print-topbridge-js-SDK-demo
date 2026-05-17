---
title: 故障排查
---

# 故障排查

## Q: 调用 API 时抛出 TopBridgeConnectionError

**原因**：无法连接到 Topbridge App。SDK 固定连接 `ws://localhost:8765`（内部自动拼接 `/v2`）。

**排查步骤**：
1. 确认 Topbridge App 已安装（[下载](https://service.topsale.co.nz/self-service/download/topbridge)）并正在运行
2. 检查应用是否被防火墙阻止
3. 确认应用版本 >= 1.0.45（支持 V2 API）
4. 使用 `client.launch.ensureRunning()` 自动处理 Topbridge App 唤起和重试

## Q: 抛出 TopBridgeAuthError(code: 'NOT_AUTHENTICATED')

**原因**：Topbridge App 在运行但用户未登录。

**处理**：引导用户打开 Topbridge App 完成登录，然后重试。

## Q: 抛出 TopBridgeAuthError(code: 'UPDATE_REQUIRED')

**原因**：用户安装的 Topbridge App 版本低于最低要求。

**处理**：使用 `err.storeUrl`（Microsoft Store）或 `err.downloadUrl`（直接下载）引导用户更新。

## Q: TopBridgeQuotaError 但用户确认配额充足

**排查**：
- 检查 `benefits.data.expiresAt` 是否已过期
- 检查 `benefits.data.hasPrintBenefit` 是否为 `true`
- `err.reason` 包含具体原因

## Q: 抛出 TopBridgePrinterError 但用户确认打印机已连接

**原因**：Topbridge App 要求打印机配置了通信协议（TSPL / ZPL），仅连接不够。

**排查**：
1. 确认打印机在 Topbridge App 中已同步
2. 确认已为打印机配置 TSPL 或 ZPL 协议
3. 未配置协议的打印机不会出现在 `printers.list()` 的结果中

## Q: 在 Next.js SSR 中使用报错

**原因**：SDK 依赖浏览器原生 `WebSocket` API，在 Node.js 服务端不存在。

**解决方案**：确保仅在客户端调用 SDK。使用动态导入：

```typescript
// Next.js 页面组件中
useEffect(() => {
  import('@appzgatenz/label-print-topbridge-js').then(({ TopBridgeClient }) => {
    const client = new TopBridgeClient()
    // ... 在这里使用 client
  })
}, [])
```

或使用 `'use client'` 指令确保组件仅在客户端渲染。

## Q: 打印成功但响应中包含 warnings

**原因**：SDK 在数据转换过程中检测到非致命的格式问题并自动处理，打印仍然正常执行。

详见[警告处理](/zh/guide/error-handling#warning-handling)。
