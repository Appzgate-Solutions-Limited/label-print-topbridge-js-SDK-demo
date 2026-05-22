import type {
  SyncedPrinter,
  TemplateFieldSchema,
  TemplateItem,
} from '@appzgatenz/label-print-topbridge-js'
import {
  TopBridgeAuthError,
  TopBridgeClient,
  TopBridgeConfigError,
  TopBridgeConnectionError,
  TopBridgeError,
  TopBridgeNetworkError,
  TopBridgePrintError,
  TopBridgePrinterError,
  TopBridgeQuotaError,
  TopBridgeSourceError,
  TopBridgeTemplateError,
  TopBridgeValidationError,
} from '@appzgatenz/label-print-topbridge-js'
import { transform } from 'sucrase'
import { ref, shallowRef } from 'vue'

/**
 * 错误传播约定:
 * - runPreflight / runHealthCheck:catch 后 addLog 再 throw,允许调用方根据成功/失败做后续编排
 *   (例如 preflightDone 状态切换、advanced-form 自动 querySchema)
 * - print / fetchTemplates / querySchema / runErrorTest / executeUserCode:
 *   内部 catch 后仅 addLog,**永不向外抛**——这些函数的语义是"日志面板自洽展示",
 *   调用方不需要也不应该 try/catch 它们
 */

export type PlaygroundPrinter = SyncedPrinter
export type PlaygroundTemplateItem = TemplateItem
export type PlaygroundSchemaField = TemplateFieldSchema

export interface LogEntry {
  time: string
  message: string
  type: 'info' | 'success' | 'error'
}

const sdkExports = {
  TopBridgeClient,
  TopBridgeConnectionError,
  TopBridgeAuthError,
  TopBridgeQuotaError,
  TopBridgePrintError,
  TopBridgeValidationError,
  TopBridgePrinterError,
  TopBridgeTemplateError,
  TopBridgeNetworkError,
  TopBridgeSourceError,
  TopBridgeConfigError,
  TopBridgeError,
}

const ERROR_CONSTRUCTORS: Record<string, () => Error> = {
  connection: () => new TopBridgeConnectionError('TopBridge App is not running'),
  'auth-not-authenticated': () =>
    new TopBridgeAuthError('User is not logged in', { code: 'NOT_AUTHENTICATED' }),
  'auth-update-required': () =>
    new TopBridgeAuthError('TopBridge App version is too low', {
      code: 'UPDATE_REQUIRED',
      storeUrl: 'https://example.com/update',
    }),
  quota: () =>
    new TopBridgeQuotaError('Print quota exhausted', { reason: 'Monthly limit reached' }),
  printer: () => new TopBridgePrinterError('Printer is offline'),
  template: () => new TopBridgeTemplateError('Template not found'),
  network: () => new TopBridgeNetworkError('Cloud network disconnected'),
  source: () => new TopBridgeSourceError('Origin verification failed'),
  config: () => new TopBridgeConfigError('Invalid configuration'),
  print: () => new TopBridgePrintError('Print job failed', { details: { jobId: '12345' } }),
  validation: () => new TopBridgeValidationError('Invalid input', 'products'),
}

