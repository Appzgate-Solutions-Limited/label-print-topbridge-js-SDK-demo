<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useReducedMotion } from '../composables/useReducedMotion'
import { useSdkType } from '../composables/useSdkType'
import AnimatedBackground from './AnimatedBackground.vue'
import FeatureGrid from './FeatureGrid.vue'
import HeroSection from './HeroSection.vue'

const props = defineProps<{
  lang?: 'en' | 'zh'
}>()

const prefersReducedMotion = useReducedMotion()
const isLoaded = ref(false)
const { sdkType } = useSdkType()

const locale = props.lang || 'en'

onMounted(() => {
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})
</script>

<template>
  <div
    class="tb-home"
    :class="{
      'tb-loaded': isLoaded,
      'tb-reduced-motion': prefersReducedMotion,
    }"
  >
    <AnimatedBackground />
    <HeroSection :locale="locale" :sdk-type="sdkType" />
    <FeatureGrid v-if="sdkType === 'js-core'" :locale="locale" />
    <section v-if="sdkType === 'js-core'" class="tb-roadmap">
      <h2 class="tb-roadmap-title">{{ locale === 'zh' ? '路线图' : 'Roadmap' }}</h2>
      <div class="tb-roadmap-cards">
        <div class="tb-roadmap-card">
          <span class="tb-roadmap-badge">{{ locale === 'zh' ? '即将支持' : 'Coming Soon' }}</span>
          <span class="tb-roadmap-name">Next.js</span>
        </div>
        <div class="tb-roadmap-card">
          <span class="tb-roadmap-badge">{{ locale === 'zh' ? '即将支持' : 'Coming Soon' }}</span>
          <span class="tb-roadmap-name">React</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.tb-home {
  position: relative;
  background: linear-gradient(
    135deg,
    var(--tb-hero-gradient-start) 0%,
    var(--tb-hero-gradient-end) 100%
  );
  min-height: 100vh;
  overflow: hidden;
}

.tb-home::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 160px;
  background: linear-gradient(to top, var(--tb-bg-secondary), transparent);
  pointer-events: none;
  z-index: 0;
}

.tb-roadmap {
  position: relative;
  z-index: 1;
  max-width: 880px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.tb-roadmap-title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24px;
  color: var(--vp-c-text-1);
}

.tb-roadmap-cards {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.tb-roadmap-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 40px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  opacity: 0.7;
}

.tb-roadmap-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.tb-roadmap-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
</style>
