import { defineConfig } from 'vitepress'

export default defineConfig({
  srcExclude: ['AGENTS.md', 'CLAUDE.md'],
  head: [
    ['link', { rel: 'preconnect', href: 'https://cdn.jsdelivr.net' }],
    ['link', { rel: 'dns-prefetch', href: 'https://cdn.jsdelivr.net' }],
  ],
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'TopBridge SDK Platform',
      description: 'Label printing SDKs for the web — JS Core, Next.js, and React',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'Examples', link: '/examples/basic' },
          {
            text: 'SaaS Platform',
            items: [
              { text: 'Official Website', link: 'https://topsale.biz/solution/label-printing/' },
              { text: 'App Store', link: 'https://service.topsale.co.nz/store' },
              { text: 'Self-Service Portal', link: 'https://service.topsale.co.nz/self-service' },
              { text: 'TopBridge Download', link: 'https://service.topsale.co.nz/self-service/download/topbridge' },
            ],
          },
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Installation & Setup', link: '/guide/getting-started' },
                { text: 'CSP Configuration', link: '/guide/csp' },
              ],
            },
            {
              text: 'Core Guide',
              items: [
                { text: 'Overview & Architecture', link: '/guide/overview' },
                { text: 'Core Concepts', link: '/guide/core-concepts' },
                { text: 'API Quick Reference', link: '/guide/api-reference' },
                { text: 'Widget Types', link: '/guide/widgets' },
                { text: 'Integration Tutorial', link: '/guide/integration-tutorial' },
                { text: 'Data Transformation', link: '/guide/field-types' },
              ],
            },
            {
              text: 'Reference',
              items: [
                { text: 'Error Handling', link: '/guide/error-handling' },
                { text: 'Topbridge App Launch', link: '/guide/launch-module' },
                { text: 'Debugging & Logging', link: '/guide/debugging' },
                { text: 'Troubleshooting', link: '/guide/troubleshooting' },
                { text: 'Security Model', link: '/guide/security' },
              ],
            },
            {
              text: 'SaaS Platform',
              items: [
                { text: 'TopSale SaaS Platform', link: '/guide/saas-platform' },
              ],
            },
          ],
          '/examples/': [
            {
              text: 'Examples',
              items: [
                { text: 'Basic Printing', link: '/examples/basic' },
                { text: 'Error Handling', link: '/examples/error-handling' },
                { text: 'Template Schema', link: '/examples/template-schema' },
                { text: 'Multi-Product', link: '/examples/multi-product' },
                { text: 'Preflight Only', link: '/examples/preflight-only' },
                { text: 'Advanced Dynamic Form', link: '/examples/advanced-form' },
              ],
            },
          ],
        },
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'TopBridge SDK 平台',
      description: 'Web 标签打印 SDK — JS Core、Next.js 与 React',
      link: '/zh/',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/getting-started' },
          { text: '示例', link: '/zh/examples/basic' },
          {
            text: 'SaaS 平台',
            items: [
              { text: '官网', link: 'https://topsale.biz/solution/label-printing/' },
              { text: '自助服务平台', link: 'https://service.topsale.co.nz/self-service' },
              { text: '购物商店', link: 'https://service.topsale.co.nz/store' },
              { text: 'TopBridge 下载链接', link: 'https://service.topsale.co.nz/self-service/download/topbridge' },
            ],
          },
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '快速开始',
              items: [
                { text: '安装与初始化', link: '/zh/guide/getting-started' },
                { text: 'CSP 配置', link: '/zh/guide/csp' },
              ],
            },
            {
              text: '核心指南',
              items: [
                { text: '概述与架构', link: '/zh/guide/overview' },
                { text: '核心概念', link: '/zh/guide/core-concepts' },
                { text: 'API 速查表', link: '/zh/guide/api-reference' },
                { text: 'Widget 类型', link: '/zh/guide/widgets' },
                { text: '完整集成教程', link: '/zh/guide/integration-tutorial' },
                { text: '数据转换', link: '/zh/guide/field-types' },
              ],
            },
            {
              text: '参考手册',
              items: [
                { text: '错误处理', link: '/zh/guide/error-handling' },
                { text: 'Topbridge App 唤起', link: '/zh/guide/launch-module' },
                { text: '调试与日志', link: '/zh/guide/debugging' },
                { text: '故障排查', link: '/zh/guide/troubleshooting' },
                { text: '安全模型', link: '/zh/guide/security' },
              ],
            },
            {
              text: 'SaaS 平台',
              items: [
                { text: 'TopSale SaaS 平台', link: '/zh/guide/saas-platform' },
              ],
            },
          ],
          '/zh/examples/': [
            {
              text: '示例',
              items: [
                { text: '基础打印', link: '/zh/examples/basic' },
                { text: '错误处理', link: '/zh/examples/error-handling' },
                { text: '模板查询', link: '/zh/examples/template-schema' },
                { text: '批量打印', link: '/zh/examples/multi-product' },
                { text: '仅预检', link: '/zh/examples/preflight-only' },
                { text: '高级动态表单', link: '/zh/examples/advanced-form' },
              ],
            },
          ],
        },
      },
    },
  },
  base: '/',
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/youngming/label-print-topbridge-js-SDK-demo' },
    ],
    search: {
      provider: 'local',
    },
  },
})
