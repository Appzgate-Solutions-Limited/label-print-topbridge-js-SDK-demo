---
title: 故障排查
---

# 故障排查

## Q: 调用 API 时抛出 TopBridgeConnectionError

**原因**：无法连接到 TopBridge App。SDK 通过内部本地通信通道与 TopBridge App 通信。

**排查步骤**：
1. 确认 TopBridge App 已安装（[下载](https://service.topsale.co.nz/self-service/download/topbridge)）并正在运行
2. 检查应用是否被防火墙阻止
3. 确认应用版本 >= 1.0.45（支持 V2 API）
4. 使用 `client.launch.ensureRunning()` 自动处理 TopBridge App 唤起和重试

:::tip 仍然遇到问题？
访问 [TOPSALE 自助服务平台](https://service.topsale.co.nz/self-service) 获取支持资源和账户管理。
:::

## Q: 抛出 TopBridgeAuthError(code: 'NOT_AUTHENTICATED')

**原因**：TopBridge App 在运行但用户未登录。

**处理**：引导用户打开 TopBridge App 完成登录，然后重试。

## Q: 抛出 TopBridgeAuthError(code: 'UPDATE_REQUIRED')

**原因**：用户安装的 TopBridge App 版本低于最低要求。

**处理**：使用 `err.storeUrl`（Microsoft Store）或 `err.downloadUrl`（直接下载）引导用户更新。

## Q: TopBridgeQuotaError 但用户确认配额充足

**排查**：
- 检查 `benefits.data.expiresAt` 是否已过期
- 检查 `benefits.data.hasPrintBenefit` 是否为 `true`
- `err.reason` 包含具体原因

## Q: 抛出 TopBridgePrinterError 但用户确认打印机已连接

**原因**：TopBridge App 要求打印机配置了通信协议（TSPL / ZPL），仅连接不够。

**排查**：
1. 确认打印机在 TopBridge App 中已同步
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

**原因**：SDK 或 TopBridge Tray App 检测到非致命问题。打印仍然正常执行，但输出效果可能与预期不符。

**常见警告**：

| code | 含义 | 建议处理 |
|------|------|---------|
| `DPI_MISMATCH` | 打印机 DPI 与模板预设 DPI 不匹配 | 检查打印机 DPI 设置是否正确，可能出现缩放或对齐偏移 |
| `SIZE_MISMATCH` | 模板尺寸与打印机装载的介质尺寸不匹配 | 检查装载的标签纸尺寸是否与模板设计尺寸一致，可能出现内容截断或偏移（目前仅 Brother 打印机） |
| `DATA_FORMAT` | SDK 自动修复了数据格式问题（如截断换行符） | 通常可安全忽略，查看 `w.message` 了解详情 |

```typescript
if (result.warnings?.length) {
  for (const w of result.warnings) {
    if (w.code === 'SIZE_MISMATCH' || w.code === 'DPI_MISMATCH') {
      console.warn(`打印质量警告: ${w.message}`)
    }
  }
}
```

详见[警告处理](/zh/guide/error-handling#warning-handling)。
