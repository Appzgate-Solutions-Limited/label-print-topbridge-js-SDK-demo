<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  template: string
  isLoading: boolean
  printers: { name: string; isDefault: boolean; protocol?: string }[]
  templates: { id: string; code?: string; name: string; isEnabled: boolean }[]
  preflightDone: boolean
}>()

const emit = defineEmits<{
  'preflight': []
  'health-check': []
  'print': [params: any]
  'fetch-templates': []
  'query-schema': [templateCode: string]
  'error-test': [type: string]
}>()

// basic / multi-product 通用参数
const selectedTemplate = ref('')
const selectedPrinter = ref('')
const productName = ref('Test Product')
const productPrice = ref('3.99')
const productCurrency = ref('$')
const productUnit = ref('/kg')
const productCopies = ref('1')

// multi-product 额外行
const extraProducts = ref([
  { name: 'Banana', price: '1.99', currency: '$', unit: '/lb', copies: '1' },
])

function addProduct() {
  extraProducts.value.push({ name: '', price: '0', currency: '$', unit: '', copies: '1' })
}

function removeProduct(index: number) {
  extraProducts.value.splice(index, 1)
}

function emitPrint() {
  if (props.template === 'multi-product') {
    const allProducts = [
      { name: productName.value, price: parseFloat(productPrice.value), currency: productCurrency.value, unit: productUnit.value, copies: parseInt(productCopies.value) || 1 },
      ...extraProducts.value
        .filter(p => p.name)
        .map(p => ({ name: p.name, price: parseFloat(p.price), currency: p.currency, unit: p.unit, copies: parseInt(p.copies) || 1 })),
    ]
    emit('print', { template: selectedTemplate.value, printer: selectedPrinter.value, products: allProducts })
  } else {
    emit('print', {
      template: selectedTemplate.value,
      printer: selectedPrinter.value,
      products: [{
        name: productName.value,
        price: parseFloat(productPrice.value),
        currency: productCurrency.value,
        unit: productUnit.value,
        copies: parseInt(productCopies.value) || 1,
      }],
    })
  }
}

// template-schema 参数
const schemaResult = ref<any>(null)

function querySchema() {
  if (selectedTemplate.value) {
    emit('query-schema', selectedTemplate.value)
  }
}

// advanced-form 参数
const schemaFields = ref<any[]>([])
const schemaFormData = ref<Record<string, any>>({})

function updateSchemaField(name: string, value: any) {
  schemaFormData.value = { ...schemaFormData.value, [name]: value }
}

function emitAdvancedPrint() {
  emit('print', {
    template: selectedTemplate.value,
    printer: selectedPrinter.value,
    products: [schemaFormData.value],
  })
}

defineExpose({
  selectedTemplate,
  selectedPrinter,
  schemaResult,
  schemaFields,
  schemaFormData,
})
</script>

