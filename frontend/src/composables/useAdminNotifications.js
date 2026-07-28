import { ref, computed } from 'vue'
import api from '@/api/axios'

const unreadCount = ref(0)

export function useAdminNotifications() {
  async function fetchUnreadCount() {
    try {
      const { data } = await api.get('/admin/notifications')
      unreadCount.value = data.filter(n => !n.read).length
    } catch (e) {
      console.error('Erreur chargement notifications admin', e)
    }
  }

  async function markAllAsRead() {
    try {
      await api.post('/admin/notifications/read')
      unreadCount.value = 0
    } catch (e) {
      console.error(e)
    }
  }

  return {
    unreadCount: computed(() => unreadCount.value),
    fetchUnreadCount,
    markAllAsRead,
  }
}