# Cloudflare Pages 部署指南

本文档描述如何将 VitePress 站点部署到 Cloudflare Pages（Direct Upload 模式）。

## 前置条件

| 工具 | 版本要求 | 安装方式 |
|------|----------|----------|
| Node.js | >= 22（推荐 22 LTS） | [nvm](https://github.com/nvm-sh/nvm) 或 [fnm](https://github.com/Schniz/fnm) |
| pnpm | 10.x | `npm install -g pnpm` |
| wrangler | 最新（已安装在 devDependencies） | `pnpm install` 自动安装 |
| Cloudflare 账号 | — | [注册](https://dash.cloudflare.com/sign-up) |

项目已包含 `.nvmrc` 文件锁定 Node 版本，使用 nvm 时执行 `nvm use` 即可自动切换。

## 首次部署

### 1. 安装依赖

```bash
pnpm install
```

### 2. 登录 Cloudflare

```bash
pnpm exec wrangler login
```

浏览器会打开授权页面，点击 Allow 完成授权。

### 3. 创建 Pages 项目

```bash
pnpm exec wrangler pages project create topbridge-js-sdk-docs --production-branch=main
```

选择 "Direct Upload" 作为部署方式。项目名称一旦创建不可更改；如果需要从旧项目名迁移，应创建新项目并完成验证后再删除旧项目。

### 4. 执行部署

```bash
pnpm run deploy
```

脚本会自动执行预检查 → 构建 → 部署，完成后输出 `*.pages.dev` 访问地址。

## 日常部署

```bash
# 完整部署（预检查 + 构建 + 上传）
pnpm run deploy

# 仅预检查，不构建和部署
pnpm run deploy:dry
```

## 部署脚本工作流

```
预检查                          构建                        部署
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Node >= 22       │   │ pnpm install     │   │ wrangler pages   │
│ pnpm 可用        │ → │ vitepress build  │ → │ deploy           │
│ wrangler 已认证  │   │ 验证产物目录     │   │ 输出 URL         │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

## 配置说明

### URL 输出

当前项目未启用 VitePress `cleanUrls`，构建产物与导航链接默认使用 `.html` 路径（如 `/guide/getting-started.html`）。Cloudflare Pages 可直接托管这些静态文件，无需额外配置。

如未来需要 `/guide/getting-started` 这类无扩展名路径，可在 `.vitepress/config.ts` 中显式配置 `cleanUrls: true`，并重新验证站点内链和部署产物。

### 构建输出目录

VitePress 默认输出到 `.vitepress/dist/`，这是部署脚本推送到 Cloudflare 的目录。

### 404 页面

VitePress 自动生成 `404.html` 到构建产物根目录，Cloudflare Pages 会自动识别并使用。

## 常见问题

### 构建失败："Node version mismatch"

确保使用正确的 Node 版本：

```bash
nvm use  # 读取 .nvmrc
node -v  # 确认版本 >= 22
```

### wrangler 未认证

```bash
pnpm exec wrangler login
```

### 希望启用 Clean URLs

当前项目未启用 `cleanUrls`。如果需要无扩展名路径：

1. 在 `.vitepress/config.ts` 中设置 `cleanUrls: true`
2. 重新执行 `pnpm build`
3. 检查构建产物和站点内链是否符合预期

### 首次部署报 "project not found"

需要先创建项目：

```bash
pnpm exec wrangler pages project create topbridge-js-sdk-docs --production-branch=main
```

### 从旧项目名迁移

Cloudflare Pages 项目名称创建后不可直接改名。需要先创建新项目 `topbridge-js-sdk-docs`，执行 `pnpm run deploy` 并验证新站点访问、导航、示例 iframe 和 SDK CDN 加载正常。

如果旧项目 `topbridge-sdk-docs` 绑定了自定义域名，先把域名迁移到新项目并等待状态变为 active。确认旧 URL 没有外部依赖后，再删除旧项目：

```bash
pnpm exec wrangler pages project delete topbridge-sdk-docs
```

### Demo 页面 SDK 加载失败

Demo HTML 通过 `esm.sh` CDN 加载 SDK（`https://esm.sh/@appzgatenz/label-print-topbridge-js`）。如果加载失败，检查网络环境或 esm.sh 服务状态。

## 相关文件

| 文件 | 用途 |
|------|------|
| `.nvmrc` | Node 版本锁定 |
| `scripts/deploy.sh` | 部署脚本（预检查 + 构建 + 部署） |
| `package.json` | deploy / deploy:dry 命令 |
