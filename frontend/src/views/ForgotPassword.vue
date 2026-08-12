<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 w-full max-w-md">
      <div class="text-center mb-6">
        <img src="/logo-sgrh.png" alt="SGRH" class="h-16 mx-auto mb-2" />
        <h1 class="text-2xl font-bold text-blue-900 dark:text-blue-400">SGRH</h1>
        <p class="text-gray-500 dark:text-gray-400">Mot de passe oublié</p>
      </div>

      <form @submit.prevent="sendCode">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse email</label>
          <input
            v-model="email" type="email" required
            class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            :class="error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 dark:border-gray-600'"
            placeholder="vous@exemple.com"
            :disabled="loading"
            @keydown.enter="sendCode"
          />
        </div>
        <button
          type="submit" :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Envoyer le code</span>
        </button>
        <p v-if="message" class="mt-4 text-green-600 text-sm text-center">{{ message }}</p>
        <p v-if="error" class="mt-4 text-red-600 text-sm text-center">{{ error }}</p>
      </form>

      <div class="mt-4 text-center" v-if="codeSent">
        <router-link to="/reset-password" class="text-blue-600 hover:underline text-sm">
          J'ai reçu mon code
        </router-link>
      </div>

      <div class="mt-4 text-center">
        <router-link to="/login" class="text-blue-600 hover:underline text-sm">
          Retour à la connexion
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api/axios'

const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')
const codeSent = ref(false)

async function sendCode() {
  if (!email.value || loading.value) return
  loading.value = true
  message.value = ''
  error.value = ''
  try {
    await api.post('/forgot-password', { email: email.value })
    message.value = 'Un code à 6 chiffres a été envoyé à votre adresse email.'
    codeSent.value = true
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de l\'envoi.'
  } finally {
    loading.value = false
  }
}
</script>