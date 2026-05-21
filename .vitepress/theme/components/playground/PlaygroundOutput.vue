<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { LogEntry } from '../composables/usePlayground'

const props = defineProps<{
  logs: LogEntry[]
}>()

const container = ref<HTMLElement>()

watch(() => props.logs.length, async () => {
  await nextTick()
  if (container.value) {
    container.value.scrollTop = container.value.scrollHeight
  }
})

function typeClass(type: LogEntry['type']) {
  return {
    info: 'pg-log-info',
    success: 'pg-log-success',
    error: 'pg-log-error',
  }[type]
}
</script>

<template>
  <div class="pg-output">
    <div class="pg-output-header">
      <span>Log</span>
      <button class="pg-btn-sm" @click="$emit('clear')">Clear</button>
    </div>
    <div ref="container" class="pg-output-content">
      <div v-if="logs.length === 0" class="pg-output-empty">
        Run an action to see output...
      </div>
      <div v-for="(entry, i) in logs" :key="i" :class="['pg-log-line', typeClass(entry.type)]">
        <span class="pg-log-time">[{{ entry.time }}]</span>
        {{ entry.message }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.pg-output {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}
.pg-output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 13px;
  font-weight: 600;
}
.pg-output-content {
  background: #1a1a2e;
  color: #a9b7c6;
  padding: 12px 16px;
  max-height: 400px;
  overflow-y: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.6;
}
.pg-output-empty {
  color: #555;
  font-style: italic;
}
.pg-log-line {
  white-space: pre-wrap;
  word-break: break-all;
}
.pg-log-time {
  color: #666;
  margin-right: 4px;
}
.pg-log-success {
  color: #6a9955;
}
.pg-log-error {
  color: #f44747;
}
.pg-btn-sm {
  padding: 2px 8px;
  font-size: 11px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  cursor: pointer;
  color: var(--vp-c-text-2);
}
.pg-btn-sm:hover {
  background: var(--vp-c-bg-soft);
}
</style>
