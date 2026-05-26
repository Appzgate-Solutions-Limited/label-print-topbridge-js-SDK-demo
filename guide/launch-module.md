---
title: TopBridge App Launch
---

# TopBridge App Launch (LaunchModule)

The `launch` module is responsible for launching TopBridge App and orchestrating connection retries.

> **Prerequisite**: If your page uses CSP, it must allow the `topsale:` custom protocol. See [CSP Configuration](/guide/csp) for details.

## trigger()

Triggers TopBridge App launch. Loads the `topsale://callback` custom protocol via a hidden iframe. This method is fire-and-forget and does not return a Promise.

```typescript
client.launch.trigger()
```

Use cases:
- You want to manually control the launch timing
- Proactively launch when detecting TopBridge App is not running
- Custom retry logic

## ensureRunning(fn, options?)

Ensures TopBridge App is running before executing the specified operation. Encapsulates the complete launch → wait → retry flow.

```typescript
const result = await client.launch.ensureRunning(
  () => client.health.check(),
  { onLaunching: () => showLaunchingUI() }
)
```

**Execution Flow**:

```
ensureRunning(fn)
  ├─ fn() succeeds → Return result
  ├─ fn() throws non-ConnectionError → Throw immediately
  └─ fn() throws ConnectionError
       ├─ options.onLaunching() callback
       ├─ trigger() launches TopBridge App
       ├─ Wait 3 seconds
       ├─ fn() retry → succeeds → Return result
       ├─ fn() retry → non-ConnectionError → Throw
       └─ fn() retry → ConnectionError
            ├─ Wait 2 seconds
            ├─ fn() final retry (1 time)
            └─ All failed → Throw TopBridgeConnectionError
```

## Common Usage

```typescript
// Wrap preflight (most common)
const { printers } = await client.launch.ensureRunning(
  () => client.preflight.run(),
  { onLaunching: () => console.log('Launching...') }
)

// Wrap health check
const health = await client.launch.ensureRunning(
  () => client.health.check()
)

// Wrap any operation
const result = await client.launch.ensureRunning(
  async () => {
    const h = await client.health.check()
    if (!h.data.isLoggedIn) throw new Error('Not logged in')
    return h
  }
)
```
