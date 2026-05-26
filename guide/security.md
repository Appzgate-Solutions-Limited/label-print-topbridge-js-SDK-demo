---
title: Security Model
---

# Security Model

## Overview

`@appzgatenz/label-print-topbridge-js` employs multiple layers of security defenses to prevent unauthorized calls and data leakage.

## 1. Fixed Local Connection

The SDK uses fixed, non-configurable connection endpoints. The default mode connects locally to TopBridge App; an optional secure (WSS) mode is also available. This fundamentally prevents redirecting SDK traffic to arbitrary servers.

## 2. Source Verification

The SDK includes a caller-origin identifier (`source`) in all requests for origin verification. Unauthorized calls are rejected by TopBridge App.

## 3. URL Safety Validation

Before presenting external links from TopBridge App error responses, the SDK validates protocols:

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
| Browser cannot prevent page spoofing | Other web pages could attempt to interact with the print service | TopBridge App built-in origin verification |
| Local mode is unencrypted | Default localhost connection is not encrypted | Enable WSS mode for encrypted communication; local mode has no network transmission risk |
