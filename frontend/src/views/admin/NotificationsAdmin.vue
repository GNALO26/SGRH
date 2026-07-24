<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold dark:text-white">Notifications</h1>
      <button @click="markAllRead" class="text-sm text-blue-600 hover:underline dark:text-blue-400">
        Tout marquer comme lu
      </button>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow divide-y dark:divide-gray-700">
      <div v-for="notif in notifications" :key="notif.id" class="p-4 flex items-start gap-3" :class="{'bg-blue-50 dark:bg-blue-900': !notif.read}">
        <i :class="notif.icon" class="text-xl text-blue-500 mt-1"></i>
        <div class="flex-1">
          <p :class="{'font-semibold': !notif.read}">{{ notif.message }}</p>
          <p class="text-sm text-gray-400 dark:text-gray-500">{{ timeAgo(notif.created_at) }}</p>
        </div>
        <span v-if="!notif.read" class="h-2 w-2 bg-blue-500 rounded-full mt-2"></span>
      </div>
      <p v-if="notifications.length === 0" class="p-4 text-gray-500 dark:text-gray-400 text-center">Aucune notification.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

const notifications = ref([])

async function fetchNotifications() {
  try {
    const { data } = await api.get('/admin/notifications')
    notifications.value = data
  } catch (e) {
    console.error('Erreur chargement notifications admin', e)
  }
}

async function markAllRead() {
  try {
    await api.post('/admin/notifications/read')
    notifications.value.forEach(n => n.read = true)
  } catch (e) {
    console.error(e)
  }
}

function timeAgo(dateString) {
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now - past
  const diffSecs = Math.floor(diffMs / 1000)
  if (diffSecs < 60) return `il y a ${diffSecs} seconde${diffSecs > 1 ? 's' : ''}`
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
  const diffDays = Math.floor(diffHours / 24)
  return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
}

onMounted(fetchNotifications)
</script>