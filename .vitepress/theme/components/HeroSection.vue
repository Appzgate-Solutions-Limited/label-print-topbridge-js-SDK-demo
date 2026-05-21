<script setup lang="ts">
import { VPLink } from 'vitepress/theme'
import { computed } from 'vue'
import InstallCommand from './InstallCommand.vue'
import type { SdkType } from '../composables/useSdkType'
import { switchToCore } from '../composables/useSdkType'
import { heroMeta } from '../locales'

const props = defineProps<{
  locale: 'en' | 'zh'
  sdkType: SdkType
}>()

const meta = computed(() => heroMeta[props.sdkType][props.locale])
</script>

<template>
  <section class="tb-hero" aria-label="Hero">
    <div class="tb-hero-inner">
      <div class="tb-hero-logo tb-animate">
        <img
          src="/logo.png"
          alt="TopBridge Logo"
          width="429"
          height="236"
          loading="eager"
        />
      </div>

      <h1 class="tb-hero-title tb-animate">{{ meta.title }}</h1>

      <p class="tb-hero-subtitle tb-animate">{{ meta.subtitle }}</p>

      <InstallCommand
        v-if="meta.installCmd"
        class="tb-animate"
        :command="meta.installCmd"
        :locale="locale"
      />

      <!-- JS Core: three CTA buttons -->
      <div v-if="sdkType === 'js-core'" class="tb-hero-actions tb-animate">
        <VPLink :href="meta.cta1Link!" class="tb-btn tb-btn--primary">
          {{ meta.cta1 }}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tb-btn-arrow"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </VPLink>
        <VPLink
          :href="meta.cta2Link!"
          target="_blank"
          rel="noopener noreferrer"
          no-icon
          class="tb-btn tb-btn--outline"
        >
          {{ meta.cta2 }}
        </VPLink>
        <VPLink :href="meta.cta3Link!" class="tb-btn tb-btn--text">
          {{ meta.cta3 }}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tb-btn-arrow"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </VPLink>
        <VPLink
          v-if="meta.cta4"
          :href="meta.cta4Link!"
          target="_blank"
          rel="noopener noreferrer"
          no-icon
          class="tb-btn tb-btn--text"
        >
          {{ meta.cta4 }}
        </VPLink>
      </div>

      <!-- Next.js / React: single back button -->
      <div v-else class="tb-hero-actions tb-animate">
        <button class="tb-btn tb-btn--outline" @click="switchToCore">
          {{ meta.cta1 }}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tb-btn-arrow"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
      </div>
    </div>

    <div v-if="sdkType === 'js-core'" class="tb-scroll-indicator" aria-hidden="true">
      <div class="tb-scroll-dot"></div>
    </div>
  </section>
</template>

<style scoped>
.tb-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 64px 24px 48px;
  text-align: center;
}

.tb-hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.tb-hero-logo {
  margin-bottom: 12px;
}

.tb-hero-logo img {
  height: 80px;
  width: auto;
}

.tb-hero-title {
  font-family: var(--tb-font-display);
  font-size: 32px;
  font-weight: 700;
  line-height: 1.15;
  color: var(--tb-text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.tb-hero-subtitle {
  font-family: var(--tb-font-display);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--tb-text-secondary);
  margin: 0;
  max-width: 480px;
}

.tb-hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

/* Buttons */
.tb-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--tb-font-display);
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.tb-btn:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.tb-btn--primary {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border-color: var(--vp-c-brand-1);
}

.tb-btn--primary:hover {
  background: var(--vp-c-brand-2);
  transform: scale(1.02);
}

.tb-btn--primary:active {
  transform: scale(0.98);
}

.tb-btn--outline {
  background: transparent;
  color: var(--vp-c-brand-1);
  border-color: var(--tb-border);
}

.tb-btn--outline:hover {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-brand-soft);
}

.tb-btn--text {
  background: transparent;
  color: var(--tb-text-secondary);
  padding: 10px 12px;
}

.tb-btn--text:hover {
  color: var(--vp-c-brand-1);
}

.tb-btn-arrow {
  transition: transform 0.2s ease;
}

.tb-btn:hover .tb-btn-arrow {
  transform: translateX(2px);
}

/* Scroll indicator */
.tb-scroll-indicator {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.tb-scroll-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--tb-text-tertiary);
  animation: tb-scroll-bounce 3s ease-in-out infinite;
}

/* Stagger animation delays for hero children */
.tb-loaded .tb-hero-logo { animation: tb-fade-up 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.20s forwards; }
.tb-loaded .tb-hero-title { animation: tb-fade-up 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.55s forwards; }
.tb-loaded .tb-hero-subtitle { animation: tb-fade-up 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.90s forwards; }
.tb-loaded .tb-hero .tb-install { animation: tb-fade-up 1.5s cubic-bezier(0.4, 0, 0.2, 1) 1.25s forwards; }
.tb-loaded .tb-hero-actions { animation: tb-fade-up 1.5s cubic-bezier(0.4, 0, 0.2, 1) 1.50s forwards; }

/* Responsive */
@media (min-width: 640px) {
  .tb-hero-logo img { height: 100px; }
  .tb-hero-title { font-size: 42px; }
  .tb-hero-subtitle { font-size: 18px; }
}

@media (min-width: 960px) {
  .tb-hero-logo img { height: 120px; }
  .tb-hero-title { font-size: 52px; }
  .tb-hero-subtitle { font-size: 20px; max-width: 560px; }
  .tb-hero { padding: 64px 48px 48px; }
}
</style>
