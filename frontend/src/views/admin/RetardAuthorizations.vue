<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-primary">Autorisations de retard</h1>
    <div class="bg-card rounded-xl shadow-custom overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="p-3 text-left text-primary">Employé</th>
            <th class="p-3 text-left text-primary">Date</th>
            <th class="p-3 text-left text-primary">Heure prévue</th>
            <th class="p-3 text-left text-primary">Motif</th>
            <th class="p-3 text-left text-primary">Statut</th>
            <th class="p-3 text-left text-primary">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="auth in authorizations" :key="auth.id" class="border-b border-custom">
            <td class="p-3 text-primary">{{ auth.user?.name || 'Utilisateur supprimé' }}</td>
            <td class="p-3 text-primary">{{ auth.date }}</td>
            <td class="p-3 text-primary">{{ auth.expected_arrival }}</td>
            <td class="p-3 text-primary max-w-xs truncate">{{ auth.reason }}</td>
            <td class="p-3">
              <span :class="statusBadge(auth.status)">{{ statusText(auth.status) }}</span>
            </td>
            <td class="p-3 space-x-2" v-if="auth.status === 'pending'">
              <button @click="updateStatus(auth.id, 'approved')" class="text-success hover:underline">Valider</button>
              <button @click="updateStatus(auth.id, 'rejected')" class="text-danger hover:underline">Refuser</button>
            </td>
            <td v-else class="p-3 text-muted">-</td>
          </tr>
        </tbody>
      </table>
      <p v-if="authorizations.length === 0" class="p-4 text-muted text-center">Aucune demande.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const authorizations = ref([])
const statusBadge = (s) => ({ pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' }[s] || '')
const statusText = (s) => ({ pending: 'En attente', approved: 'Validé', rejected: 'Refusé' }[s] || s)

async function fetchData() {
  const { data } = await api.get('/admin/retard-authorizations')
  authorizations.value = data.data || data
}

async function updateStatus(id, status) {
  try {
    await api.patch(`/admin/retard-authorizations/${id}`, { status })
    Swal.fire('Succès', 'Statut mis à jour', 'success')
    fetchData()
  } catch (e) { Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error') }
}

onMounted(fetchData)
</script>