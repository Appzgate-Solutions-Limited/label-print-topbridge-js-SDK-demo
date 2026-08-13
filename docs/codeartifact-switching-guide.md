# CodeArtifact 私有源切换指南

本文档说明如何在 develop 分支切换到 AWS CodeArtifact 私有源进行 SDK 预发布验证，以及合并回 main 分支时的操作流程。

## 背景与定位

| 源 | 地址 | 用途 |
|----|------|------|
| 公共 NPM | `registry.npmjs.org` | main 分支，稳定版发布 |
| CodeArtifact | `topsale-533267398655.d.codeartifact.ap-southeast-2.amazonaws.com/npm/Label-printing-js-core-prelaunch/` | develop 分支，预发布验证 |

CodeArtifact 仅作为预发布通道。develop 分支验证通过后，SDK 发布到公共 NPM，再合并回 main。

## 机制概述

项目通过 `scripts/setup-npmrc.mjs` 实现分支级源路由，自动在 `predev`、`prebuild`、`pnpm:devPreinstall` 钩子中运行：

```
develop 分支 → 生成 .npmrc，@appzgatenz scope 指向 CodeArtifact
其他分支    → 删除生成的 .npmrc，走默认公共 NPM
```

关键设计：

- `.npmrc` 由脚本动态生成，不提交到 Git（已加入 `.gitignore`）
- 项目级 `.npmrc` 只负责路由（`@appzgatenz:registry=...`），认证凭据由用户级 `~/.npmrc` 提供
- **用户级 `~/.npmrc` 不应配置 `@appzgatenz:registry` 路由行**——它会覆盖项目配置，导致 main 分支仍请求 CodeArtifact。脚本在非 develop 分支会检测此类残留并打印警告（非致命）
- 通过 `GENERATED_MARKER` 注释标识生成文件，避免覆盖手动编辑的 `.npmrc`
- `pnpm:devPreinstall` 如果在当前安装进程中首次生成或更新 `.npmrc`，会主动中止并提示重跑。原因是 pnpm 已在进程启动时读取 registry 配置，本次安装不会重新读取刚生成的 `.npmrc`

## 分支策略

```
main (稳定版)          develop (预发布)
  │                       │
  │  ← SDK 发到公共 NPM ← │  ← SDK 发到 CodeArtifact
  │         ↑             │
  │    合并前必须完成      │  更新文档/示例，本地测试
  │                       │
  ▼                       ▼
部署到 Cloudflare       本地 pnpm dev / build
(production)            + Cloudflare Pages 预览部署 (preview)
```

**不在 main 上直接操作 CodeArtifact**。main 是部署分支，`deploy.sh` 从 main 构建并上传到 Cloudflare Pages，必须保持源为公共 NPM。

## 操作步骤

### 1. 创建并切换到 develop 分支

```bash
git checkout -b develop main
```

### 2. 认证：刷新 CodeArtifact Token

CodeArtifact token 有效期最长 12 小时，每次操作前需要刷新：

```bash
aws codeartifact login \
  --tool npm \
  --repository Label-printing-js-core-prelaunch \
  --domain topsale \
  --domain-owner 533267398655 \
  --region ap-southeast-2
```

此命令自动更新 `~/.npmrc` 中的 `_authToken`，无需手动编辑。

验证 token 是否生效：

```bash
# 查看用户级 npmrc 中的 CodeArtifact 认证信息
grep codeartifact ~/.npmrc
```

### 3. 更新 package.json 版本约束

**这是最容易被忽略的步骤。** semver 对 `0.x` 版本的 `^` 约束把 minor 当 breaking：

| 约束 | 实际范围 | 能否匹配 0.6.2 |
|------|----------|----------------|
| `^0.5.0` | `>=0.5.0 <0.6.0` | 不能 |
| `^0.6.0` | `>=0.6.0 <0.7.0` | 能 |
| `^0.6.1` | `>=0.6.1 <0.7.0` | 能 |

将 `package.json` 中的版本约束更新为 CodeArtifact 上的目标版本：

```json
"@appzgatenz/label-print-topbridge-js": "^0.6.0"
```

### 4. 安装依赖

推荐使用仓库脚本，它会先生成 `.npmrc`，再启动新的 `pnpm install` 进程：

```bash
pnpm run install:deps
```

如果旧 lockfile 锁定了旧版本，先删除 lockfile 再重新安装：

```bash
rm pnpm-lock.yaml
pnpm run install:deps
```

删除旧 lockfile 是必要的——旧 lockfile 锁定了旧版本，pnpm 会认为"Lockfile is up to date"直接跳过解析。

