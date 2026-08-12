<template>
  <div class="otp-page">
    <div class="otp-card">
      <!-- Titre -->
      <h1 class="otp-title">Saisissez le code que nous vous avons envoyé par email</h1>
      <!-- Email masqué -->
      <p class="otp-email">{{ maskedEmail }}</p>

      <!-- Timer -->
      <p class="otp-timer">
        <span v-if="remainingSeconds > 0">Expire dans <strong>{{ timerDisplay }}</strong></span>
        <span v-else class="text-red-500">Le code a expiré</span>
      </p>

      <!-- Champs OTP -->
      <div class="otp-inputs">
        <input
          v-for="(digit, index) in 6"
          :key="index"
          :ref="el => otpRefs[index] = el"
          v-model="otpValues[index]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="otp-input"
          :class="{ 'otp-input--error': error }"
          @input="handleOtpInput(index)"
          @keydown.backspace="handleBackspace(index)"
          @paste.prevent="handlePaste"
        />
      </div>

      <!-- Lien Renvoyer -->
      <button
        @click="resendCode"
        :disabled="resendCooldown > 0 || loading"
        class="otp-resend"
      >
        {{ resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer' }}
      </button>

      <!-- Erreur -->
      <p v-if="error" class="otp-error">{{ error }}</p>

      <!-- Boutons d'action -->
      <button
        @click="verifyCode"
        :disabled="loading || remainingSeconds <= 0 || !isOtpComplete"
        class="otp-btn-primary"
      >
        <i v-if="loading" class="fas fa-spinner fa-spin"></i>
        <span v-else>Envoyer</span>
      </button>

      <button
        @click="showOptions = !showOptions"
        class="otp-btn-secondary"
      >
        Plus d'options
      </button>

      <!-- Dropdown Plus d'options -->
      <div v-if="showOptions" class="otp-options">
        <button @click="goToLogin" class="otp-option-item">Retour à la connexion</button>
        <a href="mailto:alfredsossa17@gmail.com" class="otp-option-item">Contacter le support</a>
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

const totalSeconds = 120
const remainingSeconds = ref(totalSeconds)
const timerDisplay = computed(() => {
  const min = Math.floor(remainingSeconds.value / 60)
  const sec = remainingSeconds.value % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
})
const isOtpComplete = computed(() => otpValues.value.every(v => v !== ''))

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
    otpValues.value = ['', '', '', '', '', '']
    otpRefs.value[0]?.focus()
  } finally {
    loading.value = false
  }
}

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

<style scoped>
.otp-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  padding: 20px;
}

.otp-card {
  background: #ffffff;
  max-width: 480px;
  width: 100%;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.10);
  text-align: center;
}

.otp-title {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.otp-email {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
}

.otp-timer {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px 0;
}

.otp-inputs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.otp-input {
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  border: 2px solid transparent;
  border-radius: 12px;
  background: #f9fafb;
  color: #111827;
  outline: none;
  transition: all 0.2s;
}

.otp-input:focus {
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.otp-input--error {
  border-color: #ef4444 !important;
}

.otp-resend {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
  margin-bottom: 20px;
}

.otp-resend:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.otp-error {
  color: #ef4444;
  font-size: 14px;
  margin-bottom: 16px;
}

.otp-btn-primary,
.otp-btn-secondary {
  display: block;
  width: 100%;
  padding: 14px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
}

.otp-btn-primary {
  background-color: #2563eb;
  color: #ffffff;
  border: none;
}

.otp-btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.otp-btn-primary:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.otp-btn-secondary {
  background-color: #ffffff;
  color: #2563eb;
  border: 1px solid #d1d5db;
}

.otp-btn-secondary:hover {
  background-color: #f3f4f6;
}

.otp-options {
  position: relative;
  margin-top: 8px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  padding: 8px;
}

.otp-option-item {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 10px 16px;
  font-size: 14px;
  color: #374151;
  text-decoration: none;
  cursor: pointer;
  border-radius: 8px;
}

.otp-option-item:hover {
  background-color: #f3f4f6;
}
</style>