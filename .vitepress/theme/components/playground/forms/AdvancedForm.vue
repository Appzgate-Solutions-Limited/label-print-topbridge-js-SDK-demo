<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type {
  PlaygroundPrinter,
  PlaygroundSchemaField,
  PlaygroundTemplateItem,
} from '../../composables/usePlayground'

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

const selectedTemplate = ref('')
const selectedPrinter = ref('')
const schemaFormData = ref<
  Record<string, string | number | { value: string | number; currency?: string; unit?: string }>
>({})
const visibleSchemaFields = computed(() => props.schemaFields)

watch(
  () => props.templates,
  (t) => {
    if (!selectedTemplate.value) selectedTemplate.value = t[0]?.code || t[0]?.id || ''
  },
  { immediate: true },
)

watch(
  () => props.printers,
  (p) => {
    if (!selectedPrinter.value)
      selectedPrinter.value = p.find((x) => x.isDefault)?.name || p[0]?.name || ''
  },
  { immediate: true },
)

watch(
  () => props.schemaFields,
  (fields) => {
    schemaFormData.value = Object.fromEntries(
      fields.filter((f) => f.type !== 'line').map((f) => [f.name, defaultValueForField(f)]),
    )
  },
  { immediate: true },
)

function updateSchemaField(name: string, value: any) {
  schemaFormData.value = { ...schemaFormData.value, [name]: value }
}

function emitPrint() {
  emit('print', {
    template: selectedTemplate.value,
    printer: selectedPrinter.value,
    rawProducts: [schemaFormData.value],
  })
}

function defaultValueForField(field: PlaygroundSchemaField) {
  if (field.type === 'price') {
    return { value: toNumberOrFallback(field.default, 1.99), currency: '$', unit: '/ea' }
  }
  if (field.type === 'weight') {
    return { value: toNumberOrFallback(field.default, 0.5), unit: 'kg' }
  }
  if (field.type === 'integer') {
    return toNumberOrFallback(field.default, field.name === 'copies' ? 1 : 0)
  }
  return typeof field.default === 'string'
    ? field.default
    : field.name === 'name'
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
  if (selectedTemplate.value) emit('query-schema', selectedTemplate.value)
}
</script>

<template>
  <div class="pg-form-section">
    <div class="pg-form-title">2. Template & Printer</div>
    <div class="pg-form-row">
      <label>Template</label>
      <select v-model="selectedTemplate" @change="querySchema">
        <option value="" disabled>-- select --</option>
        <option v-for="t in templates" :key="t.code || t.id" :value="t.code || t.id">{{ t.name }}</option>
      </select>
    </div>
    <div class="pg-form-row">
      <label>Printer</label>
      <select v-model="selectedPrinter">
        <option value="" disabled>-- select --</option>
        <option v-for="p in printers" :key="p.name" :value="p.name">{{ p.name }}{{ p.isDefault ? ' (default)' : '' }}</option>
      </select>
    </div>
  </div>
  <div v-if="visibleSchemaFields.length" class="pg-form-section">
    <div class="pg-form-title">3. Dynamic Form</div>
    <template v-for="field in visibleSchemaFields" :key="field.name">
      <div v-if="field.type !== 'line'" class="pg-form-row">
        <label>{{ field.name }}<span v-if="field.required" class="pg-required">*</span></label>
        <template v-if="field.type === 'price'">
          <input type="number" step="0.01" placeholder="value" :value="schemaFormData[field.name]?.value ?? 1.99"
            @input="updateSchemaField(field.name, { ...schemaFormData[field.name], value: parseNumberInput(($event.target as HTMLInputElement).value) })">
          <input type="text" placeholder="$" style="width:40px" :value="schemaFormData[field.name]?.currency ?? '$'"
            @input="updateSchemaField(field.name, { ...schemaFormData[field.name], currency: ($event.target as HTMLInputElement).value })">
          <input type="text" placeholder="unit" style="width:60px" :value="schemaFormData[field.name]?.unit ?? '/ea'"
            @input="updateSchemaField(field.name, { ...schemaFormData[field.name], unit: ($event.target as HTMLInputElement).value })">
        </template>
        <template v-else-if="field.type === 'weight'">
          <input type="number" step="0.01" placeholder="value" :value="schemaFormData[field.name]?.value ?? 0.5"
            @input="updateSchemaField(field.name, { ...schemaFormData[field.name], value: parseNumberInput(($event.target as HTMLInputElement).value) })">
          <input type="text" placeholder="unit" style="width:60px" :value="schemaFormData[field.name]?.unit ?? 'kg'"
            @input="updateSchemaField(field.name, { ...schemaFormData[field.name], unit: ($event.target as HTMLInputElement).value })">
        </template>
        <template v-else-if="field.type === 'integer'">
          <input type="number" :min="field.name === 'copies' ? 1 : undefined" :max="field.name === 'copies' ? 9999 : undefined"
            :value="schemaFormData[field.name] ?? field.default ?? (field.name === 'copies' ? 1 : '')"
            @input="updateSchemaField(field.name, parseIntegerInput(($event.target as HTMLInputElement).value, field.name))">
        </template>
        <template v-else>
          <input type="text" :value="schemaFormData[field.name] ?? (field.name === 'name' ? 'Test Product' : '')"
            @input="updateSchemaField(field.name, ($event.target as HTMLInputElement).value)">
        </template>
        <span class="pg-field-type">{{ field.type }}</span>
      </div>
    </template>
    <div class="pg-form-row" style="margin-top:8px">
      <button class="pg-btn pg-btn-primary" :disabled="isLoading || !selectedTemplate || !selectedPrinter" @click="emitPrint">
        {{ isLoading ? 'Printing...' : 'Print' }}
      </button>
    </div>
  </div>
</template>

<style scoped src="./form-styles.css"></style>
