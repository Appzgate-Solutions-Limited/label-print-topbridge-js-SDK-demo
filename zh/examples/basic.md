---
title: 基础打印示例
---

# 基础打印示例

完整的 preflight + print 流程，演示从预检到打印的全过程。

:::warning 前置条件
需要本地运行 TopBridge App（版本 >= 1.0.45）。[下载](https://service.topsale.co.nz/self-service/download/topbridge)
:::

:::tip 不想集成 SDK？
试试 [TOPSALE 自助服务平台](https://service.topsale.co.nz/self-service) —— 无需写代码即可开始打印。
:::

:::warning 模板字段
此示例使用固定字段，不会根据 template schema 动态调整 column。请选择包含 `name`、`price`、
`copies` 等对应字段的 template；否则打印可能失败。如需根据 schema 自动生成字段，请查看
[高级动态表单示例](./advanced-form)。
:::

## 在线演示

<Playground template="basic" />
