---
title: Security Model
---

# Security Model

## Overview

`@appzgatenz/label-print-topbridge-js` employs multiple layers of security defenses to prevent unauthorized calls and data leakage.

## 1. Fixed Local Connection

The SDK communicates exclusively with the locally running Topbridge App. There is no configuration option for the connection address, which fundamentally prevents redirecting the SDK to a remote server.

## 2. Source Verification

The SDK includes a caller-origin identifier (`source`) in all requests. Only predefined source values are accepted — unauthorized calls are rejected by Topbridge App. This prevents unknown callers from interacting with the local print service.

## 3. URL Safety Validation

Before presenting external links from Topbridge App error responses, the SDK validates protocols:

```typescript
// Only the following protocols are allowed
'https://' ✅
'ms-windows-store://' ✅
'http://' ❌
'javascript:' ❌
'data:' ❌
```

## 4. Input Sanitization

The SDK automatically strips formula injection prefixes from print data to prevent injection attacks. When processing `textfield` type fields, values starting with `=` or `=@` are automatically cleaned:

```
'=SUM(A1:A10)'  →  'SUM(A1:A10)'
'=@cmd'          →  'cmd'
'==nested'       →  'nested'
```

This protection is applied automatically — developers do not need to sanitize data manually.

## 5. Build-Time Protection

The published npm package applies multiple build-time protections:

- **Code minification** — production code is compressed and obfuscated
- **Tree-shaking** — unused code is eliminated at build time
- **No source maps** — source map files are not published to npm

## Known Limitations

| Limitation | Description | Mitigation |
|------------|-------------|------------|
| Browser cannot prevent page spoofing | Malicious pages can implement the WS protocol themselves | Topbridge App built-in origin verification |
| WS protocol is unencrypted | localhost communication is not encrypted by default | Local communication does not require encryption (no network transmission risk) |
