<script setup lang="ts">
import { useSdkType } from '../composables/useSdkType'
import type { SdkType } from '../composables/useSdkType'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  locale: 'en' | 'zh'
}>()

const sdkType = useSdkType()
const open = ref(false)

const labels = {
  en: {
    'js-core': 'JS Core',
    nextjs: 'Next.js',
    react: 'React',
  },
  zh: {
    'js-core': 'JS Core',
    nextjs: 'Next.js',
    react: 'React',
  },
}

const options: { value: SdkType; badge?: string }[] = [
  { value: 'js-core' },
  { value: 'nextjs', badge: props.locale === 'zh' ? '即将支持' : 'Soon' },
  { value: 'react', badge: props.locale === 'zh' ? '即将支持' : 'Soon' },
]

const currentLabel = computed(() => labels[props.locale][sdkType.value])

function isActive(t: SdkType) {
  return sdkType.value === t
}

function switchTo(t: SdkType) {
  sdkType.value = t
  document.documentElement.dataset.sdk = t
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function onDocClick(e: MouseEvent) {
  const el = e.target as HTMLElement
  if (!el.closest('.sdk-switcher')) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})
</script>

<template>
  <div class="sdk-switcher">
    <button
      class="sdk-switcher-trigger"
      :class="{ 'sdk-switcher-trigger--active': open }"
      @click.stop="toggle"
    >
      <span class="sdk-switcher-trigger-label">{{ currentLabel }}</span>
      <svg
        class="sdk-switcher-trigger-icon"
        :class="{ 'sdk-switcher-trigger-icon--open': open }"
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <Transition name="sdk-dropdown">
      <div v-show="open" class="sdk-switcher-dropdown">
        <button
          v-for="opt in options"
          :key="opt.value"
          class="sdk-switcher-item"
          :class="{ 'sdk-switcher-item--active': isActive(opt.value) }"
          @click="switchTo(opt.value)"
        >
          <span class="sdk-switcher-item-text">{{ labels[locale][opt.value] }}</span>
          <span v-if="opt.badge" class="sdk-switcher-badge">{{ opt.badge }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.sdk-switcher {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  z-index: 100;
}

.sdk-switcher-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--tb-font-display, inherit);
  line-height: 22px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
  white-space: nowrap;
}

.sdk-switcher-trigger:hover {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.sdk-switcher-trigger--active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.sdk-switcher-trigger-icon {
  transition: transform 0.2s;
  flex-shrink: 0;
}

.sdk-switcher-trigger-icon--open {
  transform: rotate(180deg);
}

.sdk-switcher-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  z-index: 9999;
}

.sdk-switcher-item {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--tb-font-display, inherit);
  line-height: 22px;
  color: var(--vp-c-text-1);
  background: transparent;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
  white-space: nowrap;
  text-align: left;
}

.sdk-switcher-item:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
}

.sdk-switcher-item--active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.sdk-switcher-item--active:hover {
  background: var(--vp-c-brand-soft);
}

.sdk-switcher-badge {
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

/* Dropdown transition */
.sdk-dropdown-enter-active,
.sdk-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.sdk-dropdown-enter-from,
.sdk-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 640px) {
  .sdk-switcher {
    margin-left: 0;
  }
}
</style>
