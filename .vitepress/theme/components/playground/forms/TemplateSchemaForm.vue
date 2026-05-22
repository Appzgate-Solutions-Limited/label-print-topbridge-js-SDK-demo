<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PlaygroundTemplateItem } from '../../../composables/usePlayground'

const props = defineProps<{
  isLoading: boolean
  templates: PlaygroundTemplateItem[]
}>()

const emit = defineEmits<{
  'fetch-templates': []
  'query-schema': [templateCode: string]
}>()

const selectedTemplate = ref('')

watch(
  () => props.templates,
  (t) => {
    if (!selectedTemplate.value) selectedTemplate.value = t[0]?.code || t[0]?.id || ''
  },
  { immediate: true },
)

function querySchema() {
  if (selectedTemplate.value) emit('query-schema', selectedTemplate.value)
}
</script>

<template>
  <div class="pg-form-section">
    <div class="pg-form-title">1. Fetch Templates</div>
    <button class="pg-btn pg-btn-primary" :disabled="isLoading" @click="$emit('fetch-templates')">
      {{ isLoading ? 'Fetching...' : 'Fetch Templates' }}
    </button>
  </div>
  <div v-if="templates.length" class="pg-form-section">
    <div class="pg-form-title">2. Query Schema</div>
    <div class="pg-form-row">
      <select v-model="selectedTemplate" @change="querySchema">
        <option value="" disabled>-- select --</option>
        <option v-for="t in templates" :key="t.code || t.id" :value="t.code || t.id">{{ t.name }}</option>
      </select>
      <button class="pg-btn pg-btn-primary" :disabled="isLoading || !selectedTemplate" @click="querySchema">
        {{ isLoading ? 'Querying...' : 'Query Schema' }}
      </button>
    </div>
  </div>
</template>
