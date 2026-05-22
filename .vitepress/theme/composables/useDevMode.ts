import { ref, watch } from 'vue'

const STORAGE_KEY = '__tb_dev__'

const isDevMode = ref(false)

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

function installGlobal() {
  if (typeof window === 'undefined') return

  ;(window as any).__tb_dev__ = (value?: boolean) => {
    if (value === undefined) {
      isDevMode.value = !isDevMode.value
    } else {
      isDevMode.value = !!value
    }
  }
}

function activate() {
  isDevMode.value = true
}

function deactivate() {
  isDevMode.value = false
}

export function useDevMode() {
  return { isDevMode, activate, deactivate }
}

// 模块加载时一次性初始化
isDevMode.value = readStorage()
watch(isDevMode, (v) => {
  writeStorage(v)
  console.log(
    `%c[TopBridge Dev Mode] ${v ? 'ON' : 'OFF'}`,
    `color: ${v ? '#f59e0b' : '#999'}; font-weight: bold`,
  )
})
installGlobal()
