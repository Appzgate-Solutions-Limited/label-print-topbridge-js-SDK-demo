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
const extraProducts = ref([
  { name: 'Banana', price: '1.99', currency: '$', unit: '/lb', copies: '1' },
])

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

function addProduct() {
  extraProducts.value.push({ name: '', price: '0', currency: '$', unit: '', copies: '1' })
}

function removeProduct(index: number) {
  extraProducts.value.splice(index, 1)
}

function emitPrint() {
  const allProducts = [
    {
      name: productName.value,
      price: parseFloat(productPrice.value),
      currency: productCurrency.value,
      unit: productUnit.value,
      copies: Number.parseInt(productCopies.value, 10) || 1,
    },
    ...extraProducts.value
      .filter((p) => p.name)
      .map((p) => ({
        name: p.name,
        price: parseFloat(p.price),
        currency: p.currency,
        unit: p.unit,
        copies: Number.parseInt(p.copies, 10) || 1,
      })),
  ]
  emit('print', {
    template: selectedTemplate.value.trim(),
    printer: selectedPrinter.value.trim(),
    products: allProducts,
  })
}
</script>

<template>
  <div class="pg-form-section">
    <div class="pg-form-title">2. Product List</div>
    <div class="pg-form-row">
      <input v-model="productName" placeholder="Name" style="width:120px">
      <input v-model="productPrice" type="number" step="0.01" placeholder="Price">
      <input v-model="productCurrency" placeholder="$" style="width:40px">
      <input v-model="productUnit" placeholder="Unit" style="width:60px">
      <input v-model="productCopies" type="number" min="1" placeholder="Copies" style="width:60px">
    </div>
    <div v-for="(p, i) in extraProducts" :key="i" class="pg-form-row">
      <input v-model="p.name" placeholder="Name" style="width:120px">
      <input v-model="p.price" type="number" step="0.01" placeholder="Price">
      <input v-model="p.currency" placeholder="$" style="width:40px">
      <input v-model="p.unit" placeholder="Unit" style="width:60px">
      <input v-model="p.copies" type="number" min="1" placeholder="Copies" style="width:60px">
      <button class="pg-btn pg-btn-sm" @click="removeProduct(i)">×</button>
    </div>
    <button class="pg-btn pg-btn-sm" @click="addProduct">+ Add Product</button>
  </div>
  <div class="pg-form-section">
    <div class="pg-form-row">
      <label>Template</label>
      <select v-model="selectedTemplate">
        <option v-if="!templates.length" :value="selectedTemplate">{{ selectedTemplate }}</option>
        <option v-for="t in templates" :key="t.code || t.id" :value="t.code || t.id">
          {{ t.name }}
        </option>
      </select>
      <label>Printer</label>
      <select v-model="selectedPrinter">
        <option value="" disabled>-- select printer --</option>
        <option v-for="p in printers" :key="p.name" :value="p.name">
          {{ p.name }}{{ p.isDefault ? ' (default)' : '' }}
        </option>
      </select>
    </div>
    <button
      class="pg-btn pg-btn-primary"
      :disabled="isLoading || !selectedTemplate.trim() || !selectedPrinter.trim()"
      @click="emitPrint"
    >
      {{ isLoading ? 'Printing...' : 'Batch Print' }}
    </button>
  </div>
</template>
