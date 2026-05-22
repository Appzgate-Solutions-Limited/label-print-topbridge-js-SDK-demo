import type { SdkType } from '../composables/useSdkType'

type Locale = 'en' | 'zh'

export const sdkNames: Record<SdkType, string> = {
  'js-core': 'JS Core',
  nextjs: 'Next.js',
  react: 'React',
}

export const heroMeta: Record<
  SdkType,
  Record<
    Locale,
    {
      title: string
      subtitle: string
      installCmd?: string
      cta1: string
      cta1Link?: string
      cta2?: string
      cta2Link?: string
      cta3?: string
      cta3Link?: string
      cta4?: string
      cta4Link?: string
    }
  >
> = {
  'js-core': {
    en: {
      title: 'TopBridge SDK Platform',
      subtitle: 'Browser-to-Printer, One Bridge Away',
      installCmd: 'npm install @appzgatenz/label-print-topbridge-js',
      cta1: 'Get Started',
      cta1Link: '/guide/getting-started',
      cta2: 'View on NPM',
      cta2Link: 'https://www.npmjs.com/package/@appzgatenz/label-print-topbridge-js',
      cta3: 'API Reference',
      cta3Link: '/guide/api-reference',
      cta4: 'SaaS Platform',
      cta4Link: 'https://topsale.biz/solution/label-printing/',
    },
    zh: {
      title: 'TopBridge SDK 平台',
      subtitle: '浏览器到打印机，一座桥的距离',
      installCmd: 'npm install @appzgatenz/label-print-topbridge-js',
      cta1: '快速开始',
      cta1Link: '/zh/guide/getting-started',
      cta2: '查看 NPM',
      cta2Link: 'https://www.npmjs.com/package/@appzgatenz/label-print-topbridge-js',
      cta3: 'API 参考',
      cta3Link: '/zh/guide/api-reference',
      cta4: 'SaaS 平台',
      cta4Link: 'https://topsale.biz/solution/label-printing/',
    },
  },
  nextjs: {
    en: {
      title: 'TopBridge SDK Platform',
      subtitle: 'The Next.js SDK is on its way. Stay tuned!',
      cta1: 'Back to JS Core',
    },
    zh: {
      title: 'TopBridge SDK 平台',
      subtitle: 'Next.js SDK 即将到来，敬请期待！',
      cta1: '返回 JS Core',
    },
  },
  react: {
    en: {
      title: 'TopBridge SDK Platform',
      subtitle: 'The React SDK is on its way. Stay tuned!',
      cta1: 'Back to JS Core',
    },
    zh: {
      title: 'TopBridge SDK 平台',
      subtitle: 'React SDK 即将到来，敬请期待！',
      cta1: '返回 JS Core',
    },
  },
}

export const features: Record<Locale, { icon: string; title: string; desc: string }[]> = {
  en: [
    {
      icon: 'headless',
      title: 'Headless Architecture',
      desc: 'No UI bindings. Works with React, Vue, Svelte, or vanilla JS.',
    },
    {
      icon: 'package',
      title: 'Zero Dependencies',
      desc: 'Pure browser-native APIs. npm install and go.',
    },
    {
      icon: 'shield',
      title: 'Structured Errors',
      desc: '10 error types with instanceof narrowing for precise diagnostics.',
    },
    {
      icon: 'rocket',
      title: 'Preflight Orchestration',
      desc: 'One-liner: health check → quota validation → printer discovery.',
    },
    {
      icon: 'lock',
      title: 'Security First',
      desc: 'Fixed local connection, source allowlist, input sanitization, build obfuscation.',
    },
    {
      icon: 'zap',
      title: 'Auto Launch & Retry',
      desc: 'Automatically detect and launch Tray App with built-in retry orchestration.',
    },
  ],
  zh: [
    {
      icon: 'headless',
      title: 'Headless 架构',
      desc: '无 UI 绑定，适配 React / Vue / Svelte / 原生 JS。',
    },
    { icon: 'package', title: '零依赖', desc: '纯浏览器原生 API，npm install 即用。' },
    {
      icon: 'shield',
      title: '结构化错误',
      desc: '10 种错误类型，instanceof 类型窄化，精准定位问题。',
    },
    { icon: 'rocket', title: '预检编排', desc: '一行代码完成健康检查 → 权益验证 → 打印机获取。' },
    {
      icon: 'lock',
      title: '安全优先',
      desc: '固定本地连接 + Source 白名单 + 输入清洗 + 构建混淆。',
    },
    { icon: 'zap', title: '自动启动与重试', desc: '自动检测并启动 Tray App，内置连接重试编排。' },
  ],
}

export const installLabels: Record<
  Locale,
  { copy: string; copied: string; ariaCopy: string; ariaCopied: string }
> = {
  en: {
    copy: 'Copy',
    copied: 'Copied!',
    ariaCopy: 'Copy install command',
    ariaCopied: 'Copied install command',
  },
  zh: { copy: '复制', copied: '已复制', ariaCopy: '复制安装命令', ariaCopied: '已复制安装命令' },
}

export const comingSoon: Record<Locale, { badge: string; descTemplate: string; cta: string }> = {
  en: {
    badge: 'Coming Soon',
    descTemplate: 'The {sdk} SDK is currently in planning. Stay tuned for updates!',
    cta: 'Back to JS Core',
  },
  zh: { badge: '即将支持', descTemplate: '{sdk} SDK 正在规划中，敬请期待！', cta: '返回 JS Core' },
}

export const switcherLabels: Record<Locale, Record<SdkType, string>> = {
  en: { 'js-core': 'JS Core', nextjs: 'Next.js', react: 'React' },
  zh: { 'js-core': 'JS Core', nextjs: 'Next.js', react: 'React' },
}

export const switcherBadges: Record<Locale, string> = {
  en: 'Soon',
  zh: '即将支持',
}
