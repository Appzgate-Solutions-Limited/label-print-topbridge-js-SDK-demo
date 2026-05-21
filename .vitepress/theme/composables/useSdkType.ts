import { ref, provide, inject, type Ref, type InjectionKey } from 'vue'

export type SdkType = 'js-core' | 'nextjs' | 'react'

interface SdkTypeContext {
  sdkType: Ref<SdkType>
  switchSdkType: (t: SdkType) => void
}

export const SDK_TYPE_KEY: InjectionKey<SdkTypeContext> = Symbol('sdkType')

export function switchToCore() {
  document.documentElement.dataset.sdk = 'js-core'
  window.location.reload()
}

export function provideSdkType() {
  const sdkType = ref<SdkType>('js-core')

  function switchSdkType(t: SdkType) {
    sdkType.value = t
    document.documentElement.dataset.sdk = t
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
