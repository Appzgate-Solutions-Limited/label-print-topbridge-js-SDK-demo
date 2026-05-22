<script setup lang="ts">
import { ref } from 'vue'
import { useDevMode } from '../../composables/useDevMode'

const { isDevMode, deactivate } = useDevMode()
const expanded = ref(false)
</script>

<template>
  <div v-if="isDevMode" class="dev-badge" @click="expanded = !expanded">
    <span class="dev-badge-label">DEV</span>
    <div v-if="expanded" class="dev-badge-popup" @click.stop>
      <div class="dev-badge-title">开发模式</div>
      <div class="dev-badge-desc">SDK 请求已拦截，数据输出到 Log 面板</div>
      <button class="dev-badge-close" @click="deactivate(); expanded = false">关闭</button>
    </div>
  </div>
</template>

<style scoped>
.dev-badge {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 9999;
  cursor: pointer;
}

.dev-badge-label {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: #f59e0b;
  color: #000;
  font-size: 12px;
  font-weight: 700;
  border-radius: 4px;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
}

.dev-badge-popup {
  position: absolute;
  bottom: 32px;
  right: 0;
  min-width: 220px;
  padding: 12px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.dev-badge-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.dev-badge-desc {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

.dev-badge-close {
  width: 100%;
  padding: 4px 0;
  font-size: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.dev-badge-close:hover {
  background: var(--vp-c-bg-mute);
}
</style>
