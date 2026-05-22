import { defineConfig } from 'vitepress'

type SidebarGroup = { text: string; items: { text: string; link: string }[] }

const guideSections: {
  en: string
  zh: string
  items: { en: string; zh: string; slug: string }[]
}[] = [
  {
    en: 'Getting Started',
    zh: '快速开始',
    items: [
      { en: 'Installation & Setup', zh: '安装与初始化', slug: 'getting-started' },
      { en: 'CSP Configuration', zh: 'CSP 配置', slug: 'csp' },
    ],
  },
  {
    en: 'Core Guide',
    zh: '核心指南',
    items: [
      { en: 'Overview & Architecture', zh: '概述与架构', slug: 'overview' },
      { en: 'Core Concepts', zh: '核心概念', slug: 'core-concepts' },
      { en: 'API Quick Reference', zh: 'API 速查表', slug: 'api-reference' },
      { en: 'Widget Types', zh: 'Widget 类型', slug: 'widgets' },
      { en: 'Integration Tutorial', zh: '完整集成教程', slug: 'integration-tutorial' },
      { en: 'Data Transformation', zh: '数据转换', slug: 'field-types' },
    ],
  },
  {
    en: 'Reference',
    zh: '参考手册',
    items: [
      { en: 'Error Handling', zh: '错误处理', slug: 'error-handling' },
      { en: 'Topbridge App Launch', zh: 'Topbridge App 唤起', slug: 'launch-module' },
      { en: 'Debugging & Logging', zh: '调试与日志', slug: 'debugging' },
      { en: 'Troubleshooting', zh: '故障排查', slug: 'troubleshooting' },
      { en: 'Security Model', zh: '安全模型', slug: 'security' },
    ],
  },
  {
    en: 'SaaS Platform',
    zh: 'SaaS 平台',
    items: [{ en: 'TopSale SaaS Platform', zh: 'TopSale SaaS 平台', slug: 'saas-platform' }],
  },
]

const exampleItems: { en: string; zh: string; slug: string }[] = [
  { en: 'Basic Printing', zh: '基础打印', slug: 'basic' },
  { en: 'Error Handling', zh: '错误处理', slug: 'error-handling' },
  { en: 'Template Schema', zh: '模板查询', slug: 'template-schema' },
  { en: 'Multi-Product', zh: '批量打印', slug: 'multi-product' },
  { en: 'Preflight Only', zh: '仅预检', slug: 'preflight-only' },
  { en: 'Advanced Dynamic Form', zh: '高级动态表单', slug: 'advanced-form' },
]

function buildGuideSidebar(locale: 'en' | 'zh', prefix: string): SidebarGroup[] {
  return guideSections.map((s) => ({
    text: s[locale],
    items: s.items.map((i) => ({ text: i[locale], link: `${prefix}${i.slug}` })),
  }))
}

function buildExampleSidebar(locale: 'en' | 'zh', prefix: string): SidebarGroup[] {
  return [
    {
      text: locale === 'zh' ? '示例' : 'Examples',
      items: exampleItems.map((i) => ({ text: i[locale], link: `${prefix}${i.slug}` })),
    },
  ]
}

const saasNavItems = {
  en: [
    { text: 'Official Website', link: 'https://topsale.biz/solution/label-printing/' },
    { text: 'App Store', link: 'https://service.topsale.co.nz/store' },
    { text: 'Self-Service Portal', link: 'https://service.topsale.co.nz/self-service' },
    {
      text: 'TopBridge Download',
      link: 'https://service.topsale.co.nz/self-service/download/topbridge',
    },
  ],
  zh: [
    { text: '官网', link: 'https://topsale.biz/solution/label-printing/' },
    { text: '购物商店', link: 'https://service.topsale.co.nz/store' },
    { text: '自助服务平台', link: 'https://service.topsale.co.nz/self-service' },
    {
      text: 'TopBridge 下载链接',
      link: 'https://service.topsale.co.nz/self-service/download/topbridge',
    },
  ],
}

export default defineConfig({
  srcExclude: ['AGENTS.md', 'CLAUDE.md', 'docs/**'],
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
          { text: 'SaaS Platform', items: saasNavItems.en },
        ],
        sidebar: {
          '/guide/': buildGuideSidebar('en', '/guide/'),
          '/examples/': buildExampleSidebar('en', '/examples/'),
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
          { text: 'SaaS 平台', items: saasNavItems.zh },
        ],
        sidebar: {
          '/zh/guide/': buildGuideSidebar('zh', '/zh/guide/'),
          '/zh/examples/': buildExampleSidebar('zh', '/zh/examples/'),
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
