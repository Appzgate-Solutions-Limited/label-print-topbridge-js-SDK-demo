---
title: Basic Printing Example
---

# Basic Printing Example

A complete preflight + print workflow, demonstrating the full process from preflight to printing.

:::warning Prerequisites
TopBridge App must be running locally (version >= 1.0.45). [Download](https://service.topsale.co.nz/self-service/download/topbridge)
:::

:::tip Don't want to integrate the SDK?
Try the [TOPSALE Self-Service Platform](https://service.topsale.co.nz/self-service) — start printing without writing code.
:::

:::warning Template columns
This example uses fixed fields and does not dynamically update columns from the template
schema. Select a template that contains matching fields such as `name`, `price`, and `copies`;
otherwise printing may fail. For schema-driven fields, see
[Advanced Dynamic Form](./advanced-form).
:::

## Live Demo

<Playground template="basic" />
