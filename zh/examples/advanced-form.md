---
title: 高级动态表单示例
---

# 高级动态表单示例

基于模板 schema 动态生成表单字段的高级示例，preflight 预检和打印联动操作。

**演示的关键功能：**
- 预检 → 自动填充打印机和模板
- 模板 schema → 基于 `fieldType` 动态生成表单
- 数据预览：输入数据 vs SDK 转换后输出
- Schema 驱动的数据转换（无需手动指定 fieldTypes）

:::warning 前置条件
需要本地运行 Topbridge App（版本 >= 1.0.45）。[下载](https://service.topsale.co.nz/self-service/download/topbridge)
:::

## 在线演示

<div class="demo-frame">
  <iframe src="/demos/advanced-form.html" width="100%" height="700" frameborder="0"></iframe>
</div>

## 源码

<<< @/public/demos/advanced-form.html{html}
