<script setup lang="ts">
import type { SdkType } from '../composables/useSdkType'
import { switchToCore } from '../composables/useSdkType'
import { sdkNames, comingSoon } from '../locales'
import { computed } from 'vue'

const props = defineProps<{
  sdkType: SdkType
  locale: 'en' | 'zh'
}>()

const i18n = computed(() => {
  const l = comingSoon[props.locale]
  const name = sdkNames[props.sdkType]
  return {
    title: `${name} SDK`,
    badge: l.badge,
    desc: l.descTemplate.replace('{sdk}', name),
    cta: l.cta,
  }
})
</script>

<template>
  <div class="coming-soon">
    <div class="coming-soon-inner">
      <div class="coming-soon-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <h2 class="coming-soon-title">{{ i18n[locale].title }}</h2>
      <span class="coming-soon-badge">{{ i18n[locale].badge }}</span>
      <p class="coming-soon-desc">{{ i18n[locale].desc }}</p>
      <button class="coming-soon-cta" @click="switchToCore">
        {{ i18n[locale].cta }}
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.coming-soon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.coming-soon-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 420px;
}

.coming-soon-icon {
  color: var(--tb-text-tertiary);
  opacity: 0.6;
}

.coming-soon-title {
  font-family: var(--tb-font-display, inherit);
  font-size: 24px;
  font-weight: 700;
  color: var(--tb-text-primary);
  margin: 0;
}

.coming-soon-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.coming-soon-desc {
  font-size: 15px;
  line-height: 1.6;
  color: var(--tb-text-secondary);
  margin: 0;
}

.coming-soon-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 10px 20px;
  border: 1px solid var(--tb-border);
  border-radius: 8px;
  background: var(--tb-bg-card);
  color: var(--vp-c-brand-1);
  font-family: var(--tb-font-display, inherit);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.coming-soon-cta:hover {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-brand-soft);
}
</style>
