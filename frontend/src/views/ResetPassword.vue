<template>
  <div class="page-container">
    <div class="card">
      <div class="logo">
        <img src="/logo-sgrh.png" alt="SGRH" />
      </div>
      <h1 class="title">Nouveau mot de passe</h1>
      <p class="instruction">Saisissez le code reçu par email et votre nouveau mot de passe</p>

      <form @submit.prevent="resetPassword" class="form">
        <div class="form-group">
          <label class="label">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="input"
            :class="error ? 'input-error' : ''"
          />
        </div>

        <div class="form-group">
          <label class="label">Code à 6 chiffres</label>
          <input
            v-model="code"
            type="text"
            maxlength="6"
            inputmode="numeric"
            required
            class="input code-input"
            :class="error ? 'input-error' : ''"
            placeholder="000000"
          />
        </div>

        <div class="form-group">
          <label class="label">Nouveau mot de passe</label>
          <div class="password-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="input"
              :class="error ? 'input-error' : ''"
              placeholder="••••••••"
            />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword" tabindex="-1">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="label">Confirmer le mot de passe</label>
          <div class="password-wrapper">
            <input
              v-model="passwordConfirmation"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="input"
              :class="error ? 'input-error' : ''"
              placeholder="••••••••"
            />
            <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword" tabindex="-1">
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Réinitialiser</span>
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">{{ success }}</p>
      </form>

      <div class="back-link">
        <router-link to="/login">Retour à la connexion</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const router = useRouter()
const email = ref('')
const code = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

async function resetPassword() {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    await api.post('/reset-password', {
      email: email.value,
      code: code.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    success.value = 'Mot de passe réinitialisé avec succès.'
    setTimeout(() => router.push('/login'), 2000)
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de la réinitialisation.'
  } finally {
    loading.value = false
  }
}
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

.title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.instruction {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.form {
  text-align: left;
}

.form-group {
  margin-bottom: 20px;
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.code-input {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.5em;
  font-family: monospace;
}

.input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.input-error {
  border-color: #ef4444;
}

.password-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
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

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-top: 12px;
}

.success-message {
  color: #10b981;
  font-size: 14px;
  margin-top: 12px;
}

.back-link {
  margin-top: 24px;
  text-align: center;
}

.back-link a {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
}

.back-link a:hover {
  text-decoration: underline;
}
</style>