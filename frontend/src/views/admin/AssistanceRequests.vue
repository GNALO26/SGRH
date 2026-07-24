<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-primary">Demandes d'assistance</h1>
    <div class="bg-card rounded-xl shadow-custom overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="p-3 text-primary">Employé</th><th class="p-3 text-primary">Sujet</th><th class="p-3 text-primary">Description</th><th class="p-3 text-primary">Statut</th><th class="p-3 text-primary">Réponse</th><th class="p-3 text-primary">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="req in requests" :key="req.id">
            <td class="p-3 text-primary">{{ req.user?.name }}</td>
            <td class="p-3 text-primary">{{ req.subject }}</td>
            <td class="p-3 text-primary max-w-xs truncate">{{ req.description }}</td>
            <td class="p-3"><span class="px-2 py-1 rounded-full text-xs" :class="statusClass(req.status)">{{ statusLabel(req.status) }}</span></td>
            <td class="p-3 text-primary max-w-xs truncate">{{ req.admin_response || '-' }}</td>
            <td class="p-3"><button @click="openRespond(req)" class="text-accent hover:underline">Répondre</button></td>
          </tr>
        </tbody>
      </table>
      <p v-if="requests.length === 0" class="p-4 text-muted text-center">Aucune demande.</p>
    </div>

    <!-- Modal répondre -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-card rounded-xl p-6 w-full max-w-md shadow-custom border border-custom">
        <h2 class="text-lg font-bold mb-4 text-primary">Répondre à la demande</h2>
        <div class="mb-3">
          <label class="block text-sm text-primary">Statut</label>
          <select v-model="respondForm.status" class="w-full border border-custom rounded p-2 bg-card text-primary">
            <option value="open">Ouverte</option>
            <option value="in_progress">En cours</option>
            <option value="closed">Fermée</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="block text-sm text-primary">Réponse</label>
          <textarea v-model="respondForm.admin_response" rows="3" class="w-full border border-custom rounded p-2 bg-card text-primary"></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button @click="showModal = false" class="px-4 py-2 border border-custom rounded text-primary">Annuler</button>
          <button @click="submitResponse" class="bg-accent text-white px-4 py-2 rounded hover:bg-accent-hover">Envoyer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const requests = ref([])
const showModal = ref(false)
const selectedRequest = ref(null)
const respondForm = ref({ status: 'open', admin_response: '' })

function statusClass(status) { return { 'open': 'bg-yellow-100 text-yellow-700', 'in_progress': 'bg-blue-100 text-blue-700', 'closed': 'bg-green-100 text-green-700' }[status] || '' }
function statusLabel(status) { return { 'open': 'Ouverte', 'in_progress': 'En cours', 'closed': 'Fermée' }[status] || status }

async function fetchData() {
  const { data } = await api.get('/admin/assistance-requests')
  requests.value = data.data || data
}

function openRespond(req) {
  selectedRequest.value = req
  respondForm.value = { status: req.status, admin_response: req.admin_response || '' }
  showModal.value = true
}

async function submitResponse() {
  try {
    await api.patch(`/admin/assistance-requests/${selectedRequest.value.id}/respond`, respondForm.value)
    Swal.fire('Succès', 'Réponse envoyée', 'success')
    showModal.value = false
    fetchData()
  } catch (e) { Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error') }
}

onMounted(fetchData)
</script>