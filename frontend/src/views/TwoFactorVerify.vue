<template>
  <div class="page-container">
    <div class="card">
      <!-- Logo SGRH -->
      <div class="logo">
        <img src="/logo-sgrh.png" alt="SGRH" />
      </div>

      <!-- Texte principal -->
      <p class="instruction">
        Saisissez le code que nous vous avons envoyé par email
      </p>

      <!-- Email masqué -->
      <p class="email-masked">{{ maskedEmail }}</p>

      <!-- Timer -->
      <p class="timer">
        <span v-if="remainingSeconds > 0">Expire dans <strong>{{ timerDisplay }}</strong></span>
        <span v-else>Le code a expiré</span>
      </p>

      <!-- Champ OTP unique -->
      <input
        ref="otpInput"
        v-model="code"
        type="text"
        inputmode="numeric"
        maxlength="6"
        autocomplete="one-time-code"
        placeholder="000000"
        class="otp-input"
        :class="error ? 'otp-input-error' : ''"
        @input="handleCodeInput"
        @paste.prevent="handlePaste"
      />

      <!-- Message d'erreur -->
      <p v-if="error" class="error-message">{{ error }}</p>

      <!-- Bouton Envoyer -->
      <button
        class="btn-primary"
        :disabled="loading || remainingSeconds <= 0 || !isOtpComplete"
        @click="verifyCode"
      >
        <i v-if="loading" class="fas fa-spinner fa-spin"></i>
        <span v-else>Envoyer</span>
      </button>

      <!-- Renvoyer -->
      <button
        class="btn-secondary"
        :disabled="resendCooldown > 0 || loading"
        @click="resendCode"
      >
        {{ resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer le code' }}
      </button>

      <!-- Plus d'options -->
      <div class="options-container">
        <button class="options-toggle" @click="showOptions = !showOptions">… Plus d'options</button>
        <div v-if="showOptions" class="options-dropdown">
          <button class="dropdown-item" @click="goToLogin">Retour à la connexion</button>
          <a class="dropdown-item" href="mailto:alfredsossa17@gmail.com">Contacter le support</a>
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
const code = ref('')
const otpInput = ref(null)
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

const isOtpComplete = computed(() => code.value.length === 6)

const maskedEmail = computed(() => {
  if (!email.value) return ''
  const [name, domain] = email.value.split('@')
  const maskedName = name.length > 2
    ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
    : name[0] + '*'.repeat(name.length - 1)
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
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function handleCodeInput() {
  code.value = code.value.replace(/\D/g, '').slice(0, 6)
}

function handlePaste(e) {
  const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  code.value = paste
}

async function verifyCode() {
  if (!isOtpComplete.value) return
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.post('/verify-2fa', { email: email.value, code: code.value })
    auth.token = data.token
    auth.user = data.user
    localStorage.setItem('token', data.token)
    localStorage.removeItem('2fa_email')
    router.push(auth.user?.role === 'admin' ? '/admin' : '/employee')
  } catch (e) {
    error.value = e.response?.data?.message || 'Code invalide ou expiré.'
    code.value = ''
    otpInput.value?.focus()
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
  nextTick(() => otpInput.value?.focus())
})

onUnmounted(() => stopTimer())
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  padding: 20px;
}

.card {
  background: #ffffff;
  max-width: 480px;
  width: 100%;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.10);
  text-align: center;
}

.logo img {
  height: 50px;
  margin-bottom: 20px;
}

.instruction {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.email-masked {
  font-size: 14px;
  color: #374151;
  margin: 0 0 16px 0;
}

.timer {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.timer strong {
  color: #2563eb;
}

.otp-input {
  width: 280px;
  height: 56px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 1.5em;
  text-indent: 1.5em;
  font-family: monospace;
  border: 2px solid #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
  color: #111827;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  margin-bottom: 24px;
}

.otp-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.otp-input-error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.btn-primary {
  width: 100%;
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-primary:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.btn-secondary {
  width: 100%;
  background: transparent;
  border: 1px solid #2563eb;
  color: #2563eb;
  border-radius: 8px;
  padding: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 12px;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #eff6ff;
}

.btn-secondary:disabled {
  border-color: #d1d5db;
  color: #d1d5db;
  cursor: not-allowed;
}

.options-container {
  position: relative;
  margin-top: 24px;
}

.options-toggle {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
}

.options-dropdown {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 8px;
  min-width: 200px;
}

.dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 8px 12px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  border-radius: 8px;
  text-decoration: none;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}
</style>