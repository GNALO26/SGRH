<template>
  <div class="page-container">
    <div class="card">
      <div class="logo">
        <img src="/logo-sgrh.png" alt="SGRH" />
      </div>
      <h1 class="title">Mot de passe oublié</h1>
      <p class="instruction">Saisissez votre email pour recevoir un code de réinitialisation</p>

      <form @submit.prevent="sendCode" class="form">
        <div class="form-group">
          <label class="label">Adresse email</label>
          <input
            v-model="email"
            type="email"
            required
            class="input"
            :class="error ? 'input-error' : ''"
            placeholder="vous@exemple.com"
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Envoyer le code</span>
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

.input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.input-error {
  border-color: #ef4444;
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