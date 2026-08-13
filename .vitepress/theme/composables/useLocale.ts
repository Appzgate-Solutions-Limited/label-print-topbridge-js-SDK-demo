import { useData } from 'vitepress'
import { computed } from 'vue'

export type Locale = 'en' | 'zh'

export function useLocale() {
  const { lang } = useData()
  const locale = computed<Locale>(() => (lang.value === 'zh-CN' ? 'zh' : 'en'))
  return locale
}
