---
title: Security Model
---

# Security Model

## Overview

`@appzgatenz/label-print-topbridge-js` employs multiple layers of security defenses to prevent unauthorized calls and data leakage.

## 1. Fixed Local Connection

The SDK communicates exclusively with the locally running Topbridge App. There is no configuration option for the connection address, which fundamentally prevents redirecting the SDK to a remote server.

## 2. Source Verification

SDK requests carry a caller-origin identifier that is validated server-side. Requests from unauthorized sources are rejected by Topbridge App.

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

The SDK automatically strips formula injection prefixes (such as `=` and `=@`) from print data to prevent injection attacks.

## Known Limitations

| Limitation | Description | Mitigation |
|------------|-------------|------------|
| Browser cannot prevent page spoofing | Malicious pages can implement the WS protocol themselves | Topbridge App source verification + server-side validation |
| WS protocol is unencrypted | localhost communication is not encrypted by default | Local communication does not require encryption (no network transmission risk) |
