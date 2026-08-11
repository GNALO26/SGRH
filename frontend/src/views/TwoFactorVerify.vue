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
        Il expire dans <strong>{{ timerDisplay }}</strong>.
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
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
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

// Compteur d'expiration (2 minutes)
const expiresAt = ref(Date.now() + 120 * 1000)
const timerDisplay = computed(() => {
  const diff = Math.max(0, Math.floor((expiresAt.value - Date.now()) / 1000))
  const min = Math.floor(diff / 60)
  const sec = diff % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
})

let timer = null

onMounted(() => {
  if (!email.value) {
    router.push('/login')
    return
  }
  timer = setInterval(() => {
    // force la réactivité
    expiresAt.value = Date.now() + 120 * 1000 - (120 * 1000 - (expiresAt.value - Date.now()))
  }, 1000)
})

onUnmounted(() => clearInterval(timer))

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
    expiresAt.value = Date.now() + 120 * 1000
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
</script>