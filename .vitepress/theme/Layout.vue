<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { computed } from 'vue'
import ComingSoonOverlay from './components/ComingSoonOverlay.vue'
import SdkSwitcher from './components/SdkSwitcher.vue'
import { provideSdkType } from './composables/useSdkType'

const { Layout } = DefaultTheme
const { lang } = useData()

const { sdkType } = provideSdkType()

const locale = computed(() => (lang.value === 'zh-CN' ? ('zh' as const) : ('en' as const)))
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <SdkSwitcher :locale="locale" />
    </template>
    <template #layout-top>
      <ComingSoonOverlay :sdk-type="sdkType" :locale="locale" />
    </template>
  </Layout>
</template>
