<template>
  <div>
    <button
      @click="handleCheckIn"
      :disabled="isLoading || isBefore6h30"
      class="w-full py-3 px-6 rounded-lg text-white font-bold text-lg transition flex items-center justify-center gap-2"
      :class="buttonClass"
    >
      <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
      <i v-else class="fas fa-fingerprint"></i>
      {{ isLoading ? 'Vérification...' : 'Marquer ma présence' }}
    </button>
    <p v-if="errorMsg" class="text-red-600 mt-2 text-sm">{{ errorMsg }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGeolocation } from '@/composables/useGeolocation'
import { useSweetAlert } from '@/composables/useSweetAlert'
import api from '@/api/axios'

const emit = defineEmits(['success'])

const { latitude, longitude, error: geoError, getPosition } = useGeolocation()
const { showSuccess, showError, showPrompt } = useSweetAlert()

const isLoading = ref(false)
const errorMsg = ref('')
const isBefore6h30 = ref(false)

onMounted(() => {
  const now = new Date()
  const minHour = 6
  const minMinute = 30
  isBefore6h30.value = now.getHours() < minHour || (now.getHours() === minHour && now.getMinutes() < minMinute)
})

const buttonClass = computed(() => {
  if (isLoading.value || isBefore6h30.value) return 'bg-gray-400 cursor-not-allowed'
  return 'bg-blue-600 hover:bg-blue-700'
})

const welcomeMessages = [
  "Bonjour et bienvenue ! Nous vous souhaitons une excellente journée de travail.",
  "Bienvenue ! Que cette journée soit productive et agréable.",
  "Bonjour ! Merci d'être présent aujourd'hui, belle journée à vous.",
  "Bienvenue au travail ! Votre présence est appréciée.",
]

function speakMessage() {
  if (!window.speechSynthesis) return
  const msg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
  const utterance = new SpeechSynthesisUtterance(msg)
  utterance.lang = 'fr-FR'
  utterance.rate = 1.0
  speechSynthesis.speak(utterance)
}

async function handleCheckIn() {
  isLoading.value = true
  errorMsg.value = ''

  try {
    await getPosition()
    if (geoError.value) {
      await showError('Erreur de géolocalisation', geoError.value)
      return
    }

    const payload = { latitude: latitude.value, longitude: longitude.value }
    const { data } = await api.post('/employee/attendance', payload)

    emit('success')
    speakMessage()

    if (data.status === 'on_time') {
      await showSuccess('Présence enregistrée', 'Vous êtes arrivé à l\'heure.')
    } else if (data.status === 'late') {
      await showSuccess('Présence enregistrée', `Vous avez ${data.late_minutes} minutes de retard.`)
    } else if (data.status === 'authorized') {
      await showSuccess('Présence enregistrée (retard autorisé)')
    } else {
      await showSuccess('Présence enregistrée')
    }

  } catch (err) {
    if (err.response?.data?.requires_justification) {
      const { value: justification } = await showPrompt(
        'Grand retard détecté',
        'Veuillez justifier votre retard :',
        'Raison du retard...'
      )

      if (justification) {
        try {
          await api.post('/employee/attendance', {
            latitude: latitude.value,
            longitude: longitude.value,
            justification
          })
          emit('success')
          speakMessage()
          await showSuccess('Présence enregistrée avec justification')
        } catch (secondErr) {
          errorMsg.value = secondErr.response?.data?.message || 'Erreur lors de l\'enregistrement.'
          await showError('Erreur', errorMsg.value)
        }
      }
    } else if (err.response?.data?.message) {
      errorMsg.value = err.response.data.message
      await showError('Pointage impossible', errorMsg.value)
    } else {
      errorMsg.value = 'Erreur de connexion au serveur.'
      await showError('Erreur', errorMsg.value)
    }
  } finally {
    isLoading.value = false
  }
}
</script>