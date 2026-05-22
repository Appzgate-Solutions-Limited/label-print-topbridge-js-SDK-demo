<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { LogEntry } from '../../composables/usePlayground'

const props = defineProps<{
  logs: LogEntry[]
}>()

const container = ref<HTMLElement>()

watch(
  () => props.logs.length,
  async () => {
    await nextTick()
    if (container.value) {
      container.value.scrollTop = container.value.scrollHeight
    }
  },
)

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
      <template v-for="(entry, i) in logs" :key="i">
        <div v-if="entry.data" :class="['pg-log-line', typeClass(entry.type)]">
          <span class="pg-log-time">[{{ entry.time }}]</span>
          {{ entry.message }}
          <details class="pg-dev-details">
            <summary>{{ entry.data.title }}</summary>
            <pre class="pg-dev-json">{{ entry.data.content }}</pre>
          </details>
        </div>
        <div v-else :class="['pg-log-line', typeClass(entry.type)]">
          <span class="pg-log-time">[{{ entry.time }}]</span>
          {{ entry.message }}
        </div>
      </template>
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
.pg-dev-details {
  margin-top: 4px;
  margin-left: 8px;
}
.pg-dev-details summary {
  cursor: pointer;
  color: #f59e0b;
  font-size: 12px;
  user-select: none;
}
.pg-dev-details summary:hover {
  color: #fbbf24;
}
.pg-dev-json {
  margin-top: 4px;
  padding: 8px;
  background: rgba(245, 158, 11, 0.08);
  border-left: 2px solid #f59e0b;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  color: #d4d4d4;
}
</style>
