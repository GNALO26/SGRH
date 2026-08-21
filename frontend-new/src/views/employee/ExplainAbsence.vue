<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-lg w-full p-6">
      <div class="text-center mb-6">
        <i class="fas fa-exclamation-triangle text-4xl text-yellow-500"></i>
        <h1 class="text-xl font-bold mt-2 dark:text-white">Absences non justifiées détectées</h1>
        <p class="text-gray-500 dark:text-gray-400">Veuillez fournir une explication pour chaque période d'absence.</p>
      </div>

      <div v-if="absences.length === 0" class="text-center text-green-600 dark:text-green-400">
        <i class="fas fa-check-circle text-3xl"></i>
        <p class="mt-2">Toutes vos absences ont été expliquées. Redirection...</p>
      </div>

      <div v-for="absence in absences" :key="absence.id" class="border dark:border-gray-700 rounded-lg p-4 mb-4">
        <p class="font-medium dark:text-white">
          Absence du <strong>{{ absence.from_date }}</strong> au <strong>{{ absence.to_date }}</strong>
        </p>
        <div class="mt-3">
          <label class="block text-sm mb-1 dark:text-gray-300">Explication *</label>
          <textarea
            v-model="forms[absence.id].explanation"
            rows="3" required
            class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white"
            placeholder="Raison de l'absence..."
          ></textarea>
        </div>
        <div class="mt-2">
          <label class="block text-sm mb-1 dark:text-gray-300">Justificatif (optionnel, PDF/JPG/PNG)</label>
          <input type="file" @change="handleFile($event, absence.id)" accept=".pdf,.jpg,.jpeg,.png" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" />
        </div>
        <button
          @click="submitExplanation(absence.id)"
          :disabled="submitting[absence.id]"
          class="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <i v-if="submitting[absence.id]" class="fas fa-spinner fa-spin"></i>
          {{ submitting[absence.id] ? 'Envoi...' : 'Soumettre' }}
        </button>
        <p v-if="success[absence.id]" class="text-green-600 dark:text-green-400 text-sm mt-1">Explication envoyée.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/api/axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import Swal from 'sweetalert2'

const auth = useAuthStore()
const router = useRouter()
const absences = ref([])
const forms = reactive({})
const submitting = reactive({})
const success = reactive({})

onMounted(async () => {
  try {
    const { data } = await api.get('/employee/unjustified-absences?status=pending')
    absences.value = data
    data.forEach(a => {
      forms[a.id] = { explanation: '', file: null }
      submitting[a.id] = false
      success[a.id] = false
    })
    if (data.length === 0) {
      auth.requiresExplanation = false
      setTimeout(() => router.push('/employee'), 2000)
    }
  } catch (e) {
    Swal.fire('Erreur', 'Impossible de charger les absences.', 'error')
  }
})

function handleFile(event, id) {
  forms[id].file = event.target.files[0]
}

async function submitExplanation(id) {
  if (!forms[id].explanation.trim()) {
    Swal.fire('Erreur', 'L\'explication est obligatoire.', 'warning')
    return
  }
  submitting[id] = true
  try {
    const payload = new FormData()
    payload.append('explanation', forms[id].explanation)
    if (forms[id].file) payload.append('justificatif', forms[id].file)
    await api.post(`/employee/unjustified-absences/${id}/explain`, payload)
    success[id] = true
    absences.value = absences.value.filter(a => a.id !== id)
    if (absences.value.length === 0) {
      auth.requiresExplanation = false
      setTimeout(() => router.push('/employee'), 2000)
    }
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  } finally {
    submitting[id] = false
  }
}
</script>