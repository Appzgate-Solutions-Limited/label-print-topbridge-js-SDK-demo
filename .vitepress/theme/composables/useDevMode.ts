import { type InjectionKey, inject, provide, type Ref, ref, watch } from 'vue'

const STORAGE_KEY = '__tb_dev__'

export interface DevModeContext {
  isDevMode: Ref<boolean>
  activate: () => void
  deactivate: () => void
}

export const DEVMODE_KEY: InjectionKey<DevModeContext> = Symbol('devMode')

function readStorage(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function writeStorage(value: boolean) {
  try {
    if (value) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // sessionStorage 不可用时静默忽略
  }
}

function installGlobal(isDevMode: Ref<boolean>) {
  if (typeof window === 'undefined') return

  ;(window as any).__tb_dev__ = (value?: boolean) => {
    if (value === undefined) {
      isDevMode.value = !isDevMode.value
    } else {
      isDevMode.value = !!value
    }
  }
}

export function provideDevMode() {
  const isDevMode = ref(readStorage())

  watch(isDevMode, (v) => {
    writeStorage(v)
    console.log(
      `%c[TopBridge Dev Mode] ${v ? 'ON' : 'OFF'}`,
      `color: ${v ? '#f59e0b' : '#999'}; font-weight: bold`,
    )
  })

  installGlobal(isDevMode)

  function activate() {
    isDevMode.value = true
  }

  function deactivate() {
    isDevMode.value = false
  }

  provide(DEVMODE_KEY, { isDevMode, activate, deactivate })

  return { isDevMode, activate, deactivate }
}

export function useDevMode() {
  const ctx = inject(DEVMODE_KEY)
  if (!ctx) throw new Error('useDevMode() called without provideDevMode()')
  return ctx
}
