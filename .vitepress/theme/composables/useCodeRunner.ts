import {
  TopBridgeAuthError,
  TopBridgeClient,
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
import { transform } from 'sucrase'
import type { Ref } from 'vue'
import type { CapturedRequest } from './devTransport'
import { DevTransport } from './devTransport'
import type { AddLogFn } from './useLogPanel'
import type { WithLoadingFn } from './useSdkOps'

export function useCodeRunner(
  addLog: AddLogFn,
  isDevMode: Ref<boolean>,
  withLoading: WithLoadingFn,
  onTransportRequest: (req: CapturedRequest) => void,
) {
  async function executeUserCode(code: string) {
    return withLoading(async () => {
      addLog('--- Executing user code ---')
      try {
        const stripped = stripSdkImports(code)
        const js = transform(stripped, { transforms: ['typescript'] }).code

        const devMode = isDevMode.value
        const exports = devMode ? buildDevSdkExports() : buildRealSdkExports()
        const paramNames = Object.keys(exports)
        const paramValues = Object.values(exports)

        const customConsole = {
          log: (...args: any[]) => addLog(args.map(String).join(' ')),
          error: (...args: any[]) => addLog(args.map(String).join(' '), 'error'),
          warn: (...args: any[]) => addLog(args.map(String).join(' '), 'warn'),
        }

        const fn = new Function(...paramNames, 'console', `return (async () => { ${js} })()`)
        await fn(...paramValues, customConsole)
        addLog('--- Execution complete ---', 'success')
      } catch (err: any) {
        addLog(`✗ Execution error: ${err.message}`, 'error')
      }
    })
  }

  function buildRealSdkExports() {
    return {
      TopBridgeClient,
      TopBridgeConnectionError,
      TopBridgeAuthError,
      TopBridgeVersionError,
      TopBridgeQuotaError,
      TopBridgePrintError,
      TopBridgeValidationError,
      TopBridgePrinterError,
      TopBridgePrinterSetupError,
      TopBridgeTemplateError,
      TopBridgeNetworkError,
      TopBridgeSourceError,
      TopBridgeConfigError,
      TopBridgeSessionError,
      TopBridgeError,
    }
  }

  function buildDevSdkExports() {
    return {
      ...buildRealSdkExports(),
      TopBridgeClient: class extends TopBridgeClient {
        constructor(config?: any) {
          super({ ...config, transport: new DevTransport(onTransportRequest) })
        }
      },
    }
  }

  /** 剥离 SDK import 语句，支持单行和多行格式 */
  function stripSdkImports(code: string) {
    return code.replace(
      /import\s+[\s\S]*?from\s+['"]@appzgatenz\/label-print-topbridge-js['"];?/g,
      '',
    )
  }

  return { executeUserCode }
}
