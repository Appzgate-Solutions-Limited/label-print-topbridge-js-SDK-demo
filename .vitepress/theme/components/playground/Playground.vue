<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayground } from '../../composables/usePlayground'
import { codeTemplates } from './codeTemplates'
import PlaygroundForm from './PlaygroundForm.vue'
import PlaygroundOutput from './PlaygroundOutput.vue'

const props = defineProps<{
  template: string
}>()

const {
  logs, isLoading, printers, templates,
  addLog, clearLogs, ensureClient, runPreflight,
  runHealthCheck, executeUserCode,
} = usePlayground()

const preflightDone = ref(false)
const isAdvancedMode = ref(false)
const editorRef = ref<InstanceType<typeof import('./PlaygroundEditor.vue')>>()

const defaultCode = computed(() => codeTemplates[props.template] || '')
const editorCode = ref(defaultCode.value)

function toggleMode() {
  isAdvancedMode.value = !isAdvancedMode.value
}

async function handlePreflight() {
  try {
    await runPreflight()
    preflightDone.value = true

    if (props.template === 'advanced-form' && templates.value.length) {
      const firstCode = templates.value[0]?.code || templates.value[0]?.id
      if (firstCode) await handleQuerySchema(firstCode)
    }
  } catch {
    // usePlayground 内部已处理错误日志
  }
}

async function handleHealthCheck() {
  await runHealthCheck()
}

async function handlePrint(params: any) {
  isLoading.value = true
  try {
    const c = ensureClient()
    const result = await c.print.execute(params)
    addLog('✓ Print successful', 'success')
    addLog(`  Copies: ${result.data.printedCopies}`)
    addLog(`  Template: ${result.data.templateName}`)
    if (result.data.jobId) addLog(`  Job ID: ${result.data.jobId}`)
    if (result.warnings?.length) {
      for (const w of result.warnings) {
        addLog(`  Warning: [${w.code}] ${w.message}`, 'error')
      }
    }
  } catch (err: any) {
    addLog(`✗ Print failed: ${err.message}`, 'error')
    if (err.field) addLog(`  Field: ${err.field}`)
  } finally {
    isLoading.value = false
  }
}

async function handleFetchTemplates() {
  isLoading.value = true
  try {
    const c = ensureClient()
    const result = await c.templates.list()
    templates.value = result.data.templates ?? []
    addLog(`✓ Found ${result.data.count} templates`, 'success')
  } catch (err: any) {
    addLog(`✗ Failed: ${err.message}`, 'error')
  } finally {
    isLoading.value = false
  }
}

async function handleQuerySchema(templateCode: string) {
  isLoading.value = true
  try {
    const c = ensureClient()
    const schema = await c.templates.schema(templateCode)
    addLog(`✓ Schema: ${schema.data.name} (${schema.data.code})`, 'success')
    addLog(`  Fields: ${schema.data.fields?.length ?? 0}`)
    for (const f of schema.data.fields ?? []) {
      if (f.type !== 'line') {
        addLog(`    ${f.name}: ${f.type}${f.required ? ' (required)' : ''}`)
      }
    }
  } catch (err: any) {
    addLog(`✗ Schema failed: ${err.message}`, 'error')
  } finally {
    isLoading.value = false
  }
}

async function handleErrorTest(type: string) {
  isLoading.value = true
  try {
    if (type === 'preflight') {
      addLog('--- Preflight with error handling ---')
      try {
        const result = await ensureClient().preflight.run({
          onStepChange: (step: string) => addLog(`  Step: ${step}...`),
        })
        addLog('✓ Preflight passed', 'success')
        addLog(`  Printer: ${result.printers.data?.defaultPrinter}`)
      } catch (err: any) {
        const name = err.constructor?.name || 'Error'
        addLog(`✗ ${name}: ${err.message}`, 'error')
        if (err.code) addLog(`  code: ${err.code}`)
        if (err.storeUrl) addLog(`  Update: ${err.storeUrl}`)
      }
    } else if (type === 'validation') {
      addLog('--- Empty product list test ---')
      try {
        await ensureClient().print.execute({
          template: 'PRICE_LABEL',
          printer: 'Test',
          products: [],
        })
      } catch (err: any) {
        const name = err.constructor?.name || 'Error'
        addLog(`✗ ${name}: ${err.message}`, 'error')
        if (err.field) addLog(`  field: ${err.field}`)
      }
    }
  } finally {
    isLoading.value = false
  }
}

async function handleEditorRun(code: string) {
  isLoading.value = true
  addLog('--- Executing user code ---')
  try {
    await executeUserCode(code)
    addLog('--- Execution complete ---', 'success')
  } catch (err: any) {
    addLog(`✗ Execution error: ${err.message}`, 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="pg-container">
    <div class="pg-toolbar">
      <button class="pg-toggle-btn" @click="toggleMode">
        {{ isAdvancedMode ? '← Form Mode' : 'Advanced Mode →' }}
      </button>
    </div>

    <PlaygroundForm
      v-if="!isAdvancedMode"
      :template="template"
      :is-loading="isLoading"
      :printers="printers"
      :templates="templates"
      :preflight-done="preflightDone"
      @preflight="handlePreflight"
      @health-check="handleHealthCheck"
      @print="handlePrint"
      @fetch-templates="handleFetchTemplates"
      @query-schema="handleQuerySchema"
      @error-test="handleErrorTest"
    />

    <PlaygroundEditor
      v-if="isAdvancedMode"
      ref="editorRef"
      v-model="editorCode"
      @run="handleEditorRun"
    />

    <PlaygroundOutput
      :logs="logs"
      @clear="clearLogs"
    />
  </div>
</template>

<style scoped>
.pg-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 16px 0;
}
.pg-toolbar {
  display: flex;
  justify-content: flex-end;
}
.pg-toggle-btn {
  padding: 4px 12px;
  font-size: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}
.pg-toggle-btn:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}
</style>
