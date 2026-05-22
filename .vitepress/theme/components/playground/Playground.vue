<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref } from 'vue'
import { useDevMode } from '../../composables/useDevMode'
import { usePlayground } from '../../composables/usePlayground'
import { codeTemplates } from './codeTemplates'
import DevModeBadge from './DevModeBadge.vue'
import PlaygroundEditor from './PlaygroundEditor.vue'
import PlaygroundForm from './PlaygroundForm.vue'
import PlaygroundOutput from './PlaygroundOutput.vue'
import SdkVersionBadge from './SdkVersionBadge.vue'

const { lang } = useData()
const { isDevMode } = useDevMode()
const locale = computed(() => (lang.value === 'zh-CN' ? ('zh' as const) : ('en' as const)))

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
      <div class="pg-toolbar-left">
        <SdkVersionBadge :locale="locale" />
        <span v-if="isDevMode" class="pg-dev-indicator">DEV</span>
      </div>
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

    <DevModeBadge />
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
  align-items: center;
  justify-content: space-between;
}
.pg-toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pg-dev-indicator {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: #f59e0b;
  color: #000;
  font-size: 11px;
  font-weight: 700;
  border-radius: 3px;
  letter-spacing: 0.5px;
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

<!-- 表单样式以非 scoped 形式在 Playground 顶层加载一次,避免 5 个 forms 子组件各自 scoped 复制 -->
<style src="./forms/form-styles.css"></style>
