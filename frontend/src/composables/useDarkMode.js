import { computed } from 'vue'
import { useThemeStore } from '@/store/theme'

export function useDarkMode() {
  const theme = useThemeStore()
  return {
    isDark: computed(() => theme.isDark),
    toggle: () => theme.toggle(),
  }
}