<template>
  <div class="pg-form">
    <!-- Preflight 步骤 (basic, multi-product, preflight-only, advanced-form) -->
    <div v-if="['basic', 'multi-product', 'preflight-only', 'advanced-form'].includes(template)" class="pg-form-section">
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

    <!-- basic: 打印参数 -->
    <template v-if="template === 'basic' && preflightDone">
      <div class="pg-form-section">
        <div class="pg-form-title">2. Print Settings</div>
        <div class="pg-form-row">
          <label>Template</label>
          <select v-model="selectedTemplate">
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
          <button class="pg-btn pg-btn-primary" :disabled="isLoading || !selectedTemplate" @click="emitPrint">
            {{ isLoading ? 'Printing...' : 'Print' }}
          </button>
        </div>
      </div>
    </template>

    <!-- multi-product: 多产品打印 -->
    <template v-if="template === 'multi-product' && preflightDone">
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
            <option value="" disabled>-- select --</option>
            <option v-for="t in templates" :key="t.code || t.id" :value="t.code || t.id">{{ t.name }}</option>
          </select>
          <label>Printer</label>
          <select v-model="selectedPrinter">
            <option value="" disabled>-- select --</option>
            <option v-for="p in printers" :key="p.name" :value="p.name">{{ p.name }}{{ p.isDefault ? ' (default)' : '' }}</option>
          </select>
        </div>
        <button class="pg-btn pg-btn-primary" :disabled="isLoading || !selectedTemplate" @click="emitPrint">
          {{ isLoading ? 'Printing...' : 'Batch Print' }}
        </button>
      </div>
    </template>

    <!-- error-handling: 错误测试按钮 -->
    <template v-if="template === 'error-handling'">
      <div class="pg-form-section">
        <div class="pg-form-title">Error Handling</div>
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
    </template>

    <!-- template-schema: 模板查询 -->
    <template v-if="template === 'template-schema'">
      <div class="pg-form-section">
        <div class="pg-form-title">1. Fetch Templates</div>
        <button class="pg-btn pg-btn-primary" :disabled="isLoading" @click="$emit('fetch-templates')">
          {{ isLoading ? 'Fetching...' : 'Fetch Templates' }}
        </button>
      </div>
      <div v-if="templates.length" class="pg-form-section">
        <div class="pg-form-title">2. Query Schema</div>
        <div class="pg-form-row">
          <select v-model="selectedTemplate">
            <option value="" disabled>-- select --</option>
            <option v-for="t in templates" :key="t.code || t.id" :value="t.code || t.id">{{ t.name }}</option>
          </select>
          <button class="pg-btn pg-btn-primary" :disabled="isLoading || !selectedTemplate" @click="querySchema">
            {{ isLoading ? 'Querying...' : 'Query Schema' }}
          </button>
        </div>
      </div>
    </template>

    <!-- advanced-form: 动态表单 -->
    <template v-if="template === 'advanced-form' && preflightDone">
      <div class="pg-form-section">
        <div class="pg-form-title">2. Template & Printer</div>
        <div class="pg-form-row">
          <label>Template</label>
          <select v-model="selectedTemplate">
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
      <div v-if="schemaFields.length" class="pg-form-section">
        <div class="pg-form-title">3. Dynamic Form</div>
        <template v-for="field in schemaFields" :key="field.name">
          <div v-if="field.type !== 'line'" class="pg-form-row">
            <label>{{ field.name }}<span v-if="field.required" class="pg-required">*</span></label>
            <template v-if="field.type === 'price'">
              <input type="number" step="0.01" placeholder="value" :value="schemaFormData[field.name]?.value ?? 1.99"
                @input="updateSchemaField(field.name, { ...schemaFormData[field.name], value: parseFloat(($event.target as HTMLInputElement).value) })">
              <input type="text" placeholder="$" style="width:40px" :value="schemaFormData[field.name]?.currency ?? '$'"
                @input="updateSchemaField(field.name, { ...schemaFormData[field.name], currency: ($event.target as HTMLInputElement).value })">
              <input type="text" placeholder="unit" style="width:60px" :value="schemaFormData[field.name]?.unit ?? '/ea'"
                @input="updateSchemaField(field.name, { ...schemaFormData[field.name], unit: ($event.target as HTMLInputElement).value })">
            </template>
            <template v-else-if="field.type === 'weight'">
              <input type="number" step="0.01" placeholder="value" :value="schemaFormData[field.name]?.value ?? 0.5"
                @input="updateSchemaField(field.name, { ...schemaFormData[field.name], value: parseFloat(($event.target as HTMLInputElement).value) })">
              <input type="text" placeholder="unit" style="width:60px" :value="schemaFormData[field.name]?.unit ?? 'kg'"
                @input="updateSchemaField(field.name, { ...schemaFormData[field.name], unit: ($event.target as HTMLInputElement).value })">
            </template>
            <template v-else-if="field.type === 'integer'">
              <input type="number" :min="field.name === 'copies' ? 1 : undefined" :max="field.name === 'copies' ? 9999 : undefined"
                :value="schemaFormData[field.name] ?? field.default ?? (field.name === 'copies' ? 1 : '')"
                @input="updateSchemaField(field.name, ($event.target as HTMLInputElement).value)">
            </template>
            <template v-else>
              <input type="text" :value="schemaFormData[field.name] ?? (field.name === 'name' ? 'Test Product' : '')"
                @input="updateSchemaField(field.name, ($event.target as HTMLInputElement).value)">
            </template>
            <span class="pg-field-type">{{ field.type }}</span>
          </div>
        </template>
        <div class="pg-form-row" style="margin-top:8px">
          <button class="pg-btn pg-btn-primary" :disabled="isLoading || !selectedTemplate" @click="emitAdvancedPrint">
            {{ isLoading ? 'Printing...' : 'Print' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pg-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pg-form-section {
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.pg-form-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--vp-c-text-1);
}
.pg-form-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
  flex-wrap: wrap;
}
.pg-form-row label {
  min-width: 80px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  text-align: right;
}
.pg-form-row select,
.pg-form-row input {
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-size: 13px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  max-width: 200px;
}
.pg-form-row select:focus,
.pg-form-row input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.pg-btn {
  padding: 6px 16px;
  font-size: 13px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  cursor: pointer;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  line-height: 1.5;
}
.pg-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pg-btn:hover:not(:disabled) {
  background: var(--vp-c-bg-soft);
}
.pg-btn-primary {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
}
.pg-btn-primary:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}
.pg-btn-sm {
  padding: 2px 8px;
  font-size: 12px;
}
.pg-required {
  color: #e11d48;
  margin-left: 2px;
}
.pg-field-type {
  font-size: 11px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  padding: 2px 6px;
  border-radius: 3px;
}
</style>
