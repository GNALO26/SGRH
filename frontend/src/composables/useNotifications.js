import { ref, computed } from 'vue'
import api from '@/api/axios'

const unreadCount = ref(0)

export function useNotifications() {
  async function fetchUnreadCount() {
    try {
      const { data } = await api.get('/employee/notifications')
      unreadCount.value = data.filter(n => !n.read).length
    } catch (e) {
      console.error('Erreur chargement notifications', e)
    }
  }

  async function markAllAsRead() {
    try {
      await api.post('/employee/notifications/read')
      unreadCount.value = 0
    } catch (e) {
      console.error(e)
    }
  }

  return {
    unreadCount: computed(() => unreadCount.value),
    fetchUnreadCount,
    markAllAsRead
  }
}