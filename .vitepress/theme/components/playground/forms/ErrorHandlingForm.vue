<script setup lang="ts">
import { computed } from 'vue'
import { ERROR_SIMULATIONS } from '../../../composables/useErrorDemo'
import { useLocale } from '../../../composables/useLocale'
import { playgroundLabels } from '../../../locales'

defineProps<{
  isLoading: boolean
}>()

defineEmits<{
  'error-test': [type: string]
}>()

const locale = useLocale()
const labels = computed(() => playgroundLabels[locale.value])

const visibleSimulations = ERROR_SIMULATIONS.filter((s) => !s.hidden)
</script>

<template>
  <div class="pg-form-section">
    <div class="pg-form-title">{{ labels.realErrorTriggers }}</div>
    <div class="pg-form-row">
      <button class="pg-btn pg-btn-primary" :disabled="isLoading" @click="$emit('error-test', 'preflight')">
        {{ labels.runPreflightError }}
      </button>
    </div>
    <div class="pg-form-row">
      <button class="pg-btn" :disabled="isLoading" @click="$emit('error-test', 'validation')">
        {{ labels.emptyProductError }}
      </button>
    </div>
  </div>
  <div class="pg-form-section">
    <div class="pg-form-title">{{ labels.simulateErrors }}</div>
    <div class="pg-form-row" style="flex-wrap: wrap;">
      <button
        v-for="sim in visibleSimulations"
        :key="sim.key"
        class="pg-btn pg-btn-sm"
        :disabled="isLoading"
        @click="$emit('error-test', `simulate-${sim.key}`)"
      >
        {{ sim.label }}
      </button>
    </div>
  </div>
</template>
