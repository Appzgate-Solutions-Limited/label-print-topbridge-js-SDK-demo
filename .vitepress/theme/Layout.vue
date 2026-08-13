<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { computed } from 'vue'
import BetaBanner from './components/BetaBanner.vue'
import { provideDevMode } from './composables/useDevMode'
import { provideSdkType } from './composables/useSdkType'

const { Layout } = DefaultTheme
const { lang } = useData()

const { sdkType, switchSdkType } = provideSdkType()
provideDevMode()

// SdkSwitcher removed from nav; force js-core to clear stale sessionStorage
if (sdkType.value !== 'js-core') switchSdkType('js-core')

const locale = computed(() => (lang.value === 'zh-CN' ? ('zh' as const) : ('en' as const)))
</script>

<template>
  <Layout>
    <template #layout-top>
      <BetaBanner :locale="locale" />
    </template>
  </Layout>
</template>
