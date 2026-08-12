<template>
  <div class="reset-page">
    <div class="reset-card">
      <h1 class="reset-title">Nouveau mot de passe</h1>
      <p class="reset-subtitle">Saisissez le code reçu et votre nouveau mot de passe</p>

      <form @submit.prevent="resetPassword" class="reset-form">
        <div class="reset-field">
          <label>Email</label>
          <input v-model="email" type="email" required />
        </div>
        <div class="reset-field">
          <label>Code à 6 chiffres</label>
          <input v-model="code" type="text" maxlength="6" inputmode="numeric" required />
        </div>
        <div class="reset-field">
          <label>Nouveau mot de passe</label>
          <div class="relative">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" required />
            <button type="button" @click="showPassword = !showPassword" class="eye-btn">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        <div class="reset-field">
          <label>Confirmer le mot de passe</label>
          <div class="relative">
            <input v-model="passwordConfirmation" :type="showConfirmPassword ? 'text' : 'password'" required />
            <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="eye-btn">
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <button type="submit" :disabled="loading" class="reset-btn">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Réinitialiser</span>
        </button>

        <p v-if="error" class="reset-error">{{ error }}</p>
        <p v-if="success" class="reset-success">{{ success }}</p>
      </form>

      <router-link to="/login" class="reset-link">
        <i class="fas fa-arrow-left mr-1"></i>Retour à la connexion
      </router-link>
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
.reset-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  padding: 20px;
}

.reset-card {
  background: #ffffff;
  max-width: 480px;
  width: 100%;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.10);
  text-align: center;
}

.reset-title {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 8px 0;
}

.reset-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.reset-field {
  text-align: left;
  margin-bottom: 16px;
}

.reset-field label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.reset-field input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  background: #f9fafb;
  outline: none;
  transition: border-color 0.2s;
}

.reset-field input:focus {
  border-color: #2563eb;
  background: #ffffff;
}

.relative {
  position: relative;
}

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
}

.reset-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 9999px;
  background-color: #2563eb;
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  margin-top: 8px;
}

.reset-btn:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.reset-btn:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.reset-error {
  color: #ef4444;
  font-size: 14px;
  margin-top: 12px;
}

.reset-success {
  color: #10b981;
  font-size: 14px;
  margin-top: 12px;
}

.reset-link {
  display: inline-block;
  margin-top: 24px;
  color: #2563eb;
  font-size: 14px;
  text-decoration: none;
}

.reset-link:hover {
  text-decoration: underline;
}
</style>