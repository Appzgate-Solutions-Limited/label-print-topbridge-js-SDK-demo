<script setup lang="ts">
import { ref } from 'vue'
import type { PlaygroundPrinter, PlaygroundTemplateItem } from '../../../composables/usePlayground'
import { useTemplatePrinterSelection } from '../../../composables/useTemplatePrinterSelection'

const props = withDefaults(
  defineProps<{
    isLoading: boolean
    templates: PlaygroundTemplateItem[]
    printers: PlaygroundPrinter[]
    multi?: boolean
  }>(),
  { multi: false },
)

const emit = defineEmits<{
  print: [params: any]
}>()

const { selectedTemplate, selectedPrinter } = useTemplatePrinterSelection(
  () => props.templates,
  () => props.printers,
)

const productName = ref('Test Product')
const productPrice = ref('3.99')
const productCurrency = ref('$')
const productUnit = ref('/kg')
const productCopies = ref('1')
const extraProducts = ref([
  { name: 'Banana', price: '1.99', currency: '$', unit: '/lb', copies: '1' },
])

function addProduct() {
  extraProducts.value.push({ name: '', price: '0', currency: '$', unit: '', copies: '1' })
}

function removeProduct(index: number) {
  extraProducts.value.splice(index, 1)
}

function buildProduct(p: {
  name: string
  price: string
  currency: string
  unit: string
  copies: string
}) {
  return {
    name: p.name,
    price: {
      value: parseFloat(p.price),
      currency: p.currency,
      unit: p.unit,
    },
    copies: Number.parseInt(p.copies, 10) || 1,
  }
}

function emitPrint() {
  const products = [
    buildProduct({
      name: productName.value,
      price: productPrice.value,
      currency: productCurrency.value,
      unit: productUnit.value,
      copies: productCopies.value,
    }),
  ]

  if (props.multi) {
    products.push(...extraProducts.value.filter((p) => p.name).map(buildProduct))
  }

  emit('print', {
    template: selectedTemplate.value.trim(),
    printer: selectedPrinter.value.trim(),
    products,
  })
}
</script>

<template>
  <!-- multi=true: 紧凑产品列表布局 -->
  <div v-if="multi" class="pg-form-section">
    <div class="pg-form-title">2. Product List</div>
    <div class="pg-form-row">
      <input v-model="productName" placeholder="Name" style="width: 120px">
      <input v-model="productPrice" type="number" step="0.01" placeholder="Price">
      <input v-model="productCurrency" placeholder="$" style="width: 40px">
      <input v-model="productUnit" placeholder="Unit" style="width: 60px">
      <input v-model="productCopies" type="number" min="1" placeholder="Copies" style="width: 60px">
    </div>
    <div v-for="(p, i) in extraProducts" :key="i" class="pg-form-row">
      <input v-model="p.name" placeholder="Name" style="width: 120px">
      <input v-model="p.price" type="number" step="0.01" placeholder="Price">
      <input v-model="p.currency" placeholder="$" style="width: 40px">
      <input v-model="p.unit" placeholder="Unit" style="width: 60px">
      <input v-model="p.copies" type="number" min="1" placeholder="Copies" style="width: 60px">
      <button class="pg-btn pg-btn-sm" @click="removeProduct(i)">×</button>
    </div>
    <button class="pg-btn pg-btn-sm" @click="addProduct">+ Add Product</button>
  </div>

  <!-- multi=false: 标签行布局 -->
  <div v-else class="pg-form-section">
    <div class="pg-form-title">2. Print Settings</div>
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
      <input v-model="productCurrency" type="text" style="width: 50px">
      <label>Unit</label>
      <input v-model="productUnit" type="text" style="width: 60px">
    </div>
    <div class="pg-form-row">
      <label>Copies</label>
      <input v-model="productCopies" type="number" min="1" max="9999">
    </div>
  </div>

  <!-- 共享：Template / Printer 选择 + Print 按钮 -->
  <div class="pg-form-section">
    <div v-if="!multi" class="pg-form-row">
      <label>Template</label>
      <select v-model="selectedTemplate">
        <option v-if="!templates.length" :value="selectedTemplate">{{ selectedTemplate }}</option>
        <option v-for="t in templates" :key="t.code || t.id" :value="t.code || t.id">
          {{ t.name }}
        </option>
      </select>
    </div>
    <div v-if="!multi" class="pg-form-row">
      <label>Printer</label>
      <select v-model="selectedPrinter">
        <option value="" disabled>-- select printer --</option>
        <option v-for="p in printers" :key="p.name" :value="p.name">
          {{ p.name }}{{ p.isDefault ? ' (default)' : '' }}
        </option>
      </select>
    </div>
    <div v-if="multi" class="pg-form-row">
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
    <div class="pg-form-row">
      <button
        class="pg-btn pg-btn-primary"
        :disabled="isLoading || !selectedTemplate.trim() || !selectedPrinter.trim()"
        @click="emitPrint"
      >
        {{ isLoading ? 'Printing...' : multi ? 'Batch Print' : 'Print' }}
      </button>
    </div>
  </div>
</template>
