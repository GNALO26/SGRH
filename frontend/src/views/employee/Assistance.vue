<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-primary">Assistance et requêtes</h1>
    <div class="bg-card rounded-xl shadow-custom p-6">
      <h2 class="font-semibold mb-4 text-primary">Nouvelle demande</h2>
      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm mb-1 text-primary">Sujet</label>
          <input v-model="form.subject" required class="w-full border border-custom rounded p-2 bg-card text-primary" />
        </div>
        <div>
          <label class="block text-sm mb-1 text-primary">Description</label>
          <textarea v-model="form.description" rows="4" required class="w-full border border-custom rounded p-2 bg-card text-primary"></textarea>
        </div>
        <button type="submit" class="bg-accent text-white px-4 py-2 rounded hover:bg-accent-hover">Envoyer</button>
      </form>
    </div>

    <div class="bg-card rounded-xl shadow-custom p-6">
      <h2 class="font-semibold mb-4 text-primary">Mes demandes</h2>
      <div v-if="requests.length">
        <div v-for="r in requests" :key="r.id" class="py-3 border-b border-custom last:border-0">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-medium text-primary">{{ r.subject }}</p>
              <p class="text-sm text-muted">{{ r.description }}</p>
              <p v-if="r.admin_response" class="text-sm text-accent mt-1">
                <i class="fas fa-reply mr-1"></i> Réponse : {{ r.admin_response }}
              </p>
            </div>
            <span class="px-2 py-1 rounded-full text-xs" :class="statusClass(r.status)">{{ statusLabel(r.status) }}</span>
          </div>
        </div>
      </div>
      <p v-else class="text-muted">Aucune demande.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const requests = ref([])
const form = ref({ subject: '', description: '' })

function statusClass(status) {
  return { 'open': 'bg-yellow-100 text-yellow-700', 'in_progress': 'bg-blue-100 text-blue-700', 'closed': 'bg-green-100 text-green-700' }[status] || 'bg-gray-100 text-gray-700'
}
function statusLabel(status) {
  return { 'open': 'Ouverte', 'in_progress': 'En cours', 'closed': 'Fermée' }[status] || status
}

async function submit() {
  try {
    await api.post('/employee/assistance', form.value)
    Swal.fire('Envoyé', 'Demande soumise.', 'success')
    form.value = { subject: '', description: '' }
    fetchData()
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  }
}

async function fetchData() {
  const { data } = await api.get('/employee/assistance')
  requests.value = data
}

onMounted(fetchData)
</script>