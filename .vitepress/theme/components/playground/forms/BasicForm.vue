<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PlaygroundPrinter, PlaygroundTemplateItem } from '../../../composables/usePlayground'

const props = defineProps<{
  isLoading: boolean
  templates: PlaygroundTemplateItem[]
  printers: PlaygroundPrinter[]
}>()

const emit = defineEmits<{
  print: [params: any]
}>()

const selectedTemplate = ref('PRICE_LABEL')
const selectedPrinter = ref('')
const productName = ref('Test Product')
const productPrice = ref('3.99')
const productCurrency = ref('$')
const productUnit = ref('/kg')
const productCopies = ref('1')

watch(
  () => props.templates,
  (t) => {
    const firstTemplate = t[0]?.code || t[0]?.id || ''
    const hasSelectedTemplate = t.some((x) => (x.code || x.id) === selectedTemplate.value)
    if (firstTemplate && (!selectedTemplate.value || !hasSelectedTemplate)) {
      selectedTemplate.value = firstTemplate
    }
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

function emitPrint() {
  emit('print', {
    template: selectedTemplate.value.trim(),
    printer: selectedPrinter.value.trim(),
    products: [
      {
        name: productName.value,
        price: parseFloat(productPrice.value),
        currency: productCurrency.value,
        unit: productUnit.value,
        copies: Number.parseInt(productCopies.value, 10) || 1,
      },
    ],
  })
}
</script>

<template>
  <div class="pg-form-section">
    <div class="pg-form-title">2. Print Settings</div>
    <div class="pg-form-row">
      <label>Template</label>
      <select v-model="selectedTemplate">
        <option v-if="!templates.length" :value="selectedTemplate">{{ selectedTemplate }}</option>
        <option v-for="t in templates" :key="t.code || t.id" :value="t.code || t.id">
          {{ t.name }}
        </option>
      </select>
    </div>
    <div class="pg-form-row">
      <label>Printer</label>
      <select v-model="selectedPrinter">
        <option value="" disabled>-- select printer --</option>
        <option v-for="p in printers" :key="p.name" :value="p.name">
          {{ p.name }}{{ p.isDefault ? ' (default)' : '' }}
        </option>
      </select>
    </div>
    <div class="pg-form-row">
      <label>Name</label>
      <input v-model="productName" type="text">
    </div>
    <div class="pg-form-row">
      <label>Price</label>
      <input v-model="productPrice" type="number" step="0.01">
    </div>
    <div class="pg-form-row">
      <label>Currency</label>
      <input v-model="productCurrency" type="text" style="width:50px">
      <label>Unit</label>
      <input v-model="productUnit" type="text" style="width:60px">
    </div>
    <div class="pg-form-row">
      <label>Copies</label>
      <input v-model="productCopies" type="number" min="1" max="9999">
    </div>
    <div class="pg-form-row">
      <button
        class="pg-btn pg-btn-primary"
        :disabled="isLoading || !selectedTemplate.trim() || !selectedPrinter.trim()"
        @click="emitPrint"
      >
        {{ isLoading ? 'Printing...' : 'Print' }}
      </button>
    </div>
  </div>
</template>
