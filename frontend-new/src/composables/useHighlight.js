import { useRoute } from 'vue-router'
import { onMounted, nextTick } from 'vue'

export function useHighlight() {
  const route = useRoute()

  onMounted(async () => {
    await nextTick()
    const highlightId = route.query.highlight
    if (!highlightId) return
    const el = document.getElementById(highlightId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('highlighted-item')
      setTimeout(() => el.classList.remove('highlighted-item'), 3000)
    }
  })
}