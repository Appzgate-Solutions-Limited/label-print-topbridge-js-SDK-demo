<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLocale } from '../../../composables/useLocale'
import type {
  PlaygroundPrinter,
  PlaygroundSchemaField,
  PlaygroundTemplateItem,
} from '../../../composables/usePlayground'
import { useTemplatePrinterSelection } from '../../../composables/useTemplatePrinterSelection'
import { playgroundLabels } from '../../../locales'

const props = defineProps<{
  isLoading: boolean
  templates: PlaygroundTemplateItem[]
  printers: PlaygroundPrinter[]
  schemaFields: PlaygroundSchemaField[]
}>()

const emit = defineEmits<{
  print: [params: any]
  'query-schema': [templateCode: string]
}>()

const { selectedTemplate, selectedPrinter } = useTemplatePrinterSelection(
  () => props.templates,
  () => props.printers,
)
const locale = useLocale()
const labels = computed(() => playgroundLabels[locale.value])
const schemaFormData = ref<
  Record<string, string | number | { value: string | number; currency?: string; unit?: string }>
>({})

watch(
  () => props.schemaFields,
  (fields) => {
    schemaFormData.value = Object.fromEntries(
      fields
        .filter((f) => f.fieldType !== 'line')
        .map((f) => [f.dataField, defaultValueForField(f)]),
    )
  },
  { immediate: true },
)

function updateSchemaField(name: string, value: any) {
  schemaFormData.value = { ...schemaFormData.value, [name]: value }
}

function emitPrint() {
  emit('print', {
    template: selectedTemplate.value.trim(),
    printer: selectedPrinter.value.trim(),
    products: [schemaFormData.value],
  })
}

function defaultValueForField(field: PlaygroundSchemaField) {
  if (field.fieldType === 'price') {
    return { value: toNumberOrFallback(field.default, 1.99), currency: '$', unit: '/ea' }
  }
  if (field.fieldType === 'weight') {
    return { value: toNumberOrFallback(field.default, 0.5), unit: 'kg' }
  }
  if (field.fieldType === 'integer') {
    return toNumberOrFallback(field.default, field.dataField === 'copies' ? 1 : 0)
  }
  return typeof field.default === 'string'
    ? field.default
    : field.dataField === 'name'
      ? 'Test Product'
      : ''
}

function toNumberOrFallback(value: unknown, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseNumberInput(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : ''
}

function parseIntegerInput(value: string, name: string) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return name === 'copies' ? 1 : ''
  return parsed
}

function querySchema() {
  const templateCode = selectedTemplate.value.trim()
  if (templateCode) emit('query-schema', templateCode)
}
</script>

<template>
  <div class="pg-form-section">
    <div class="pg-form-title">{{ labels.templatePrinter }}</div>
    <div class="pg-form-row">
      <label for="pg-af-template">{{ labels.template }}</label>
      <select id="pg-af-template" v-model="selectedTemplate">
        <option v-if="!templates.length" :value="selectedTemplate">{{ selectedTemplate }}</option>
        <option v-for="t in templates" :key="t.code || t.id" :value="t.code || t.id">
          {{ t.name }}
        </option>
      </select>
      <button class="pg-btn" :disabled="isLoading || !selectedTemplate.trim()" @click="querySchema">
        {{ labels.querySchema }}
      </button>
    </div>
    <div class="pg-form-row">
      <label for="pg-af-printer">{{ labels.printer }}</label>
      <select id="pg-af-printer" v-model="selectedPrinter">
        <option value="" disabled>{{ labels.selectPrinter }}</option>
        <option v-for="p in printers" :key="p.name" :value="p.name">
          {{ p.name }}{{ p.isDefault ? labels.defaultSuffix : '' }}
        </option>
      </select>
    </div>
  </div>
  <div v-if="schemaFields.length" class="pg-form-section">
    <div class="pg-form-title">{{ labels.dynamicForm }}</div>
    <template v-for="field in schemaFields" :key="field.dataField">
      <div v-if="field.fieldType !== 'line'" class="pg-form-row">
        <label :for="`pg-af-${field.dataField}`">{{ field.dataField }}<span v-if="field.required" class="pg-required">*</span></label>
        <template v-if="field.fieldType === 'price'">
          <input :id="`pg-af-${field.dataField}`" type="number" step="0.01" placeholder="value" :value="schemaFormData[field.dataField]?.value ?? 1.99"
            @input="updateSchemaField(field.dataField, { ...schemaFormData[field.dataField], value: parseNumberInput(($event.target as HTMLInputElement).value) })">
          <input type="text" placeholder="$" style="width:40px" :value="schemaFormData[field.dataField]?.currency ?? '$'"
            @input="updateSchemaField(field.dataField, { ...schemaFormData[field.dataField], currency: ($event.target as HTMLInputElement).value })">
          <input type="text" placeholder="unit" style="width:60px" :value="schemaFormData[field.dataField]?.unit ?? '/ea'"
            @input="updateSchemaField(field.dataField, { ...schemaFormData[field.dataField], unit: ($event.target as HTMLInputElement).value })">
        </template>
        <template v-else-if="field.fieldType === 'weight'">
          <input :id="`pg-af-${field.dataField}`" type="number" step="0.01" placeholder="value" :value="schemaFormData[field.dataField]?.value ?? 0.5"
            @input="updateSchemaField(field.dataField, { ...schemaFormData[field.dataField], value: parseNumberInput(($event.target as HTMLInputElement).value) })">
          <input type="text" placeholder="unit" style="width:60px" :value="schemaFormData[field.dataField]?.unit ?? 'kg'"
            @input="updateSchemaField(field.dataField, { ...schemaFormData[field.dataField], unit: ($event.target as HTMLInputElement).value })">
        </template>
        <template v-else-if="field.fieldType === 'integer'">
          <input :id="`pg-af-${field.dataField}`" type="number" :min="field.dataField === 'copies' ? 1 : undefined" :max="field.dataField === 'copies' ? 9999 : undefined"
            :value="schemaFormData[field.dataField] ?? field.default ?? (field.dataField === 'copies' ? 1 : '')"
            @input="updateSchemaField(field.dataField, parseIntegerInput(($event.target as HTMLInputElement).value, field.dataField))">
        </template>
        <template v-else>
          <input :id="`pg-af-${field.dataField}`" type="text" :value="schemaFormData[field.dataField] ?? (field.dataField === 'name' ? 'Test Product' : '')"
            @input="updateSchemaField(field.dataField, ($event.target as HTMLInputElement).value)">
        </template>
        <span class="pg-field-type">{{ field.fieldType }}</span>
      </div>
    </template>
    <div class="pg-form-row" style="margin-top:8px">
      <button
        class="pg-btn pg-btn-primary"
        :disabled="isLoading || !selectedTemplate.trim() || !selectedPrinter.trim()"
        @click="emitPrint"
      >
        {{ isLoading ? labels.printing : labels.print }}
      </button>
    </div>
  </div>
</template>
