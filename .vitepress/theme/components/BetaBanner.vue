<script setup lang="ts">
import { computed, ref } from 'vue'
import { betaBannerLabels } from '../locales'

const props = withDefaults(
  defineProps<{
    locale?: 'en' | 'zh'
  }>(),
  { locale: 'en' },
)

const version = __SDK_VERSION__ ?? ''
const source = __SDK_SOURCE__ ?? 'unknown'
const dismissed = ref(false)

const isBeta = computed(() => /beta|alpha|rc/i.test(version))
const visible = computed(() => isBeta.value && !dismissed.value)
const labels = computed(() => betaBannerLabels[props.locale])

const message = computed(() =>
  labels.value.message
    .replace('{version}', version)
    .replace('{source}', source === 'unknown' ? labels.value.sourceFallback : source),
)

function dismiss() {
  dismissed.value = true
}
</script>

<template>
  <div v-if="visible" class="beta-banner" role="status">
    <p class="beta-banner__text">{{ message }}</p>
    <button type="button" class="beta-banner__close" :aria-label="labels.dismiss" @click="dismiss">
      ×
    </button>
  </div>
</template>

<style scoped>
.beta-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: var(--vp-c-warning-soft, #fff7ed);
  border-bottom: 1px solid var(--vp-c-warning-1, #fb923c);
  color: var(--vp-c-text-1);
  font-size: 13px;
  line-height: 1.45;
}

.beta-banner__text {
  flex: 1;
  margin: 0;
}

.beta-banner__close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.beta-banner__close:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

@media (max-width: 639px) {
  .beta-banner {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>
