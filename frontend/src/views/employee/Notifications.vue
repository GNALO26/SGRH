<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Notifications</h1>
        <p class="text-gray-500 text-sm">Retrouvez l'historique de vos notifications et alertes RH.</p>
      </div>
      <button
        v-if="notifications.some(n => !n.read_at)"
        @click="markAllAsRead"
        class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded font-medium transition"
      >
        Tout marquer comme lu
      </button>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-400">
        <i class="fas fa-spinner fa-spin text-3xl"></i>
        <p class="mt-2 text-sm">Chargement des notifications...</p>
      </div>

      <div v-else-if="notifications.length === 0" class="p-12 text-center text-gray-400">
        <i class="fas fa-bell-slash text-4xl mb-3 text-gray-300"></i>
        <p class="text-base font-medium text-gray-600">Aucune notification pour le moment</p>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          :class="{ 'bg-blue-50/30': !notif.read_at }"
          class="p-4 flex items-start gap-3 hover:bg-gray-50 transition"
        >
          <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-sm">
            <i class="fas fa-bell"></i>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">{{ notif.title || notif.data?.message || 'Notification' }}</p>
            <p v-if="notif.body" class="text-xs text-gray-500 mt-0.5">{{ notif.body }}</p>
            <span class="text-[11px] text-gray-400 mt-1 block">{{ formatDate(notif.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const loading = ref(true)
const notifications = ref([])

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? dateStr : date.toLocaleString('fr-FR')
}

async function fetchNotifications() {
  loading.value = true
  try {
    const { data } = await api.get('/employee/notifications')
    notifications.value = data || []
  } catch (e) {
    Swal.fire('Erreur', 'Impossible de charger vos notifications.', 'error')
  } finally {
    loading.value = false
  }
}

async function markAllAsRead() {
  try {
    await api.post('/employee/notifications/mark-read')
    notifications.value.forEach(n => n.read_at = new Date().toISOString())
  } catch (e) {
    //
  }
}

onMounted(fetchNotifications)
</script>