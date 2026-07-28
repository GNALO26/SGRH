<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
      
      <!-- En-tête -->
      <div class="text-center mb-6">
        <i class="fas fa-exclamation-triangle text-4xl text-yellow-500"></i>
        <h1 class="text-xl font-bold mt-2">Absences non justifiées détectées</h1>
        <p class="text-gray-500">Veuillez fournir une explication pour chaque période d'absence.</p>
      </div>

      <!-- Message quand toutes les absences sont traitées -->
      <div v-if="loading" class="text-center text-gray-500 py-6">
        <i class="fas fa-circle-notch fa-spin text-3xl text-blue-600"></i>
        <p class="mt-2">Chargement de vos absences...</p>
      </div>

      <div v-else-if="absences.length === 0" class="text-center text-green-600 py-4">
        <i class="fas fa-check-circle text-4xl"></i>
        <p class="mt-2 font-medium">Toutes vos absences ont été expliquées. Redirection en cours...</p>
      </div>

      <!-- Liste des absences à justifier -->
      <div 
        v-else 
        v-for="absence in absences" 
        :key="absence.id" 
        class="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm"
      >
        <p class="font-medium text-gray-800">
          Absence du <strong class="text-black">{{ formatDate(absence.from_date) }}</strong> au <strong class="text-black">{{ formatDate(absence.to_date) }}</strong>
        </p>
        
        <!-- Champs Explication -->
        <div class="mt-3">
          <label :for="`exp-${absence.id}`" class="block text-sm font-medium text-gray-700 mb-1">
            Explication <span class="text-red-500">*</span>
          </label>
          <textarea
            :id="`exp-${absence.id}`"
            v-if="forms[absence.id]"
            v-model="forms[absence.id].explanation"
            rows="3"
            required
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Raison de votre absence..."
          ></textarea>
        </div>

        <!-- Pièce jointe / Justificatif -->
        <div class="mt-3">
          <label :for="`file-${absence.id}`" class="block text-sm font-medium text-gray-700 mb-1">
            Justificatif (optionnel, PDF/JPG/PNG)
          </label>
          <input
            :id="`file-${absence.id}`"
            type="file"
            @change="handleFile($event, absence.id)"
            accept=".pdf,.jpg,.jpeg,.png"
            class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border rounded-lg p-1"
          />
        </div>

        <!-- Bouton d'envoi -->
        <div class="mt-4 flex items-center justify-between">
          <button
            type="button"
            @click="submitExplanation(absence.id)"
            :disabled="submitting[absence.id] || !forms[absence.id]?.explanation?.trim()"
            class="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
          >
            <i v-if="submitting[absence.id]" class="fas fa-spinner fa-spin mr-2"></i>
            {{ submitting[absence.id] ? 'Envoi en cours...' : 'Soumettre' }}
          </button>

          <span v-if="success[absence.id]" class="text-green-600 text-sm font-medium flex items-center">
            <i class="fas fa-check mr-1"></i> Explication envoyée.
          </span>
        </div>
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
const loading = ref(true)
const forms = reactive({})
const submitting = reactive({})
const success = reactive({})

// Formater l'affichage de la date
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('fr-FR')
}

// Récupération des absences non justifiées
onMounted(async () => {
  loading.value = true
  try {
    const { data } = await api.get('/employee/unjustified-absences?status=pending')
    absences.value = data || []
    
    // Initialisation réactive pour chaque absence récupérée
    absences.value.forEach(a => {
      forms[a.id] = { explanation: '', file: null }
      submitting[a.id] = false
      success[a.id] = false
    })

    if (absences.value.length === 0) {
      auth.requiresExplanation = false
      setTimeout(() => router.push('/employee'), 2000)
    }
  } catch (e) {
    Swal.fire({
      title: 'Erreur',
      text: 'Impossible de charger vos absences non justifiées.',
      icon: 'error',
      confirmButtonText: 'D'accord'
    })
  } finally {
    loading.value = false
  }
})

// Gestion du fichier joint
function handleFile(event, id) {
  const file = event.target.files[0] || null
  if (forms[id]) {
    forms[id].file = file
  }
}

// Soumission de l'explication
async function submitExplanation(id) {
  const explanationText = forms[id]?.explanation?.trim()

  if (!explanationText) {
    Swal.fire('Attention', 'L\'explication est obligatoire.', 'warning')
    return
  }

  submitting[id] = true
  
  try {
    const payload = new FormData()
    payload.append('explanation', explanationText)
    if (forms[id].file) {
      payload.append('justificatif', forms[id].file)
    }

    await api.post(`/employee/unjustified-absences/${id}/explain`, payload, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      }
    })

    success[id] = true

    // Retirer l'absence traitée de la liste
    absences.value = absences.value.filter(a => a.id !== id)
    
    // Nettoyer les objets réactifs
    delete forms[id]
    delete submitting[id]
    delete success[id]

    // Redirection si plus aucune absence restante
    if (absences.value.length === 0) {
      auth.requiresExplanation = false
      setTimeout(() => router.push('/employee'), 2000)
    }
  } catch (e) {
    const message = e.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de votre explication.'
    Swal.fire('Erreur', message, 'error')
  } finally {
    if (submitting[id] !== undefined) {
      submitting[id] = false
    }
  }
}
</script>