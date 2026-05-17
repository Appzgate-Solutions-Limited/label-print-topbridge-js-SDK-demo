---
title: Advanced Dynamic Form Example
---

# Advanced Dynamic Form Example

An advanced example that dynamically generates form fields based on template schema, with preflight check and print working together.

**Key features demonstrated:**
- Preflight check → auto-populate printers and templates
- Template schema → dynamic form generation based on `fieldType`
- Data preview: input vs SDK-transformed output
- Schema-driven data transformation (no manual fieldTypes needed)

:::warning Prerequisites
Topbridge App must be running locally (version >= 1.0.45). [Download](https://service.topsale.co.nz/self-service/download/topbridge)
:::

## Live Demo

<div class="demo-frame">
  <iframe src="/demos/advanced-form.html" width="100%" height="700" frameborder="0"></iframe>
</div>

## Source Code

<<< @/public/demos/advanced-form.html{html}
