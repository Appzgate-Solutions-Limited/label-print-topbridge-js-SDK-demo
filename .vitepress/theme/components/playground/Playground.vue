<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayground } from '../../composables/usePlayground'
import { codeTemplates } from './codeTemplates'
import PlaygroundEditor from './PlaygroundEditor.vue'
import PlaygroundForm from './PlaygroundForm.vue'
import PlaygroundOutput from './PlaygroundOutput.vue'

const props = defineProps<{
  template: string
}>()

const {
  logs,
  isLoading,
  printers,
  templates,
  schemaFields,
  addLog,
  clearLogs,
  runPreflight,
  runHealthCheck,
  print,
  fetchTemplates,
  querySchema,
  runErrorTest,
  executeUserCode,
} = usePlayground()

const preflightDone = ref(false)
const isAdvancedMode = ref(false)
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
      if (firstCode) await querySchema(firstCode)
    }
  } catch {
    // composable 内部已处理错误日志
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
      @health-check="runHealthCheck"
      @print="print"
      @fetch-templates="fetchTemplates"
      @query-schema="querySchema"
      @error-test="runErrorTest"
    />

    <PlaygroundEditor
      v-if="isAdvancedMode"
      v-model="editorCode"
      :is-running="isLoading"
      @run="executeUserCode"
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
