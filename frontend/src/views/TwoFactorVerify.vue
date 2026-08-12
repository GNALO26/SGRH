<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 w-full max-w-md">
      <div class="text-center mb-6">
        <img src="/logo-sgrh.png" alt="SGRH" class="h-16 mx-auto mb-2" />
        <h1 class="text-2xl font-bold text-blue-900 dark:text-blue-400">SGRH</h1>
        <p class="text-gray-500 dark:text-gray-400">Vérification en deux étapes</p>
      </div>

      <p class="text-center text-gray-600 dark:text-gray-300 mb-6">
        Un code à 6 chiffres a été envoyé à <strong>{{ email }}</strong>.
        <br />
        <span v-if="remainingSeconds > 0" class="text-sm">
          Il expire dans <strong>{{ timerDisplay }}</strong>.
        </span>
        <span v-else class="text-red-500 font-semibold">Le code a expiré.</span>
      </p>

      <form @submit.prevent="verifyCode">
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code de vérification</label>
          <input
            v-model="code"
            type="text"
            maxlength="6"
            inputmode="numeric"
            pattern="\d{6}"
            required
            class="w-full px-4 py-2 text-center text-2xl tracking-widest border rounded-lg dark:bg-gray-700 dark:text-white"
            :class="error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
            placeholder="000000"
          />
        </div>

        <button
          type="submit"
          :disabled="loading || remainingSeconds <= 0"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Vérifier</span>
        </button>

        <p v-if="error" class="mt-4 text-red-600 text-sm text-center">{{ error }}</p>
      </form>

      <div class="mt-6 text-center">
        <button
          @click="resendCode"
          :disabled="resendCooldown > 0 || loading"
          class="text-blue-600 hover:underline text-sm disabled:text-gray-400"
        >
          {{ resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer le code' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import api from '@/api/axios'

const router = useRouter()
const auth = useAuthStore()
const email = ref(localStorage.getItem('2fa_email') || '')

const code = ref('')
const loading = ref(false)
const error = ref('')
const resendCooldown = ref(0)

// Durée de vie du code : 2 minutes = 120 secondes
const totalSeconds = 120
const remainingSeconds = ref(totalSeconds)

// Affichage formaté mm:ss
const timerDisplay = computed(() => {
  const min = Math.floor(remainingSeconds.value / 60)
  const sec = remainingSeconds.value % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
})

let timerInterval = null

// Décrémenter le compteur chaque seconde
function startTimer() {
  stopTimer()
  timerInterval = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--
    } else {
      stopTimer()
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

onMounted(() => {
  if (!email.value) {
    router.push('/login')
    return
  }
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})

async function verifyCode() {
  if (!code.value || code.value.length !== 6) {
    error.value = 'Veuillez entrer un code à 6 chiffres.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.post('/verify-2fa', {
      email: email.value,
      code: code.value,
    })

    auth.token = data.token
    auth.user = data.user
    localStorage.setItem('token', data.token)
    localStorage.removeItem('2fa_email')
    router.push(auth.user?.role === 'admin' ? '/admin' : '/employee')
  } catch (e) {
    error.value = e.response?.data?.message || 'Code invalide ou expiré.'
  } finally {
    loading.value = false
  }
}

async function resendCode() {
  if (resendCooldown.value > 0) return
  try {
    await api.post('/resend-2fa', { email: email.value })
    // Réinitialiser le compteur
    remainingSeconds.value = totalSeconds
    startTimer()
    // Cooldown de 30 secondes pour éviter le spam
    resendCooldown.value = 30
    const cooldownInterval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) clearInterval(cooldownInterval)
    }, 1000)
    error.value = ''
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors du renvoi.'
  }
}
</script>