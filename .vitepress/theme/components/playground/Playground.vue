<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PlaygroundSchemaField } from '../../composables/usePlayground'
import { usePlayground } from '../../composables/usePlayground'
import { codeTemplates } from './codeTemplates'
import PlaygroundEditor from './PlaygroundEditor.vue'
import PlaygroundForm from './PlaygroundForm.vue'
import PlaygroundOutput from './PlaygroundOutput.vue'
import {
  TopBridgeError,
  TopBridgeConnectionError,
  TopBridgeAuthError,
  TopBridgeQuotaError,
  TopBridgePrintError,
  TopBridgeConfigError,
  TopBridgeValidationError,
  TopBridgePrinterError,
  TopBridgeTemplateError,
  TopBridgeNetworkError,
  TopBridgeSourceError,
} from '@appzgatenz/label-print-topbridge-js'

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
const schemaFields = ref<PlaygroundSchemaField[]>([])

const defaultCode = computed(() => codeTemplates[props.template] || '')
const editorCode = ref(defaultCode.value)

function toggleMode() {
  isAdvancedMode.value = !isAdvancedMode.value
}

async function handlePreflight() {
  try {
    const result = await runPreflight()
    preflightDone.value = true

    if (props.template === 'advanced-form' && templates.value.length) {
      const firstCode = templates.value[0]?.code || templates.value[0]?.id
      if (firstCode) await handleQuerySchema(firstCode)
      const defaultPrinter = result.printers.data?.defaultPrinter
      if (defaultPrinter) addLog(`  Selected printer: ${defaultPrinter}`)
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
    schemaFields.value = schema.data.fields ?? []
    addLog(`✓ Schema: ${schema.data.name} (${schema.data.code})`, 'success')
    addLog(`  Fields: ${schema.data.fields?.length ?? 0}`)
    for (const f of schema.data.fields ?? []) {
      if (f.type !== 'line') {
        addLog(`    ${f.name}: ${f.type}${f.required ? ' (required)' : ''}`)
      }
    }
  } catch (err: any) {
    schemaFields.value = []
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
    } else if (type.startsWith('simulate-')) {
      const errorType = type.replace('simulate-', '')
      addLog(`--- Simulated ${errorType} ---`)
      try {
        switch (errorType) {
          case 'connection':
            throw new TopBridgeConnectionError('TopBridge App is not running')
          case 'auth-not-authenticated':
            throw new TopBridgeAuthError('User is not logged in', { code: 'NOT_AUTHENTICATED' })
          case 'auth-update-required':
            throw new TopBridgeAuthError('TopBridge App version is too low', { code: 'UPDATE_REQUIRED', storeUrl: 'https://example.com/update' })
          case 'quota':
            throw new TopBridgeQuotaError('Print quota exhausted', { reason: 'Monthly limit reached' })
          case 'printer':
            throw new TopBridgePrinterError('Printer is offline')
          case 'template':
            throw new TopBridgeTemplateError('Template not found')
          case 'network':
            throw new TopBridgeNetworkError('Cloud network disconnected')
          case 'source':
            throw new TopBridgeSourceError('Origin verification failed')
          case 'config':
            throw new TopBridgeConfigError('Invalid configuration')
          case 'print':
            throw new TopBridgePrintError('Print job failed', { details: { jobId: '12345' } })
          case 'validation':
            throw new TopBridgeValidationError('Invalid input', 'products')
          default:
            throw new TopBridgeError('Unknown simulated error')
        }
      } catch (err: any) {
        const name = err.constructor?.name || 'Error'
        addLog(`✗ [Simulated] ${name}: ${err.message}`, 'error')
        if (err.code) addLog(`  code: ${err.code}`)
        if (err.storeUrl) addLog(`  storeUrl: ${err.storeUrl}`)
        if (err.downloadUrl) addLog(`  downloadUrl: ${err.downloadUrl}`)
        if (err.reason) addLog(`  reason: ${err.reason}`)
        if (err.field) addLog(`  field: ${err.field}`)
        if (err.details) addLog(`  details: ${JSON.stringify(err.details)}`)
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
      :schema-fields="schemaFields"
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
      v-model="editorCode"
      :is-running="isLoading"
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
