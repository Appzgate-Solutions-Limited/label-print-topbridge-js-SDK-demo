import { useCodeRunner } from './useCodeRunner'
import { useDevMode } from './useDevMode'
import { useErrorDemo } from './useErrorDemo'
import { useLogPanel } from './useLogPanel'
import { useSdkOps } from './useSdkOps'

export type { AddLogFn, LogEntry } from './useLogPanel'
export type { PlaygroundPrinter, PlaygroundSchemaField, PlaygroundTemplateItem } from './useSdkOps'

/**
 * 组合根——组合 4 个聚焦 composable，对外保持与旧 usePlayground 相同的接口。
 *
 * 错误传播约定（与各子 composable 内部一致）:
 * - runPreflight / runHealthCheck: catch 后 addLog 再 throw，允许调用方做后续编排
 * - print / fetchTemplates / querySchema / runErrorTest / executeUserCode: 仅 addLog，不外抛
 */
export function usePlayground() {
  const { isDevMode } = useDevMode()
  const { logs, addLog, clearLogs } = useLogPanel()

  const sdk = useSdkOps(addLog, isDevMode)
  const { runErrorTest } = useErrorDemo(addLog, sdk.ensureClient, sdk.withLoading)
  const { executeUserCode } = useCodeRunner(
    addLog,
    isDevMode,
    sdk.withLoading,
    sdk.onTransportRequest,
  )

  return {
    logs,
    clearLogs,
    isLoading: sdk.isLoading,
    printers: sdk.printers,
    templates: sdk.templates,
    schemaFields: sdk.schemaFields,
    runPreflight: sdk.runPreflight,
    runHealthCheck: sdk.runHealthCheck,
    print: sdk.print,
    fetchTemplates: sdk.fetchTemplates,
    querySchema: sdk.querySchema,
    runErrorTest,
    executeUserCode,
  }
}
