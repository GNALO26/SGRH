<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold dark:text-white">Congés & Absences</h1>

    <div v-if="loading" class="text-center py-10">
      <i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
      <p class="mt-2 text-gray-500 dark:text-gray-400">Chargement des demandes...</p>
    </div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="p-3 text-left dark:text-white">Employé</th>
            <th class="p-3 text-left dark:text-white">Type</th>
            <th class="p-3 text-left dark:text-white">Dates</th>
            <th class="p-3 text-left dark:text-white">Motif</th>
            <th class="p-3 text-left dark:text-white">Statut</th>
            <th class="p-3 text-left dark:text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="leave in leaves" :key="leave.id" class="border-b dark:border-gray-700">
            <td class="p-3 dark:text-white">{{ leave.user?.name || 'Employé supprimé' }}</td>
            <td class="p-3 dark:text-white">{{ leave.type === 'vacation' ? 'Congé' : 'Absence' }}</td>
            <td class="p-3 dark:text-white">{{ formatDate(leave.start_date) }} - {{ formatDate(leave.end_date) }}</td>
            <td class="p-3 dark:text-white max-w-xs truncate">{{ leave.reason }}</td>
            <td class="p-3">
              <span :class="statusBadge(leave.status)">{{ statusText(leave.status) }}</span>
            </td>
            <td class="p-3">
              <template v-if="leave.status === 'pending'">
                <button @click="update(leave.id, 'approved')" :disabled="updating === leave.id" class="text-green-600 hover:underline mr-2 disabled:opacity-50">Valider</button>
                <button @click="update(leave.id, 'rejected')" :disabled="updating === leave.id" class="text-red-600 hover:underline disabled:opacity-50">Refuser</button>
              </template>
              <span v-else class="text-gray-400">-</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="leaves.length === 0" class="p-4 text-gray-500 dark:text-gray-400 text-center">Aucune demande.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const leaves = ref([])
const updating = ref(null)
const loading = ref(true)

const statusBadge = (s) => ({
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}[s] || '')

const statusText = (s) => ({
  pending: 'En attente',
  approved: 'Validé',
  rejected: 'Refusé',
}[s] || s)

const formatDate = (d) => {
  if (!d) return '-'
  const date = new Date(d)
  return isNaN(date.getTime()) ? d : date.toLocaleDateString('fr-FR')
}

async function fetchLeaves() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/leaves')
    leaves.value = data
  } catch (e) {
    Swal.fire('Erreur', 'Impossible de charger les demandes.', 'error')
  } finally {
    loading.value = false
  }
}

async function update(id, status) {
  updating.value = id
  try {
    await api.patch(`/admin/leaves/${id}`, { status })
    Swal.fire('Succès', 'Demande mise à jour', 'success')
    // Recharger toute la liste après un court délai
    setTimeout(async () => {
      await fetchLeaves()
    }, 400)
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  } finally {
    updating.value = null
  }
}

onMounted(fetchLeaves)
</script>