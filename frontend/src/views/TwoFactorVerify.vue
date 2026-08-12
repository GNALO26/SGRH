<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <img src="/logo-sgrh.png" alt="SGRH" class="h-14 mx-auto mb-3" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Vérification</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Saisissez le code que nous vous avons envoyé par email
        </p>
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
          {{ maskedEmail }}
        </p>
      </div>

      <!-- Compteur -->
      <div class="text-center mb-6">
        <span v-if="remainingSeconds > 0" class="text-sm text-gray-500 dark:text-gray-400">
          Expire dans <strong class="text-blue-600">{{ timerDisplay }}</strong>
        </span>
        <span v-else class="text-sm font-semibold text-red-500">Le code a expiré.</span>
      </div>

      <!-- Cases OTP -->
      <div class="flex justify-center gap-3 mb-6">
        <input
          v-for="(digit, index) in 6"
          :key="index"
          :ref="el => otpRefs[index] = el"
          v-model="otpValues[index]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
          :class="error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
          @input="handleOtpInput(index)"
          @keydown.backspace="handleBackspace(index)"
          @paste.prevent="handlePaste"
        />
      </div>

      <!-- Erreur -->
      <p v-if="error" class="text-center text-red-600 text-sm mb-4">{{ error }}</p>

      <!-- Bouton Envoyer -->
      <button
        @click="verifyCode"
        :disabled="loading || remainingSeconds <= 0 || !isOtpComplete"
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <i v-if="loading" class="fas fa-spinner fa-spin"></i>
        <span v-else>Envoyer</span>
      </button>

      <!-- Renvoyer -->
      <div class="mt-4 text-center">
        <button
          @click="resendCode"
          :disabled="resendCooldown > 0 || loading"
          class="text-sm text-gray-500 hover:text-blue-600 disabled:text-gray-300 transition-colors"
        >
          {{ resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer le code' }}
        </button>
      </div>

      <!-- Plus d'options -->
      <div class="mt-6 text-center relative">
        <button
          @click="showOptions = !showOptions"
          class="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <i class="fas fa-ellipsis-h mr-1"></i>Plus d'options
        </button>

        <!-- Dropdown options -->
        <div v-if="showOptions" class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-10">
          <button @click="goToLogin" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
            <i class="fas fa-sign-in-alt mr-2"></i>Retour à la connexion
          </button>
          <a href="mailto:alfredsossa17@gmail.com" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
            <i class="fas fa-headset mr-2"></i>Contacter le support
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import api from '@/api/axios'

const router = useRouter()
const auth = useAuthStore()

const email = ref(localStorage.getItem('2fa_email') || '')
const otpValues = ref(['', '', '', '', '', ''])
const otpRefs = ref([])
const loading = ref(false)
const error = ref('')
const resendCooldown = ref(0)
const showOptions = ref(false)

// Durée de vie : 2 minutes
const totalSeconds = 120
const remainingSeconds = ref(totalSeconds)
const timerDisplay = computed(() => {
  const min = Math.floor(remainingSeconds.value / 60)
  const sec = remainingSeconds.value % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
})
const isOtpComplete = computed(() => otpValues.value.every(v => v !== ''))

// Email masqué
const maskedEmail = computed(() => {
  if (!email.value) return ''
  const [name, domain] = email.value.split('@')
  const maskedName = name.length > 2 ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1] : name[0] + '*'.repeat(name.length - 1)
  return `${maskedName}@${domain}`
})

let timerInterval = null

function startTimer() {
  stopTimer()
  remainingSeconds.value = totalSeconds
  timerInterval = setInterval(() => {
    if (remainingSeconds.value > 0) remainingSeconds.value--
    else stopTimer()
  }, 1000)
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
}

// Gestion des inputs OTP
function handleOtpInput(index) {
  const val = otpValues.value[index]
  if (val && val.length === 1 && index < 5) {
    otpRefs.value[index + 1]?.focus()
  }
}

function handleBackspace(index) {
  if (otpValues.value[index] === '' && index > 0) {
    otpRefs.value[index - 1]?.focus()
  }
}

function handlePaste(e) {
  const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  if (paste.length === 6) {
    for (let i = 0; i < 6; i++) {
      otpValues.value[i] = paste[i] || ''
    }
    otpRefs.value[5]?.focus()
  }
}

// Vérification du code
async function verifyCode() {
  if (!isOtpComplete.value) return
  loading.value = true
  error.value = ''
  try {
    const code = otpValues.value.join('')
    const { data } = await api.post('/verify-2fa', { email: email.value, code })
    auth.token = data.token
    auth.user = data.user
    localStorage.setItem('token', data.token)
    localStorage.removeItem('2fa_email')
    router.push(auth.user?.role === 'admin' ? '/admin' : '/employee')
  } catch (e) {
    error.value = e.response?.data?.message || 'Code invalide ou expiré.'
    // Vider les cases
    otpValues.value = ['', '', '', '', '', '']
    otpRefs.value[0]?.focus()
  } finally {
    loading.value = false
  }
}

// Renvoyer le code
async function resendCode() {
  if (resendCooldown.value > 0) return
  try {
    await api.post('/resend-2fa', { email: email.value })
    startTimer()
    resendCooldown.value = 30
    const interval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) clearInterval(interval)
    }, 1000)
    error.value = ''
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors du renvoi.'
  }
}

function goToLogin() {
  localStorage.removeItem('2fa_email')
  router.push('/login')
}

onMounted(() => {
  if (!email.value) {
    router.push('/login')
    return
  }
  startTimer()
  nextTick(() => otpRefs.value[0]?.focus())
})

onUnmounted(() => stopTimer())
</script>