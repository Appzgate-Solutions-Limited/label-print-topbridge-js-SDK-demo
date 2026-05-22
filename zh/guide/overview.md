---
title: 概述与架构
---

# 概述与架构

## 什么是 TopBridge

TopBridge 是一个运行在用户本地的桌面应用（简称「Topbridge App」），负责管理标签打印机、模板和用户权益。它通过 WebSocket 协议在本地暴露 API，让浏览器应用能够发送打印指令。

> **下载**：[获取 Topbridge App](https://service.topsale.co.nz/self-service/download/topbridge)

:::tip 正在寻找完整解决方案？
访问 [TopSale 标签打印官网](https://topsale.biz/solution/label-printing/) 了解我们的全托管平台。
:::

## SDK 解决什么问题

`@appzgatenz/label-print-topbridge-js` 是一个 Headless（无 UI）浏览器 SDK，封装了与 Topbridge App 的全部通信细节：

- **WebSocket 连接管理** — 短连接模型，每次调用自动建立、发送、接收、关闭
- **Topbridge App 唤起与重试** — 通过 `launch` 模块显式触发唤起，含自动重试编排
- **数据转换** — 根据模板 schema 自动将扁平的产品数据转换为嵌套结构
- **结构化错误** — 10 种错误类型，全部支持 `instanceof` 类型窄化
- **预检编排** — 一行代码完成「健康检查 → 权益验证 → 打印机获取」

SDK 不绑定任何 UI 框架，可在 React / Vue / Svelte / 原生 JS 中使用。

## 架构概览

```
你的浏览器应用
    │
    ▼
TopBridgeClient (SDK 入口)
    ├── health        健康检查
    ├── benefits      权益与配额验证
    ├── printers      打印机列表
    ├── templates     模板列表 + 字段定义
    ├── print         打印执行（schema 驱动数据转换）
    ├── preflight     编排：health → benefits → printers
    └── launch        Topbridge App 唤起 + 重试编排
    │
    ▼  WebSocket (本地通信)
Topbridge App (本地桌面应用)
    │
    ▼
标签打印机
```

## 工作原理

1. **初始化** — 在浏览器应用中创建 `TopBridgeClient` 实例
2. **预检** — 运行健康检查、验证权益、发现打印机
3. **打印** — 提交包含扁平产品数据的打印请求，SDK 自动获取模板 schema 并转换数据格式

SDK 内部处理所有 WebSocket 通信。你只需与高级模块 API 交互——无需手动管理连接、解析协议消息或处理数据转换。

## 内部架构

SDK 按四个概念层组织：

```
公共 API 层          TopBridgeClient（门面）
                         │
功能模块层           health · benefits · printers · templates · print · preflight · launch
                         │
传输层              与 Topbridge App 通信（短连接模型）
                         │
工具层              数据转换 · 输入校验 · 唤起编排
```

- **公共 API 层** — `TopBridgeClient` 是唯一入口，编排所有模块并隐藏内部复杂性。
- **功能模块层** — 7 个独立模块，各负责一个业务领域。所有公共方法均为异步，返回类型化响应。
- **传输层** — 使用短连接模型（每次调用独立建立→发送→接收→关闭）处理与 Topbridge App 的通信。
- **工具层** — 提供模块内部使用的数据转换、输入校验和唤起编排功能。

## 包信息

| 属性 | 值 |
|------|-----|
| 包名 | `@appzgatenz/label-print-topbridge-js` |
| 体积 | ~3.2 KB gzipped |
| 依赖 | 零运行时依赖 |
| 格式 | ESM + CJS 双格式输出 |
| Tree-shaking | 支持（`sideEffects: false`） |
| Node.js | >= 18 |
