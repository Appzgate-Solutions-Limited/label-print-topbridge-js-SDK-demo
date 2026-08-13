import type { Locale } from '../composables/useLocale'
import type { SdkType } from '../composables/useSdkType'

export type { Locale }

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
      desc: '14 structured error classes with instanceof narrowing for precise diagnostics.',
    },
    {
      icon: 'rocket',
      title: 'Preflight Orchestration',
      desc: 'One-liner: health check → quota validation → printer discovery.',
    },
    {
      icon: 'lock',
      title: 'Security First',
      desc: 'Fixed connection endpoints, origin verification, input sanitization, build obfuscation.',
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
      desc: '14 个结构化错误类，instanceof 类型窄化，精准定位问题。',
    },
    { icon: 'rocket', title: '预检编排', desc: '一行代码完成健康检查 → 权益验证 → 打印机获取。' },
    {
      icon: 'lock',
      title: '安全优先',
      desc: '固定连接端点 + 来源验证 + 输入清洗 + 构建混淆。',
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

export const sdkVersionLabels: Record<Locale, { label: string; source: string }> = {
  en: { label: 'SDK', source: 'Source' },
  zh: { label: 'SDK', source: '来源' },
}

export const betaBannerLabels: Record<
  Locale,
  { message: string; dismiss: string; sourceFallback: string }
> = {
  en: {
    message:
      'Docs preview for @appzgatenz/label-print-topbridge-js@{version} ({source}). APIs may change — do not use for production.',
    dismiss: 'Dismiss',
    sourceFallback: 'pre-release',
  },
  zh: {
    message:
      '当前文档预览对应 @appzgatenz/label-print-topbridge-js@{version}（{source}）。API 可能变更，请勿用于生产环境。',
    dismiss: '关闭',
    sourceFallback: '预发布源',
  },
}

export const devModeLabels: Record<Locale, { title: string; description: string; close: string }> =
  {
    en: {
      title: 'Dev Mode',
      description: 'SDK requests intercepted. Data output goes to the Log panel.',
      close: 'Close',
    },
    zh: {
      title: '开发模式',
      description: 'SDK 请求已拦截，数据输出到 Log 面板',
      close: '关闭',
    },
  }

export const playgroundFormLabels: Record<
  Locale,
  { codeDrivenPrefix: string; advancedMode: string; codeDrivenSuffix: string }
> = {
  en: {
    codeDrivenPrefix: 'This example is code-driven. Switch to ',
    advancedMode: 'Advanced Mode',
    codeDrivenSuffix: ' to edit and run the demo code.',
  },
  zh: {
    codeDrivenPrefix: '此示例由代码驱动。请切换到',
    advancedMode: '高级模式',
    codeDrivenSuffix: '以编辑并运行演示代码。',
  },
}

export const playgroundLabels: Record<
  Locale,
  {
    formMode: string
    advancedMode: string
    preflight: string
    runPreflight: string
    checking: string
    healthCheckOnly: string
    log: string
    clear: string
    emptyLog: string
    codeEditor: string
    ctrlEnterHint: string
    share: string
    shareCopied: string
    shareFailed: string
    run: string
    running: string
    loadingEditor: string
    productList: string
    printSettings: string
    name: string
    price: string
    currency: string
    unit: string
    copies: string
    addProduct: string
    template: string
    printer: string
    selectPrinter: string
    defaultSuffix: string
    print: string
    batchPrint: string
    printing: string
    templatePrinter: string
    dynamicForm: string
    querySchema: string
    fetchTemplates: string
    fetching: string
    querySchemaTitle: string
    querying: string
    selectOption: string
    realErrorTriggers: string
    runPreflightError: string
    emptyProductError: string
    simulateErrors: string
  }
> = {
  en: {
    formMode: '← Form Mode',
    advancedMode: 'Advanced Mode →',
    preflight: '1. Preflight',
    runPreflight: 'Run Preflight',
    checking: 'Checking...',
    healthCheckOnly: 'Health Check Only',
    log: 'Log',
    clear: 'Clear',
    emptyLog: 'Run an action to see output...',
    codeEditor: 'Code Editor',
    ctrlEnterHint: 'Ctrl+Enter to run',
    share: 'Share',
    shareCopied: 'Share link copied to clipboard!',
    shareFailed: 'Failed to copy share link',
    run: 'Run',
    running: 'Running...',
    loadingEditor: 'Loading editor...',
    productList: '2. Product List',
    printSettings: '2. Print Settings',
    name: 'Name',
    price: 'Price',
    currency: 'Currency',
    unit: 'Unit',
    copies: 'Copies',
    addProduct: '+ Add Product',
    template: 'Template',
    printer: 'Printer',
    selectPrinter: '-- select printer --',
    defaultSuffix: ' (default)',
    print: 'Print',
    batchPrint: 'Batch Print',
    printing: 'Printing...',
    templatePrinter: '2. Template & Printer',
    dynamicForm: '3. Dynamic Form',
    querySchema: 'Query Schema',
    fetchTemplates: '1. Fetch Templates',
    fetching: 'Fetching...',
    querySchemaTitle: '2. Query Schema',
    querying: 'Querying...',
    selectOption: '-- select --',
    realErrorTriggers: 'Real Error Triggers',
    runPreflightError: 'Run Preflight (with error handling)',
    emptyProductError: 'Empty Product List (ValidationError)',
    simulateErrors: 'Simulate Errors (instanceof narrowing demo)',
  },
  zh: {
    formMode: '← 表单模式',
    advancedMode: '高级模式 →',
    preflight: '1. 预检',
    runPreflight: '运行预检',
    checking: '检查中...',
    healthCheckOnly: '仅健康检查',
    log: '日志',
    clear: '清除',
    emptyLog: '执行操作以查看输出...',
    codeEditor: '代码编辑器',
    ctrlEnterHint: 'Ctrl+Enter 运行',
    share: '分享',
    shareCopied: '分享链接已复制到剪贴板！',
    shareFailed: '复制分享链接失败',
    run: '运行',
    running: '运行中...',
    loadingEditor: '编辑器加载中...',
    productList: '2. 产品列表',
    printSettings: '2. 打印设置',
    name: '名称',
    price: '价格',
    currency: '货币',
    unit: '单位',
    copies: '份数',
    addProduct: '+ 添加产品',
    template: '模板',
    printer: '打印机',
    selectPrinter: '-- 选择打印机 --',
    defaultSuffix: '（默认）',
    print: '打印',
    batchPrint: '批量打印',
    printing: '打印中...',
    templatePrinter: '2. 模板与打印机',
    dynamicForm: '3. 动态表单',
    querySchema: '查询 Schema',
    fetchTemplates: '1. 获取模板',
    fetching: '获取中...',
    querySchemaTitle: '2. 查询 Schema',
    querying: '查询中...',
    selectOption: '-- 选择 --',
    realErrorTriggers: '真实错误触发',
    runPreflightError: '运行预检（含错误处理）',
    emptyProductError: '空产品列表（ValidationError）',
    simulateErrors: '模拟错误（instanceof 类型窄化演示）',
  },
}
