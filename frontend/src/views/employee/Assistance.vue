<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold dark:text-white">Assistance et requêtes</h1>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h2 class="font-semibold mb-4 dark:text-white">Nouvelle demande</h2>
      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm mb-1 dark:text-gray-300">Sujet</label>
          <input v-model="form.subject" required class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm mb-1 dark:text-gray-300">Description</label>
          <textarea v-model="form.description" rows="4" required class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white"></textarea>
        </div>
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Envoyer</button>
      </form>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h2 class="font-semibold mb-4 dark:text-white">Mes demandes</h2>
      <div v-if="requests.length">
        <div
          v-for="r in requests"
          :key="r.id"
          :id="`assist-${r.id}`"
          class="py-3 border-b last:border-0 dark:border-gray-700"
        >
          <div class="flex justify-between items-start">
            <div>
              <p class="font-medium dark:text-white">{{ r.subject }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ r.description }}</p>
              <p v-if="r.admin_response" class="text-sm text-blue-600 dark:text-blue-400 mt-1">
                <i class="fas fa-reply mr-1"></i> Réponse : {{ r.admin_response }}
              </p>
            </div>
            <span class="px-2 py-1 rounded-full text-xs" :class="statusClass(r.status)">{{ statusLabel(r.status) }}</span>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500 dark:text-gray-400">Aucune demande.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'
import { useHighlight } from '@/composables/useHighlight'

const requests = ref([])
const form = ref({ subject: '', description: '' })

useHighlight()

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
  try {
    const { data } = await api.get('/employee/assistance')
    requests.value = data
  } catch (e) {
    console.error(e)
  }
}

onMounted(fetchData)
</script>