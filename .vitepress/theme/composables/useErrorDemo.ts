import {
  TopBridgeAuthError,
  type TopBridgeClient,
  TopBridgeConfigError,
  TopBridgeConnectionError,
  TopBridgeError,
  TopBridgeNetworkError,
  TopBridgePrintError,
  TopBridgePrinterError,
  TopBridgePrinterSetupError,
  TopBridgeQuotaError,
  TopBridgeSessionError,
  TopBridgeSourceError,
  TopBridgeTemplateError,
  TopBridgeValidationError,
  TopBridgeVersionError,
} from '@appzgatenz/label-print-topbridge-js'
import type { AddLogFn } from './useLogPanel'
import type { WithLoadingFn } from './useSdkOps'

export interface ErrorSimulation {
  key: string
  label: string
  create: () => Error
  /** legacy 条目不在 UI 中展示，仅保留向后兼容 */
  hidden?: boolean
}

/** 统一错误模拟列表——UI 展示和 runErrorTest 共享的唯一数据源 */
export const ERROR_SIMULATIONS: ErrorSimulation[] = [
  {
    key: 'connection',
    label: 'ConnectionError',
    create: () => new TopBridgeConnectionError('TopBridge App is not running'),
  },
  {
    key: 'auth-not-authenticated',
    label: 'AuthError',
    create: () => new TopBridgeAuthError('User is not logged in', { code: 'NOT_AUTHENTICATED' }),
  },
  {
    key: 'version-update-required',
    label: 'VersionError',
    create: () =>
      new TopBridgeVersionError('TopBridge App version is too low', {
        storeUrl: 'https://example.com/update',
      }),
  },
  {
    key: 'auth-update-required',
    label: 'VersionError (legacy)',
    create: () =>
      new TopBridgeVersionError('TopBridge App version is too low', {
        storeUrl: 'https://example.com/update',
      }),
    hidden: true,
  },
  {
    key: 'quota',
    label: 'QuotaError',
    create: () =>
      new TopBridgeQuotaError('Print quota exhausted', { reason: 'Monthly limit reached' }),
  },
  {
    key: 'printer',
    label: 'PrinterError',
    create: () => new TopBridgePrinterError('Printer is offline', { code: 'PRINTER_OFFLINE' }),
  },
  {
    key: 'template',
    label: 'TemplateError',
    create: () => new TopBridgeTemplateError('Template not found'),
  },
  {
    key: 'network',
    label: 'NetworkError',
    create: () => new TopBridgeNetworkError('Cloud network disconnected'),
  },
  {
    key: 'source',
    label: 'SourceError',
    create: () => new TopBridgeSourceError('Origin verification failed'),
  },
  {
    key: 'config',
    label: 'ConfigError',
    create: () => new TopBridgeConfigError('Invalid configuration'),
  },
  {
    key: 'print',
    label: 'PrintError',
    create: () => new TopBridgePrintError('Print job failed', { details: { jobId: '12345' } }),
  },
  {
    key: 'validation',
    label: 'ValidationError',
    create: () => new TopBridgeValidationError('Invalid input', 'products'),
  },
  {
    key: 'printer-setup',
    label: 'PrinterSetupError',
    create: () =>
      new TopBridgePrinterSetupError('Charset already exists', {
        code: 'CHARSET_ALREADY_EXISTS',
      }),
  },
  {
    key: 'session',
    label: 'SessionError',
    create: () =>
      new TopBridgeSessionError('Session limit exceeded', {
        limit: 2,
        usedSessions: 3,
        sessions: [
          {
            id: 'sess-1',
            ipAddress: '127.0.0.1',
            started: '2026-01-01T00:00:00Z',
            lastAccess: '2026-01-01T01:00:00Z',
            clients: 'topbridge',
            isCurrent: true,
          },
        ],
      }),
  },
]

const ERROR_CTOR_MAP: Record<string, () => Error> = Object.fromEntries(
  ERROR_SIMULATIONS.map((s) => [s.key, s.create]),
)

export function useErrorDemo(
  addLog: AddLogFn,
  ensureClient: () => TopBridgeClient,
  withLoading: WithLoadingFn,
) {
  /** 唯一错误详情日志器——所有错误路径统一调用，消除字段枚举 drift */
  function logErrorDetail(err: any) {
    const name = err.constructor?.name || 'Error'
    addLog(`✗ ${name}: ${err.message}`, 'error')
    if (err.code) addLog(`  code: ${err.code}`)
    if (err.storeUrl) addLog(`  Update: ${err.storeUrl}`)
    if (err.downloadUrl) addLog(`  Download: ${err.downloadUrl}`)
    if (err.reason) addLog(`  reason: ${err.reason}`)
    if (err.field) addLog(`  field: ${err.field}`)
    if (err.details) addLog(`  details: ${JSON.stringify(err.details)}`)
    if (err.limit != null) addLog(`  limit: ${err.limit}`)
    if (err.usedSessions != null) addLog(`  usedSessions: ${err.usedSessions}`)
    if (err.sessions) addLog(`  sessions: ${err.sessions.length}`)
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
        const ctor = ERROR_CTOR_MAP[errorType]
        try {
          throw ctor ? ctor() : new TopBridgeError('Unknown simulated error')
        } catch (err: any) {
          logErrorDetail(err)
        }
      }
    })
  }

  return { runErrorTest }
}
