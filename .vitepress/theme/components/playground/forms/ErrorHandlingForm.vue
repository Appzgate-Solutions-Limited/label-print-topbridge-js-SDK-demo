<script setup lang="ts">
defineProps<{
  isLoading: boolean
}>()

defineEmits<{
  'error-test': [type: string]
}>()
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
      <button class="pg-btn pg-btn-sm" :disabled="isLoading" @click="$emit('error-test', 'simulate-connection')">ConnectionError</button>
      <button class="pg-btn pg-btn-sm" :disabled="isLoading" @click="$emit('error-test', 'simulate-auth-not-authenticated')">AuthError (Auth)</button>
      <button class="pg-btn pg-btn-sm" :disabled="isLoading" @click="$emit('error-test', 'simulate-auth-update-required')">AuthError (Update)</button>
      <button class="pg-btn pg-btn-sm" :disabled="isLoading" @click="$emit('error-test', 'simulate-quota')">QuotaError</button>
      <button class="pg-btn pg-btn-sm" :disabled="isLoading" @click="$emit('error-test', 'simulate-printer')">PrinterError</button>
      <button class="pg-btn pg-btn-sm" :disabled="isLoading" @click="$emit('error-test', 'simulate-template')">TemplateError</button>
      <button class="pg-btn pg-btn-sm" :disabled="isLoading" @click="$emit('error-test', 'simulate-network')">NetworkError</button>
      <button class="pg-btn pg-btn-sm" :disabled="isLoading" @click="$emit('error-test', 'simulate-source')">SourceError</button>
      <button class="pg-btn pg-btn-sm" :disabled="isLoading" @click="$emit('error-test', 'simulate-config')">ConfigError</button>
      <button class="pg-btn pg-btn-sm" :disabled="isLoading" @click="$emit('error-test', 'simulate-print')">PrintError</button>
      <button class="pg-btn pg-btn-sm" :disabled="isLoading" @click="$emit('error-test', 'simulate-validation')">ValidationError</button>
    </div>
  </div>
</template>

<style scoped src="./form-styles.css"></style>
