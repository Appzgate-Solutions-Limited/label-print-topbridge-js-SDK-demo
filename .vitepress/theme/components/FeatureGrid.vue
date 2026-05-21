<script setup lang="ts">
import { ref } from 'vue'
import FeatureCard from './FeatureCard.vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { features } from '../locales'

defineProps<{
  locale: 'en' | 'zh'
}>()

const gridRef = ref<HTMLElement | null>(null)
useScrollReveal(gridRef)
</script>

<template>
  <section class="tb-features" :aria-label="locale === 'zh' ? '核心特性' : 'Features'">
    <div ref="gridRef" class="tb-features-grid">
      <div
        v-for="(f, i) in features[locale]"
        :key="f.icon"
        class="tb-reveal-item"
        :style="{ transitionDelay: `${i * 80}ms` }"
      >
        <FeatureCard :icon="f.icon" :title="f.title" :desc="f.desc" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.tb-features {
  position: relative;
  padding: 64px 24px 120px;
  max-width: 1100px;
  margin: 0 auto;
}

.tb-features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .tb-features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (min-width: 960px) {
  .tb-features-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

.tb-reveal-item {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.tb-reveal-item.tb-revealed {
  opacity: 1;
  transform: translateY(0);
}
</style>