export function usePlayground() {
  const client = shallowRef<TopBridgeClient | null>(null)
  const logs = ref<LogEntry[]>([])
  const isLoading = ref(false)
  const printers = ref<PlaygroundPrinter[]>([])
  const templates = ref<PlaygroundTemplateItem[]>([])
  const schemaFields = ref<PlaygroundSchemaField[]>([])

  function addLog(message: string, type: LogEntry['type'] = 'info') {
    logs.value.push({
      time: new Date().toLocaleTimeString(),
      message,
      type,
    })
  }

  function clearLogs() {
    logs.value = []
  }

  function ensureClient() {
    if (!client.value) {
      client.value = new TopBridgeClient({ debug: true })
    }
    return client.value
  }

  async function withLoading<T>(fn: () => Promise<T>): Promise<T> {
    isLoading.value = true
    try {
      return await fn()
    } finally {
      isLoading.value = false
    }
  }

  async function runPreflight() {
    return withLoading(async () => {
      try {
        const c = ensureClient()
        const result = await c.launch.ensureRunning(
          () =>
            c.preflight.run({
              onStepChange: (step: string) => addLog(`  Step: ${step}...`),
            }),
          { onLaunching: () => addLog('  Launching TopBridge...') },
        )

        addLog('✓ Preflight passed', 'success')
        printers.value = result.printers.data?.printers ?? []
        addLog(
          `  Printers: ${result.printers.data?.count}, default: ${result.printers.data?.defaultPrinter}`,
        )

        const tplResult = await c.templates.list()
        templates.value = tplResult.data.templates ?? []
        addLog(`  Templates: ${tplResult.data.templates?.length ?? 0} available`)

        return result
      } catch (err: any) {
        addLog(`✗ Preflight failed: ${err.message}`, 'error')
        throw err
      }
    })
  }

  async function runHealthCheck() {
    return withLoading(async () => {
      try {
        const health = await ensureClient().health.check()
        addLog(
          `✓ TopBridge App ${health.isRunning ? 'running' : 'not running'}`,
          health.isRunning ? 'success' : 'error',
        )
        if (health.data?.isLoggedIn !== undefined)
          addLog(`  Logged in: ${health.data.isLoggedIn ? 'Yes' : 'No'}`)
        if (health.data?.version) addLog(`  Version: ${health.data.version}`)
        return health
      } catch (err: any) {
        addLog(`✗ Health check failed: ${err.message}`, 'error')
        throw err
      }
    })
  }

  async function print(params: any) {
    return withLoading(async () => {
      try {
        const result = await ensureClient().print.execute(params)
        addLog('✓ Print successful', 'success')
        addLog(`  Copies: ${result.data.printedCopies}`)
        addLog(`  Template: ${result.data.templateName}`)
        if (result.data.jobId) addLog(`  Job ID: ${result.data.jobId}`)
        if (result.warnings?.length) {
          for (const w of result.warnings) {
            addLog(`  Warning: [${w.code}] ${w.message}`, 'error')
          }
        }
      } catch (err: any) {
        addLog(`✗ Print failed: ${err.message}`, 'error')
        if (err.field) addLog(`  Field: ${err.field}`)
      }
    })
  }

  async function fetchTemplates() {
    return withLoading(async () => {
      try {
        const result = await ensureClient().templates.list()
        templates.value = result.data.templates ?? []
        addLog(`✓ Found ${result.data.count} templates`, 'success')
      } catch (err: any) {
        addLog(`✗ Failed: ${err.message}`, 'error')
      }
    })
  }

  async function querySchema(templateCode: string) {
    return withLoading(async () => {
      try {
        const schema = await ensureClient().templates.schema(templateCode)
        schemaFields.value = schema.data.fields ?? []
        addLog(`✓ Schema: ${schema.data.name} (${schema.data.code})`, 'success')
        addLog(`  Fields: ${schema.data.fields?.length ?? 0}`)
        for (const f of schema.data.fields ?? []) {
          if (f.type !== 'line') {
            addLog(`    ${f.name}: ${f.type}${f.required ? ' (required)' : ''}`)
          }
        }
      } catch (err: any) {
        schemaFields.value = []
        addLog(`✗ Schema failed: ${err.message}`, 'error')
      }
    })
  }

  async function runErrorTest(type: string) {
    return withLoading(async () => {
      if (type === 'preflight') {
        addLog('--- Preflight with error handling ---')
        try {
          const result = await ensureClient().preflight.run({
            onStepChange: (step: string) => addLog(`  Step: ${step}...`),
          })
          addLog('✓ Preflight passed', 'success')
          addLog(`  Printer: ${result.printers.data?.defaultPrinter}`)
        } catch (err: any) {
          logErrorDetail(err)
        }
      } else if (type === 'validation') {
        addLog('--- Empty product list test ---')
        try {
          await ensureClient().print.execute({
            template: 'PRICE_LABEL',
            printer: 'Test',
            products: [],
          })
        } catch (err: any) {
          logErrorDetail(err)
        }
      } else if (type.startsWith('simulate-')) {
        const errorType = type.replace('simulate-', '')
        addLog(`--- Simulated ${errorType} ---`)
        const ctor = ERROR_CONSTRUCTORS[errorType]
        try {
          throw ctor ? ctor() : new TopBridgeError('Unknown simulated error')
        } catch (err: any) {
          addLog(`✗ [Simulated] ${err.constructor?.name || 'Error'}: ${err.message}`, 'error')
          if (err.code) addLog(`  code: ${err.code}`)
          if (err.storeUrl) addLog(`  storeUrl: ${err.storeUrl}`)
          if (err.downloadUrl) addLog(`  downloadUrl: ${err.downloadUrl}`)
          if (err.reason) addLog(`  reason: ${err.reason}`)
          if (err.field) addLog(`  field: ${err.field}`)
          if (err.details) addLog(`  details: ${JSON.stringify(err.details)}`)
        }
      }
    })
  }

  function logErrorDetail(err: any) {
    const name = err.constructor?.name || 'Error'
    addLog(`✗ ${name}: ${err.message}`, 'error')
    if (err.code) addLog(`  code: ${err.code}`)
    if (err.storeUrl) addLog(`  Update: ${err.storeUrl}`)
  }

  async function executeUserCode(code: string) {
    return withLoading(async () => {
      addLog('--- Executing user code ---')
      try {
        const stripped = stripSdkImports(code)
        const js = transform(stripped, { transforms: ['typescript'] }).code

        const paramNames = Object.keys(sdkExports)
        const paramValues = Object.values(sdkExports)

        const customConsole = {
          log: (...args: any[]) => addLog(args.map(String).join(' ')),
          error: (...args: any[]) => addLog(args.map(String).join(' '), 'error'),
          warn: (...args: any[]) => addLog(args.map(String).join(' ')),
        }

        const fn = new Function(...paramNames, 'console', `return (async () => { ${js} })()`)
        await fn(...paramValues, customConsole)
        addLog('--- Execution complete ---', 'success')
      } catch (err: any) {
        addLog(`✗ Execution error: ${err.message}`, 'error')
      }
    })
  }

  function stripSdkImports(code: string) {
    return code.replace(
      /^\s*import[\s\S]*?from\s+['"]@appzgatenz\/label-print-topbridge-js['"];?\s*$/gm,
      '',
    )
  }

  return {
    client,
    logs,
    isLoading,
    printers,
    templates,
    schemaFields,
    addLog,
    clearLogs,
    ensureClient,
    runPreflight,
    runHealthCheck,
    print,
    fetchTemplates,
    querySchema,
    runErrorTest,
    executeUserCode,
  }
}
