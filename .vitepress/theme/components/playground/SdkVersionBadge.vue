<script setup lang="ts">
import { computed } from 'vue'
import { sdkVersionLabels } from '../../locales'

declare const __SDK_VERSION__: string
declare const __SDK_SOURCE__: string

const props = withDefaults(
  defineProps<{
    locale?: 'en' | 'zh'
  }>(),
  { locale: 'en' },
)

const version = __SDK_VERSION__ ?? ''
const source = __SDK_SOURCE__ ?? 'unknown'

const labels = computed(() => sdkVersionLabels[props.locale])
</script>

<template>
  <div v-if="version" class="sdk-badge">
    <span class="sdk-badge__label">{{ labels.label }}</span>
    <span class="sdk-badge__pkg">@appzgatenz/label-print-topbridge-js</span>
    <span class="sdk-badge__version">v{{ version }}</span>
    <template v-if="source !== 'unknown'">
      <span class="sdk-badge__dot"></span>
      <span class="sdk-badge__source">{{ source }}</span>
    </template>
  </div>
</template>

<style scoped>
.sdk-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--tb-font-display, inherit);
  font-size: 12px;
  line-height: 1;
  color: var(--vp-c-text-2);
}

.sdk-badge__label {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.sdk-badge__pkg {
  color: var(--vp-c-text-3);
}

.sdk-badge__version {
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.sdk-badge__dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--vp-c-divider);
}

.sdk-badge__source {
  color: var(--vp-c-text-3);
}

@media (max-width: 639px) {
  .sdk-badge__pkg {
    display: none;
  }
}
</style>
