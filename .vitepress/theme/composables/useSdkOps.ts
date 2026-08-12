import type {
  SyncedPrinter,
  TemplateFieldSchema,
  TemplateItem,
} from '@appzgatenz/label-print-topbridge-js'
import { TopBridgeClient } from '@appzgatenz/label-print-topbridge-js'
import type { Ref } from 'vue'
import { ref, shallowRef } from 'vue'
import type { CapturedRequest } from './devTransport'
import { DevTransport } from './devTransport'
import type { AddLogFn } from './useLogPanel'

export type PlaygroundPrinter = SyncedPrinter
export type PlaygroundTemplateItem = TemplateItem
export type PlaygroundSchemaField = TemplateFieldSchema

export type WithLoadingFn = <T>(fn: () => Promise<T>) => Promise<T>

export function useSdkOps(addLog: AddLogFn, isDevMode: Ref<boolean>) {
  const client = shallowRef<TopBridgeClient | null>(null)
  let clientIsDevMode: boolean | null = null
  const isLoading = ref(false)
  const printers = ref<PlaygroundPrinter[]>([])
  const templates = ref<PlaygroundTemplateItem[]>([])
  const schemaFields = ref<PlaygroundSchemaField[]>([])

  function onTransportRequest(request: CapturedRequest) {
    addLog(`→ Transport: ${request.action}`, 'info', {
      title: `Transport Request: ${request.action}`,
      content: JSON.stringify(request, null, 2),
    })
  }

  function ensureClient() {
    const devMode = isDevMode.value
    if (!client.value || clientIsDevMode !== devMode) {
      if (devMode) {
        client.value = new TopBridgeClient({ transport: new DevTransport(onTransportRequest) })
      } else {
        client.value = new TopBridgeClient({ debug: true })
      }
      clientIsDevMode = devMode
    }
    return client.value
  }

  const withLoading: WithLoadingFn = async (fn) => {
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
        if (isDevMode.value) {
          addLog('⚡ [Dev Mode] Skipping preflight — injecting mock data', 'info')
          printers.value = [{ name: 'Mock Printer', isDefault: true, protocol: 'TSPL' }]
          templates.value = [
            { id: '1', name: 'Price Label', code: 'PRICE_LABEL', isEnabled: true },
            { id: '2', name: 'Product Tag', code: 'PRODUCT_TAG', isEnabled: true },
          ]
          addLog('✓ Preflight passed (mock)', 'success')
          addLog('  Printers: 1, default: Mock Printer')
          addLog('  Templates: 2 available')
          return {
            health: {
              status: 'ok' as const,
              type: 'pong' as const,
              isRunning: true as const,
              data: { isLoggedIn: true, version: '0.0.0-dev' },
              message: 'OK',
            },
            benefits: { status: 'ok' as const, data: { isValid: true }, message: 'OK' },
            printers: { status: 'ok' as const, data: printers.value, message: 'OK' },
          }
        }

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
        if (isDevMode.value) {
          addLog('⚡ [Dev Mode] SDK Params:', 'info', {
            title: 'SDK Params',
            content: JSON.stringify(params, null, 2),
          })
        }
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
          if (f.fieldType !== 'line') {
            addLog(`    ${f.dataField}: ${f.fieldType}${f.required ? ' (required)' : ''}`)
          }
        }
      } catch (err: any) {
        schemaFields.value = []
        addLog(`✗ Schema failed: ${err.message}`, 'error')
      }
    })
  }

  return {
    isLoading,
    printers,
    templates,
    schemaFields,
    ensureClient,
    withLoading,
    onTransportRequest,
    runPreflight,
    runHealthCheck,
    print,
    fetchTemplates,
    querySchema,
  }
}