如果直接运行 `pnpm install`，首次生成或更新 `.npmrc` 后可能看到如下提示：

```text
[setup-npmrc] The current pnpm install process has already read the old registry config.
[setup-npmrc] .npmrc has been generated. Rerun pnpm install, or prefer pnpm run install:deps.
```

此时重新运行一次 `pnpm install` 即可；第二次进程会读取已生成的项目级 `.npmrc`。

验证安装版本：

```bash
pnpm ls @appzgatenz/label-print-topbridge-js
```

### 5. 本地验证

```bash
pnpm dev      # 启动开发服务器，验证 SDK 功能
pnpm build    # 验证构建通过
```

### 6. 合并回 main

**前置条件**：SDK 目标版本必须已发布到公共 NPM。

```bash
git checkout main
git merge develop

# lockfile 会有冲突（CodeArtifact URL vs NPM URL），直接重新生成
rm pnpm-lock.yaml
pnpm install

git add package.json pnpm-lock.yaml
git commit
pnpm build                        # 最终验证
pnpm run deploy:dry               # 预检查
pnpm run deploy                   # 部署
```

## Lockfile 冲突说明

develop 分支的 `pnpm-lock.yaml` 中 `@appzgatenz` 包的 URL 指向 CodeArtifact，main 指向公共 NPM。合并时必然产生冲突。

处理方式：**不要手动解决冲突，直接删 lockfile 重装**。因为合并时 SDK 已在公共 NPM 上，`pnpm install` 会从公共 NPM 重新解析，生成正确的 lockfile。

## 常见问题

### pnpm install 报 401 Unauthorized

```
ERR_PNPM_FETCH_401  GET https://...codeartifact.../ : Unauthorized - 401
```

Token 过期。重新执行 `aws codeartifact login`（见步骤 2）。

**注意**：如果当前在 main 分支（本应走公共 npm）却报这个错，说明请求被路由到了 CodeArtifact，见下一条。

### main 分支 pnpm install 仍请求 CodeArtifact / 报 401

现象：`setup-npmrc` 已输出 `using public npm`，但 pnpm 仍向 CodeArtifact 发请求并因 token 过期报 401。

原因：用户级 `~/.npmrc`（或全局 npmrc）中残留了 `@appzgatenz:registry=...` 路由行。pnpm 会合并项目级与用户级配置，用户级的 scope 路由覆盖了项目的公共 npm 路由。

排查：

```bash
pnpm config get @appzgatenz:registry
# 若输出 CodeArtifact URL，而项目级 .npmrc 不存在，说明配置来自用户级/全局 npmrc
grep '@appzgatenz:registry' ~/.npmrc
```

修复：删除 `~/.npmrc` 中的 `@appzgatenz:registry=...` 行。**保留** CodeArtifact 的 `_authToken` 行——它是 develop 分支的认证来源，`aws codeartifact login` 会自动刷新它。

`setup-npmrc.mjs` 在非 develop 分支会自动检测此类残留并打印警告（非致命）。

### pnpm install 首次仍请求 registry.npmjs.org

如果日志先显示 `.npmrc now points to CodeArtifact`，随后仍请求 `registry.npmjs.org`，说明当前 pnpm 进程已经读取了旧配置。这不是 token 过期。按脚本提示重新运行 `pnpm install`，或使用 `pnpm run install:deps`。

### 安装了旧版本而非 CodeArtifact 上的新版本

两个原因：

1. **版本约束未更新**——`^0.5.0` 匹配不到 `0.6.2`，更新 `package.json`
2. **lockfile 缓存**——输出 "Lockfile is up to date, resolution step is skipped"，删除 `pnpm-lock.yaml` 重装

### 切回 main 后 install 报 404

SDK 新版本尚未发布到公共 NPM。必须先完成公共 NPM 发布，再合并分支。

### ~/.npmrc 中没有 CodeArtifact token

从未执行过 `aws codeartifact login`，或 token 条目被意外删除。重新执行 login 命令即可。

## 相关文件

| 文件 | 用途 |
|------|------|
| `scripts/setup-npmrc.mjs` | 分支检测 + `.npmrc` 生成/清理 |
| `.npmrc.template` | `.npmrc` 模板，`{{REGISTRY_URL}}` 占位符 |
| `.gitignore` | 排除生成的 `.npmrc` |
| `package.json` | SDK 版本约束、pre 钩子绑定 |
| `pnpm-lock.yaml` | 依赖锁定，develop/main 各自维护 |
