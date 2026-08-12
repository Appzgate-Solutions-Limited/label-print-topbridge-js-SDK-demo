import { ref, watch } from 'vue'
import type { PlaygroundPrinter, PlaygroundTemplateItem } from './useSdkOps'

/** 提取 BasicForm / MultiProductForm / AdvancedForm 中逐字重复的 template+printer 选择 watcher */
export function useTemplatePrinterSelection(
  templates: () => PlaygroundTemplateItem[],
  printers: () => PlaygroundPrinter[],
) {
  const selectedTemplate = ref('PRICE_LABEL')
  const selectedPrinter = ref('')

  watch(
    templates,
    (t) => {
      const firstTemplate = t[0]?.code || t[0]?.id || ''
      const hasSelectedTemplate = t.some((x) => (x.code || x.id) === selectedTemplate.value)
      if (firstTemplate && (!selectedTemplate.value || !hasSelectedTemplate)) {
        selectedTemplate.value = firstTemplate
      }
    },
    { immediate: true },
  )

  watch(
    printers,
    (p) => {
      if (!selectedPrinter.value)
        selectedPrinter.value = p.find((x) => x.isDefault)?.name || p[0]?.name || ''
    },
    { immediate: true },
  )

  return { selectedTemplate, selectedPrinter }
}
