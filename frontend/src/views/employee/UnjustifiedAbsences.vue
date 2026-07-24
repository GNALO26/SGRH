<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-primary">Mes absences non justifiées</h1>

    <div v-if="loading" class="text-center py-10">
      <i class="fas fa-spinner fa-spin text-3xl text-accent"></i>
      <p class="mt-2 text-muted">Chargement...</p>
    </div>

    <div v-else-if="absences.length === 0" class="bg-card rounded-xl shadow-custom p-6 text-center text-muted">
      <i class="fas fa-check-circle text-3xl text-success"></i>
      <p class="mt-2">Aucune absence non justifiée.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="absence in absences" :key="absence.id" class="bg-card rounded-xl shadow-custom p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-semibold text-lg text-primary">Absence du <strong>{{ absence.from_date }}</strong> au <strong>{{ absence.to_date }}</strong></p>
            <p class="text-sm text-muted">
              Statut : <span :class="absence.status === 'pending' ? 'text-warning' : 'text-success'">
                {{ absence.status === 'pending' ? 'En attente d\'explication' : 'Explication soumise' }}
              </span>
            </p>
            <p v-if="absence.explanation" class="mt-2 text-secondary">
              <span class="font-medium">Votre explication :</span> {{ absence.explanation }}
            </p>
            <a v-if="absence.justificatif_url" :href="absence.justificatif_url" target="_blank" class="text-accent hover:underline text-sm">
              <i class="fas fa-paperclip mr-1"></i> Voir le justificatif
            </a>
          </div>
        </div>

        <div v-if="absence.status === 'pending'" class="mt-4 border-t border-custom pt-4">
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1 text-primary">Explication *</label>
            <textarea v-model="forms[absence.id].explanation" rows="3" required class="w-full border border-custom rounded p-2 bg-card text-primary" placeholder="Raison de l'absence..."></textarea>
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1 text-primary">Justificatif (optionnel, PDF/JPG/PNG)</label>
            <input type="file" @change="handleFile($event, absence.id)" accept=".pdf,.jpg,.jpeg,.png" class="w-full border border-custom rounded p-2 bg-card text-primary" />
          </div>
          <button @click="submitExplanation(absence.id)" :disabled="submitting[absence.id]" class="bg-accent text-white px-4 py-2 rounded hover:bg-accent-hover disabled:opacity-50">
            <i v-if="submitting[absence.id]" class="fas fa-spinner fa-spin mr-1"></i>
            {{ submitting[absence.id] ? 'Envoi...' : 'Soumettre l\'explication' }}
          </button>
          <p v-if="success[absence.id]" class="text-success text-sm mt-2">Explication envoyée avec succès.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const absences = ref([])
const loading = ref(true)
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
  } catch (e) {
    Swal.fire('Erreur', 'Impossible de charger les absences.', 'error')
  } finally { loading.value = false }
})

function handleFile(event, id) { forms[id].file = event.target.files[0] }

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
    await api.post(`/employee/unjustified-absences/${id}/explain`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    success[id] = true
    const updated = absences.value.find(a => a.id === id)
    if (updated) { updated.status = 'explained'; updated.explanation = forms[id].explanation }
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  } finally { submitting[id] = false }
}
</script>