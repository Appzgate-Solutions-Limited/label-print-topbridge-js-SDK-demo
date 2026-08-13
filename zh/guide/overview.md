---
title: 概述与架构
---

# 概述与架构

## 什么是 TopBridge

TopBridge 是运行在用户本机的桌面应用（本文称「TopBridge App」）。它管理标签打印机、模板与用户权益，并通过本地 WebSocket 协议对外提供 API，供浏览器应用发送打印指令。

> **下载**：[获取 TopBridge App](https://service.topsale.co.nz/self-service/download/topbridge)

:::tip 需要完整方案？
访问 [TOPSALE 标签打印官网](https://topsale.biz/solution/label-printing/) 了解托管式平台。
:::

## SDK 解决什么问题

`@appzgatenz/label-print-topbridge-js` 是无 UI 的浏览器端 Headless SDK，封装与 TopBridge App 的全部通信细节：

- **混合 WebSocket 管理** — 轻量 API 与推送事件共享一条长连接；打印使用独立短连接
- **TopBridge App 唤起与重试** — 通过 `launch` 模块编排启动与自动重试
- **数据转换** — 按模板 schema 自动把产品数据转成 TopBridge App 所需结构
- **结构化错误** — 14 个错误类（1 基类 + 13 子类），均支持 `instanceof` 收窄
- **预检编排** — 一行完成「健康检查 → 权益校验 → 打印机发现」
- **打印机配置与会话解除** — 通过 `printerSetup` / `session` 配置协议/BPAC、清除 SessionBlocked
- **推送事件** — 通过 `client.events` 订阅打印机、模板、用户与连接生命周期事件

SDK 不绑定任何 UI 框架，可用于 React / Vue / Svelte / 原生 JS。

## 架构概览

```
你的浏览器应用
    │
    ▼
TopBridgeClient（SDK 入口）
    ├── health         健康检查
    ├── whoami         当前登录状态
    ├── benefits       权益与配额（含 refreshBenefit）
    ├── printers       打印机列表
    ├── templates      模板列表 / schema / json / 刷新
    ├── print          打印执行（schema 驱动转换）
    ├── preflight      编排：health → benefits → printers
    ├── launch         TopBridge App 唤起 + 重试
    ├── printerSetup   打印机配置与 BPAC
    ├── session        会话超限解除（kickSession）
    └── events         推送事件 + 连接生命周期
    │
    ▼  WebSocket 连接（本地模式或安全 WSS 模式）
TopBridge App（本机桌面应用）
    │
    ▼
标签打印机
```

## 工作原理

1. **初始化** — 在浏览器应用中创建 `TopBridgeClient`
2. **预检** — 健康检查、校验权益、发现打印机
3. **可选配置** — 需要时配置打印机 / 处理会话限制
4. **打印** — 提交产品数据；SDK 获取模板 schema 并转换数据
5. **可选事件** — 在共享连接上订阅 Tray App 推送

你只需使用高层模块 API，无需手写 WebSocket 帧或解析协议消息。

## SDK 模块

| 模块 | 访问路径 | 说明 |
|------|----------|------|
| health | `client.health` | TopBridge App 健康检查 |
| whoami | `client.whoami` | 当前登录状态与账号 |
| benefits | `client.benefits` | 权益校验 + 强制刷新 |
| printers | `client.printers` | 已同步打印机列表 |
| templates | `client.templates` | 模板列表、schema、批量 JSON、刷新 |
| print | `client.print` | 执行标签打印（自动数据转换） |
| preflight | `client.preflight` | 编排：health → benefits → printers |
| launch | `client.launch` | TopBridge App 唤起与重试 |
| printerSetup | `client.printerSetup` | 打印机协议 / 字符集 / 字体 / BPAC |
| session | `client.session` | 踢出会话以清除 SessionBlocked |
| events | `client.events` | 类型化的 `on` / `off` 订阅 |

客户端生命周期方法：`connect()`、`close()`、`getConnectionState()`。

## 包信息

| 属性 | 值 |
|------|-----|
| 包名 | `@appzgatenz/label-print-topbridge-js` |
| 体积 | 约 9 KB gzipped |
| 依赖 | 零运行时依赖 |
| 格式 | ESM + CJS 双格式 |
| Tree-shaking | 支持（`sideEffects: false`） |
| Node.js（构建工具链） | >= 18 |
