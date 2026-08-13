<script setup lang="ts">
import LZString from 'lz-string'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useLocale } from '../../composables/useLocale'
import { playgroundLabels } from '../../locales'

const props = defineProps<{
  modelValue: string
  isRunning: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  run: [code: string]
}>()

const editorContainer = ref<HTMLElement>()
const editorReady = ref(false)
const view = shallowRef<any>(null)

const locale = useLocale()
const labels = computed(() => playgroundLabels[locale.value])

onMounted(async () => {
  const [
    { EditorView: EV, keymap },
    { javascript },
    { oneDark },
    { defaultKeymap, indentWithTab },
  ] = await Promise.all([
    import('@codemirror/view'),
    import('@codemirror/lang-javascript'),
    import('@codemirror/theme-one-dark'),
    import('@codemirror/commands'),
  ])

  const restoredCode = tryRestoreFromHash()
  const initialCode = restoredCode ?? props.modelValue
  if (restoredCode !== null) emit('update:modelValue', restoredCode)

  view.value = new EV({
    parent: editorContainer.value,
    doc: initialCode,
    extensions: [
      javascript({ typescript: true }),
      oneDark,
      keymap.of([
        ...defaultKeymap,
        indentWithTab,
        {
          key: 'Mod-Enter',
          run: () => {
            handleRun()
            return true
          },
        },
      ]),
      EV.updateListener.of((update: any) => {
        if (update.docChanged) {
          emit('update:modelValue', update.state.doc.toString())
        }
      }),
    ],
  })

  editorReady.value = true
})

onBeforeUnmount(() => {
  view.value?.destroy()
})

function handleRun() {
  if (props.isRunning) return
  const code = view.value?.state.doc.toString() ?? props.modelValue
  emit('run', code)
}

function share() {
  const code = view.value?.state.doc.toString() ?? props.modelValue
  const compressed = LZString.compressToEncodedURIComponent(code)
  const url = new URL(window.location.href)
  url.hash = `code=${compressed}`
  navigator.clipboard
    .writeText(url.toString())
    .then(() => alert(labels.value.shareCopied))
    .catch(() => alert(labels.value.shareFailed))
}

// 从 URL hash 恢复代码
function tryRestoreFromHash(): string | null {
  const hash = window.location.hash
  if (hash.startsWith('#code=')) {
    const compressed = hash.slice(6)
    try {
      return LZString.decompressFromEncodedURIComponent(compressed) ?? null
    } catch {
      return null
    }
  }
  return null
}
</script>

<template>
  <div class="pg-editor">
    <div class="pg-editor-toolbar">
      <span class="pg-editor-label">{{ labels.codeEditor }}</span>
      <div class="pg-editor-actions">
        <span class="pg-editor-hint">{{ labels.ctrlEnterHint }}</span>
        <button class="pg-btn pg-btn-secondary" @click="share">{{ labels.share }}</button>
        <button class="pg-btn pg-btn-primary" :disabled="props.isRunning" @click="handleRun">
          {{ props.isRunning ? labels.running : labels.run }}
        </button>
      </div>
    </div>
    <div ref="editorContainer" class="pg-editor-content" />
    <div v-if="!editorReady" class="pg-editor-loading">{{ labels.loadingEditor }}</div>
  </div>
</template>

<style scoped>
.pg-editor {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}
.pg-editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}
.pg-editor-label {
  font-size: 13px;
  font-weight: 600;
}
.pg-editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pg-editor-hint {
  font-size: 11px;
  color: var(--vp-c-text-3);
}
.pg-editor-content {
  height: 400px;
  overflow: auto;
}
.pg-editor-content :deep(.cm-editor) {
  height: 100%;
  font-size: 13px;
}
.pg-editor-content :deep(.cm-scroller) {
  font-family: var(--vp-font-family-mono);
}
.pg-editor-loading {
  padding: 16px;
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 13px;
}
.pg-btn {
  padding: 4px 12px;
  font-size: 13px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  cursor: pointer;
  line-height: 1.5;
}
.pg-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pg-btn-primary {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
}
.pg-btn-primary:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}
.pg-btn-secondary {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
}
.pg-btn-secondary:hover:not(:disabled) {
  background: var(--vp-c-bg-soft);
}
</style>
