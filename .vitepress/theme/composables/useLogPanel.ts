import { ref } from 'vue'

export interface LogEntry {
  time: string
  message: string
  type: 'info' | 'success' | 'error'
  data?: { title: string; content: string }
}

export type AddLogFn = (message: string, type?: LogEntry['type'], data?: LogEntry['data']) => void

export function useLogPanel() {
  const logs = ref<LogEntry[]>([])

  const addLog: AddLogFn = (message, type = 'info', data) => {
    logs.value.push({
      time: new Date().toLocaleTimeString(),
      message,
      type,
      data,
    })
  }

  function clearLogs() {
    logs.value = []
  }

  return { logs, addLog, clearLogs }
}
