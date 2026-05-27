---
title: 批量打印示例
---

# 批量打印示例

一次打印多个产品，每个产品可设置不同的份数。

:::warning 模板字段
此示例使用固定字段，不会根据 template schema 动态调整 column。请选择包含 `name`、`price`、
`copies` 等对应字段的 template；否则打印可能失败。如需根据 schema 自动生成字段，请查看
[高级动态表单示例](./advanced-form)。
:::

## 在线演示

<Playground template="multi-product" />
