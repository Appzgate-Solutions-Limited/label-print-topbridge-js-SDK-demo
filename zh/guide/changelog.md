---
title: 更新日志
---

# 更新日志

:::tip
本页镜像 `@appzgatenz/label-print-topbridge-js` 的 [CHANGELOG.md](https://github.com/Appzgate-Solutions-Limited/label-print-topbridge-js/blob/main/CHANGELOG.md)，随 SDK 每次发版手动同步。
:::

## 0.6.2

### Patch Changes

- 容忍结构化 widget 的拍平点号 schema 字段名。部分 TopBridge App 构建会在 `template` schema 中输出 `price.currency` / `price.value` 条目，而非单个父级 `price` 字段；`planFields` 现在会把点号前缀（`price`）注册为结构化字段，使嵌套对象与点路径两种产品输入均可正确通过校验。显式声明的父字段始终优先。

本包的所有重要变更均记录于本文件。0.6.1 及之前的条目在采用 [Changesets](https://github.com/changesets/changesets) 时依据带 tag 的 Git 历史重建；之后的条目由 changeset 片段生成。撰写与发布流程见 SDK 仓库的[撰写与发布文档](https://github.com/Appzgate-Solutions-Limited/label-print-topbridge-js/blob/main/docs/changelog-and-release.md)。

## 0.6.1

### Patch Changes

- 3c4cf12: 新增 `printerSetup.reset()`，用于清除打印机的协议配置而不改变 Windows 默认打印机。`printerSetup.list()` 与 `printerSetup.getOptions()` 现在也返回描述每台打印机配置的 `protocol` 与 `protocolLabel` 字段。

## 0.6.1-beta.0

### Patch Changes

- c866d5f: 公开的推送事件契约与 WebSocket API v2 对齐。`TemplateEvent` 与 `UserEvent` 现在是按 `action` 区分的判别联合类型；`BenefitsData.expiresAt` 现在可以为 `null`；`RefreshTemplatesFullResponse` 现在区分 `ok`（同步计数）与 `warning`（完整同步已在运行）。

## 0.6.0

### Minor Changes

- aad57ba: 新增 `session` 模块，提供 `client.session.kickSession()`，用于在 SessionBlocked 登录场景下踢除现有 Keycloak 会话以解除阻塞。会话数超限现在以新的 `TopBridgeSessionError`（服务端代码 `SESSION_LIMIT_EXCEEDED`）呈现。
- aad57ba: 新增强制刷新 API：`client.benefits.refreshBenefit()` 按需重新校验打印权益，`client.templates.refreshTemplates()` 支持完整同步与按 ID 两种模式。

## 0.5.3

### Minor Changes

- 90c7246: 新增 `templates.json()`，批量获取指定模板的完整 JSON 数据；缺失的模板以警告形式报告，不再使整个请求失败。

## 0.5.2-beta.1

### Minor Changes

- f8bf178: **Breaking** — BPAC 安装失败原因与 WebSocket API v2 对齐：移除 `INSTALL_NOT_COMPLETED`，改用 `INSTALL_FAILED` / `INSTALL_TIMEOUT`；`InstallResult.detail` 更名为 `message`。
- fdd1078: **Breaking** — 移除 BPAC 字体管理。`addFont` / `deleteFont` 不再接受 `'BPAC'` 协议；此类请求现在会在客户端被拒绝，因为服务端报告其不受支持。

## 0.5.2-beta.0

### Minor Changes

- a9d94e5: 为 `printerSetup` 新增字符集与字体管理（`addCharset` / `deleteCharset` / `addFont` / `deleteFont`），含客户端输入校验。
- 1c1b138: 新增异步 BPAC 安装处理——`printerSetup.configure()` 现在会桥接 `pending` 安装状态，并在 BPAC 向导完成后 resolve。
- 1c1b138: 改进连接韧性：共享连接在空闲宽限期后自动关闭；重连采用带抖动的指数退避，并限制尝试次数。

## 0.5.0

### Minor Changes

- 168f2ad: 新增 `printerSetup` 模块，用于配置已安装的打印机（加载选项、列出打印机、更新设置）。
- 0525054: 引入混合连接模型：轻量请求与服务端推送事件（`printer` / `template` / `user`）共享一条由 `ConnectionManager` 管理的长连接，而 `print` 保持独立短连接以避免队头阻塞。
- 0525054: 通过 `client.events` 新增类型化推送事件订阅、显式连接控制（`client.connect()` / `client.close()` / `client.getConnectionState()`），以及新的 `TopBridgePrinterSetupError`。

---

_0.5.0 之前的版本（0.3.x–0.4.0）早于 changelog 跟踪机制，本文件不覆盖。_
