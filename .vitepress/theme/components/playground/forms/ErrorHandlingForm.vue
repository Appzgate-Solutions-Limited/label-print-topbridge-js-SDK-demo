<script setup lang="ts">
import { ERROR_SIMULATIONS } from '../../../composables/useErrorDemo'

defineProps<{
  isLoading: boolean
}>()

defineEmits<{
  'error-test': [type: string]
}>()

const visibleSimulations = ERROR_SIMULATIONS.filter((s) => !s.hidden)
</script>

<template>
  <div class="pg-form-section">
    <div class="pg-form-title">Real Error Triggers</div>
    <div class="pg-form-row">
      <button class="pg-btn pg-btn-primary" :disabled="isLoading" @click="$emit('error-test', 'preflight')">
        Run Preflight (with error handling)
      </button>
    </div>
    <div class="pg-form-row">
      <button class="pg-btn" :disabled="isLoading" @click="$emit('error-test', 'validation')">
        Empty Product List (ValidationError)
      </button>
    </div>
  </div>
  <div class="pg-form-section">
    <div class="pg-form-title">Simulate Errors (instanceof narrowing demo)</div>
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
