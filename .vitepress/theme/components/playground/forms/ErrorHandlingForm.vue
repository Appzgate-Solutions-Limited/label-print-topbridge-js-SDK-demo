<script setup lang="ts">
defineProps<{
  isLoading: boolean
}>()

defineEmits<{
  'error-test': [type: string]
}>()

const SIMULATIONS: { type: string; label: string }[] = [
  { type: 'simulate-connection', label: 'ConnectionError' },
  { type: 'simulate-auth-not-authenticated', label: 'AuthError (Auth)' },
  { type: 'simulate-auth-update-required', label: 'AuthError (Update)' },
  { type: 'simulate-quota', label: 'QuotaError' },
  { type: 'simulate-printer', label: 'PrinterError' },
  { type: 'simulate-template', label: 'TemplateError' },
  { type: 'simulate-network', label: 'NetworkError' },
  { type: 'simulate-source', label: 'SourceError' },
  { type: 'simulate-config', label: 'ConfigError' },
  { type: 'simulate-print', label: 'PrintError' },
  { type: 'simulate-validation', label: 'ValidationError' },
]
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
        v-for="sim in SIMULATIONS"
        :key="sim.type"
        class="pg-btn pg-btn-sm"
        :disabled="isLoading"
        @click="$emit('error-test', sim.type)"
      >
        {{ sim.label }}
      </button>
    </div>
  </div>
</template>
