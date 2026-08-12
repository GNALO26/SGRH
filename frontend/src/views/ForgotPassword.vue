<template>
  <div class="forgot-page">
    <div class="forgot-card">
      <h1 class="forgot-title">Mot de passe oublié</h1>
      <p class="forgot-subtitle">Saisissez votre email pour recevoir un code de réinitialisation</p>

      <form @submit.prevent="sendCode">
        <input
          v-model="email"
          type="email"
          required
          class="forgot-input"
          placeholder="vous@exemple.com"
        />
        <button type="submit" :disabled="loading" class="forgot-btn">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Envoyer le code</span>
        </button>
        <p v-if="error" class="forgot-error">{{ error }}</p>
        <p v-if="success" class="forgot-success">{{ success }}</p>
      </form>

      <router-link to="/login" class="forgot-link">
        <i class="fas fa-arrow-left mr-1"></i>Retour à la connexion
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api/axios'

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

async function sendCode() {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    await api.post('/forgot-password', { email: email.value })
    success.value = 'Un code de réinitialisation a été envoyé à votre adresse email.'
    email.value = ''
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de l\'envoi.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  padding: 20px;
}

.forgot-card {
  background: #ffffff;
  max-width: 480px;
  width: 100%;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.10);
  text-align: center;
}

.forgot-title {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 8px 0;
}

.forgot-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.forgot-input {
  width: 100%;
  padding: 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  background: #f9fafb;
  outline: none;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}

.forgot-input:focus {
  border-color: #2563eb;
}

.forgot-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 9999px;
  background-color: #2563eb;
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
}

.forgot-btn:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.forgot-btn:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.forgot-error {
  color: #ef4444;
  font-size: 14px;
  margin-top: 12px;
}

.forgot-success {
  color: #10b981;
  font-size: 14px;
  margin-top: 12px;
}

.forgot-link {
  display: inline-block;
  margin-top: 24px;
  color: #2563eb;
  font-size: 14px;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}
</style>