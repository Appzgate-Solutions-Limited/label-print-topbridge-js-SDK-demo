import { ref, shallowRef } from 'vue'
import {
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
} from '@appzgatenz/label-print-topbridge-js'
import { transform } from 'sucrase'

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

export function usePlayground() {
  const client = shallowRef<TopBridgeClient | null>(null)
  const logs = ref<LogEntry[]>([])
  const isLoading = ref(false)
  const printers = ref<{ name: string; isDefault: boolean; protocol?: string }[]>([])
  const templates = ref<{ id: string; code?: string; name: string; isEnabled: boolean }[]>([])

  function addLog(message: string, type: LogEntry['type'] = 'info') {
    logs.value = [...logs.value, {
      time: new Date().toLocaleTimeString(),
      message,
      type,
    }]
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

  async function runPreflight() {
    isLoading.value = true
    try {
      const c = ensureClient()
      const result = await c.launch.ensureRunning(
        () => c.preflight.run({
          onStepChange: (step: string) => addLog(`  Step: ${step}...`),
        }),
        { onLaunching: () => addLog('  Launching TopBridge...') },
      )

      addLog('✓ Preflight passed', 'success')
      printers.value = result.printers.data?.printers ?? []
      addLog(`  Printers: ${result.printers.data?.count}, default: ${result.printers.data?.defaultPrinter}`)

      const tplResult = await c.templates.list()
      templates.value = tplResult.data.templates ?? []
      addLog(`  Templates: ${tplResult.data.templates?.length ?? 0} available`)

      return result
    } catch (err: any) {
      addLog(`✗ Preflight failed: ${err.message}`, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function runHealthCheck() {
    isLoading.value = true
    try {
      const c = ensureClient()
      const health = await c.health.check()
      addLog(`✓ TopBridge App ${health.isRunning ? 'running' : 'not running'}`, health.isRunning ? 'success' : 'error')
      if (health.data?.isLoggedIn !== undefined) addLog(`  Logged in: ${health.data.isLoggedIn ? 'Yes' : 'No'}`)
      if (health.data?.version) addLog(`  Version: ${health.data.version}`)
      return health
    } catch (err: any) {
      addLog(`✗ Health check failed: ${err.message}`, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function executeUserCode(code: string) {
    // 去掉 import 语句
    const stripped = code.replace(/^import\s+.*from\s+['"].*['"];?\s*$/gm, '')
    const js = transform(stripped, { transforms: ['typescript'] }).code

    const paramNames = Object.keys(sdkExports)
    const paramValues = Object.values(sdkExports)

    const customConsole = {
      log: (...args: any[]) => addLog(args.map(String).join(' ')),
      error: (...args: any[]) => addLog(args.map(String).join(' '), 'error'),
      warn: (...args: any[]) => addLog(args.map(String).join(' ')),
    }

    const fn = new Function(...paramNames, 'console', `return (async () => { ${js} })()`)
    return await fn(...paramValues, customConsole)
  }

  return {
    client,
    logs,
    isLoading,
    printers,
    templates,
    addLog,
    clearLogs,
    ensureClient,
    runPreflight,
    runHealthCheck,
    executeUserCode,
  }
}
