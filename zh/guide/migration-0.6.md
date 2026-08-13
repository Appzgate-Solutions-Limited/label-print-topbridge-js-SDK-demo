---
title: 迁移到 0.6
---

# 迁移到 0.6

本指南帮助你从约 0.3 至 0.5.x 时代的文档与集成，升级到 `@appzgatenz/label-print-topbridge-js@0.6.x`。

:::tip
`@appzgatenz/label-print-topbridge-js@0.6.2` 已发布到 npm。0.6.x API 已稳定。
:::

## 一览变更

| 领域 | ~0.3 心智模型 | 0.6 行为 |
|------|---------------|----------|
| 连接 | 每次调用短连接 | **混合模型**：轻量 API + 事件共享长连接；打印使用独立短连接 |
| 模块 | 7 个模块 | **10 个模块** + `client.events`（新增 `whoami`、`printerSetup`、`session`） |
| 错误 | 约 11 类；`UPDATE_REQUIRED` 常写在 Auth 下 | **14 类**；`UPDATE_REQUIRED` → `TopBridgeVersionError`；新增 PrinterSetup / Session 错误 |
| 配置 | `health` / `preflight` / `print` 超时 | 新增 `timeouts.printerSetup`、`timeouts.refresh`；默认 `source: 'Core-SDK'` |
| 模板 / 权益 | list + schema / check | 新增 `templates.json`、`templates.refreshTemplates`、`benefits.refreshBenefit` |
| 生命周期 | 仅隐式管理 | `connect()`、`close()`、`getConnectionState()` |

## 推荐升级步骤

1. 安装 `0.6.x`（正式版走 npm；beta 在 `develop` 走 CodeArtifact）。
2. 修正错误处理：把 `UPDATE_REQUIRED` 迁到 `TopBridgeVersionError`。
3. 保留现有打印路径（`preflight` → `templates` → `print`）——仍然可用。
4. 仅在需要时接入新能力：
   - SessionBlocked → `TopBridgeSessionError` + `client.session.kickSession`
   - 打印机协议 / BPAC → `client.printerSetup`
   - 实时更新 → `client.events.on(...)`
5. 按需调整 `timeouts.refresh` / `timeouts.printerSetup`。

## 破坏性 / 高影响注意点

### 1. `UPDATE_REQUIRED` 不再属于 AuthError

```typescript
// 旧写法（在 0.6 上不正确）
if (err instanceof TopBridgeAuthError && err.code === 'UPDATE_REQUIRED') { /* ... */ }

// 新写法
if (err instanceof TopBridgeVersionError) {
  window.open(err.storeUrl ?? err.downloadUrl)
}
```

### 2. 不要假设每次调用都新建短连接

轻量 API 与事件订阅复用同一条共享连接。若你以前按「一次调用 = 一个 socket」清理资源，请改为仅在主动拆除共享通道时调用 `client.close()`。

### 3. 生产 UI 应新增捕获的错误

```typescript
catch (err) {
  if (err instanceof TopBridgeSessionError) {
    const ids = (err.sessions ?? []).map((s) => s.id)
    await client.session.kickSession(ids)
    // 重试原请求
  }
  if (err instanceof TopBridgePrinterSetupError) {
    console.error(err.code, err.message)
  }
}
```

### 4. `template` / `user` 事件载荷改为判别联合类型

0.5.x 中 `TemplateEvent` 与 `UserEvent` 是扁平接口，`before`/`after` 始终存在（可为 null）。0.6 起改为按 `action` 区分的判别联合——不同分支字段不同。直接读取 `event.before` 或判断 `event.action === 'created'` 的代码将不再通过类型检查。

```typescript
// 0.5.x——扁平结构：存在 'created'，before/after 始终存在
client.events.on('template', (e) => {
  if (e.action === 'created') { /* ... */ } // 'created' 已不存在
  console.log(e.before?.templateName)        // 'before' 已移除
})

// 0.6——判别联合：按 action 收窄
client.events.on('template', (e) => {
  if (e.action === 'updated') { console.log(e.after.templateName) }
  if (e.action === 'deleted') { /* e 无 `after` */ }
})

client.events.on('user', (e) => {
  if (e.action === 'login' && e.sessionLimitExceeded) {
    // e.sessionLimit 为 SessionLimit 快照（已阻断）
  }
  if (e.action === 'session_updated') {
    // 新增 action——无 before/after，仅 sessionLimitExceeded + sessionLimit
  }
})
```

主要移除：`TemplateEvent` 不再发射 `'created'`（新模板以 `'updated'` 通知）且无 `before`；`UserEvent` 新增 `'session_updated'`，`before`/`after` 仅存在于 `'login'`/`'logout'`。

:::warning TypeScript 破坏性变更
若在 0.5.x 消费 `template` 或 `user` 事件，升级后会出现编译错误。请按 `action` 收窄，并移除 `before` / `'created'` 相关引用。
:::

## 增量 API（不使用则无破坏）

```typescript
await client.whoami.check()
await client.benefits.refreshBenefit()
await client.templates.json(['tpl-1', 'tpl-2'])
await client.templates.refreshTemplates()

const setup = await client.printerSetup.load()
const off = client.events.on('template', (e) => console.log(e))
```

Session 超限流程见交互式 [Session 管理示例](/zh/examples/session-management)。打印机配置与事件的深度指南规划中；当前请先看 [API 速查表](/zh/guide/api-reference)。

## 兼容性清单

- [ ] 已将 AuthError 的 `UPDATE_REQUIRED` 分支改为 `TopBridgeVersionError`
- [ ] 在适用多端会话限制的场景捕获 `TopBridgeSessionError`
- [ ] 若调用 `printerSetup.*`，已捕获 `TopBridgePrinterSetupError`
- [ ] `template`/`user` 事件处理已按 `action` 收窄（移除 `'created'` / `before`）
- [ ] 使用 `launch` 时 CSP 仍允许 `topsale:`
- [ ] 确认 Tray App 支持 WebSocket API V2（`/v2`）
