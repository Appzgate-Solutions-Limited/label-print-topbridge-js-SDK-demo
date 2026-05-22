<script setup lang="ts">
import type {
  PlaygroundPrinter,
  PlaygroundSchemaField,
  PlaygroundTemplateItem,
} from '../../composables/usePlayground'
import AdvancedForm from './forms/AdvancedForm.vue'
import BasicForm from './forms/BasicForm.vue'
import ErrorHandlingForm from './forms/ErrorHandlingForm.vue'
import MultiProductForm from './forms/MultiProductForm.vue'
import TemplateSchemaForm from './forms/TemplateSchemaForm.vue'

defineProps<{
  template: string
  isLoading: boolean
  printers: PlaygroundPrinter[]
  templates: PlaygroundTemplateItem[]
  schemaFields: PlaygroundSchemaField[]
  preflightDone: boolean
}>()

defineEmits<{
  preflight: []
  'health-check': []
  print: [params: any]
  'fetch-templates': []
  'query-schema': [templateCode: string]
  'error-test': [type: string]
}>()

const PREFLIGHT_TEMPLATES = ['basic', 'multi-product', 'preflight-only', 'advanced-form']
</script>

<template>
  <div class="pg-form">
    <div v-if="PREFLIGHT_TEMPLATES.includes(template)" class="pg-form-section">
      <div class="pg-form-title">1. Preflight</div>
      <div class="pg-form-row">
        <button class="pg-btn pg-btn-primary" :disabled="isLoading" @click="$emit('preflight')">
          {{ isLoading ? 'Checking...' : 'Run Preflight' }}
        </button>
        <button v-if="template === 'preflight-only'" class="pg-btn" :disabled="isLoading" @click="$emit('health-check')">
          Health Check Only
        </button>
      </div>
    </div>

    <BasicForm
      v-if="template === 'basic' && preflightDone"
      :is-loading="isLoading"
      :templates="templates"
      :printers="printers"
      @print="$emit('print', $event)"
    />

    <MultiProductForm
      v-if="template === 'multi-product' && preflightDone"
      :is-loading="isLoading"
      :templates="templates"
      :printers="printers"
      @print="$emit('print', $event)"
    />

    <ErrorHandlingForm
      v-if="template === 'error-handling'"
      :is-loading="isLoading"
      @error-test="$emit('error-test', $event)"
    />

    <TemplateSchemaForm
      v-if="template === 'template-schema'"
      :is-loading="isLoading"
      :templates="templates"
      @fetch-templates="$emit('fetch-templates')"
      @query-schema="$emit('query-schema', $event)"
    />

    <AdvancedForm
      v-if="template === 'advanced-form' && preflightDone"
      :is-loading="isLoading"
      :templates="templates"
      :printers="printers"
      :schema-fields="schemaFields"
      @print="$emit('print', $event)"
      @query-schema="$emit('query-schema', $event)"
    />
  </div>
</template>

<style scoped>
.pg-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
