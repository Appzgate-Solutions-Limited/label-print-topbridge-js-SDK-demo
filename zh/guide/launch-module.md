---
title: TopBridge App 唤起
---

# TopBridge App 唤起（LaunchModule）

`launch` 模块负责 TopBridge App 的唤起和连接重试编排。

> **前置条件**：如果页面使用了 CSP，必须允许 `topsale:` 自定义协议。详见 [CSP 配置](/zh/guide/csp)。

## trigger()

触发 TopBridge App 启动。通过隐藏 iframe 加载 `topsale://callback` 自定义协议。该方法为即发即忘（fire-and-forget），不返回 Promise。

```typescript
client.launch.trigger()
```

适用场景：
- 你想手动控制唤起时机
- 在检测到 TopBridge App 未运行时主动唤起
- 自定义重试逻辑

## ensureRunning(fn, options?) {#ensurerunning-fn-options}

确保 TopBridge App 在运行后执行指定操作。封装了完整的唤起 → 等待 → 重试流程。

```typescript
const result = await client.launch.ensureRunning(
  () => client.health.check(),
  { onLaunching: () => showLaunchingUI() }
)
```

**执行流程**：

```
ensureRunning(fn)
  ├─ fn() 成功 → 返回结果
  ├─ fn() 非 ConnectionError → 直接抛出
  └─ fn() ConnectionError
       ├─ options.onLaunching() 回调
       ├─ trigger() 唤起 TopBridge App
       ├─ 等待 3 秒
       ├─ fn() 重试 → 成功 → 返回结果
       ├─ fn() 重试 → 非 ConnectionError → 抛出
       └─ fn() 重试 → ConnectionError
            ├─ 等待 2 秒
            ├─ fn() 最终重试（1 次）
            └─ 全部失败 → 抛 TopBridgeConnectionError
```

## 常见用法

```typescript
// 包装预检（最常见）
const { printers } = await client.launch.ensureRunning(
  () => client.preflight.run(),
  { onLaunching: () => console.log('正在启动...') }
)

// 包装健康检查
const health = await client.launch.ensureRunning(
  () => client.health.check()
)

// 包装任意操作
const result = await client.launch.ensureRunning(
  async () => {
    const h = await client.health.check()
    if (!h.data.isLoggedIn) throw new Error('Not logged in')
    return h
  }
)
```
