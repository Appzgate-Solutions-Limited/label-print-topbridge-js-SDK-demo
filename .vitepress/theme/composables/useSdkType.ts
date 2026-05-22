import { type InjectionKey, inject, provide, type Ref, ref } from 'vue'

export type SdkType = 'js-core' | 'nextjs' | 'react'

const VALID_SDK_TYPES: readonly SdkType[] = ['js-core', 'nextjs', 'react']
const STORAGE_KEY = 'tb-sdk-type'

interface SdkTypeContext {
  sdkType: Ref<SdkType>
  switchSdkType: (t: SdkType) => void
}

export const SDK_TYPE_KEY: InjectionKey<SdkTypeContext> = Symbol('sdkType')

function readStored(): SdkType | null {
  if (typeof window === 'undefined') return null
  try {
    const v = window.sessionStorage.getItem(STORAGE_KEY) as SdkType | null
    return v && VALID_SDK_TYPES.includes(v) ? v : null
  } catch {
    return null
  }
}

function writeStored(t: SdkType) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, t)
  } catch {
    /* ignore quota / disabled storage */
  }
}

export function provideSdkType() {
  const sdkType = ref<SdkType>(readStored() ?? 'js-core')

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.sdk = sdkType.value
  }

  function switchSdkType(t: SdkType) {
    sdkType.value = t
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.sdk = t
    }
    writeStored(t)
  }

  provide(SDK_TYPE_KEY, { sdkType, switchSdkType })

  return { sdkType, switchSdkType }
}

export function useSdkType() {
  return inject(SDK_TYPE_KEY, {
    sdkType: ref<SdkType>('js-core'),
    switchSdkType: () => {},
  })
}
