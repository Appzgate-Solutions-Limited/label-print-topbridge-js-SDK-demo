---
title: Debugging & Logging
---

# Debugging & Logging

## Quick Debug

Set `debug: true` in development to view all SDK communication logs in the browser console:

```typescript
const client = new TopBridgeClient({ debug: true })
```

Log format: `[TopBridge] [ModuleName] Message`

## Custom Logger

Integrate SDK logs into monitoring systems (Sentry / Datadog, etc.):

```typescript
import type { Logger } from '@appzgatenz/label-print-topbridge-js'

const logger: Logger = {
  debug: (...args) => { /* dev output */ },
  info: (...args) => { /* record info */ },
  warn: (...args) => { /* record warning */ },
  error: (...args) => Sentry.captureException(args[0]),
}

const client = new TopBridgeClient({ logger })
```

Logger takes priority over `debug: true`. When a custom logger is provided, the `debug` flag is ignored.

## Production Recommendations

- **Do not set `debug: true`** — Keep all logs off by default in production
- **Use a custom logger** — Send only error-level logs to monitoring systems to avoid leaking communication details
- **Do not display raw error messages in user-visible UI** — Use the [Error-to-Scenario Mapping](/guide/error-handling#error-to-scenario-mapping) to convert errors into user-friendly prompts
