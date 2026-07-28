<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Assistance et requêtes</h1>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h2 class="font-semibold mb-4 text-gray-800 dark:text-white">Nouvelle demande</h2>
      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Sujet</label>
          <input
            v-model="form.subject"
            required
            class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            placeholder="Sujet de votre demande"
          />
        </div>
        <div>
          <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            v-model="form.description"
            rows="4"
            required
            class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            placeholder="Décrivez votre demande..."
          ></textarea>
        </div>
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
          Envoyer
        </button>
      </form>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h2 class="font-semibold mb-4 text-gray-800 dark:text-white">Mes demandes</h2>
      <div v-if="requests.length">
        <div v-for="r in requests" :key="r.id" class="py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-medium text-gray-800 dark:text-white">{{ r.subject }}</p>
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

const requests = ref([])
const form = ref({ subject: '', description: '' })

function statusClass(status) {
  return {
    'open': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    'in_progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    'closed': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  }[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
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