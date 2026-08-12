<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import type {
  PlaygroundPrinter,
  PlaygroundSchemaField,
  PlaygroundTemplateItem,
} from '../../composables/usePlayground'
import { playgroundFormLabels } from '../../locales'
import AdvancedForm from './forms/AdvancedForm.vue'
import ErrorHandlingForm from './forms/ErrorHandlingForm.vue'
import ProductForm from './forms/ProductForm.vue'
import TemplateSchemaForm from './forms/TemplateSchemaForm.vue'

const { lang } = useData()
const locale = computed(() => (lang.value === 'zh-CN' ? ('zh' as const) : ('en' as const)))
const labels = computed(() => playgroundFormLabels[locale.value])

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

    <ProductForm
      v-if="template === 'basic'"
      :is-loading="isLoading"
      :templates="templates"
      :printers="printers"
      @print="$emit('print', $event)"
    />

    <ProductForm
      v-else-if="template === 'multi-product'"
      :multi="true"
      :is-loading="isLoading"
      :templates="templates"
      :printers="printers"
      @print="$emit('print', $event)"
    />

    <ErrorHandlingForm
      v-else-if="template === 'error-handling'"
      :is-loading="isLoading"
      @error-test="$emit('error-test', $event)"
    />

    <TemplateSchemaForm
      v-else-if="template === 'template-schema'"
      :is-loading="isLoading"
      :templates="templates"
      @fetch-templates="$emit('fetch-templates')"
      @query-schema="$emit('query-schema', $event)"
    />

    <AdvancedForm
      v-else-if="template === 'advanced-form'"
      :is-loading="isLoading"
      :templates="templates"
      :printers="printers"
      :schema-fields="schemaFields"
      @print="$emit('print', $event)"
      @query-schema="$emit('query-schema', $event)"
    />

    <div v-else class="pg-form-section" style="color: var(--vp-text-2)">
      <p>
        {{ labels.codeDrivenPrefix }}<strong>{{ labels.advancedMode }}</strong>{{ labels.codeDrivenSuffix }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.pg-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
