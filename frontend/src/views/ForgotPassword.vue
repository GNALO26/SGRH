<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <img src="/logo-sgrh.png" alt="SGRH" class="h-14 mx-auto mb-3" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mot de passe oublié</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Saisissez votre email pour recevoir un code de réinitialisation
        </p>
      </div>

      <form @submit.prevent="sendCode">
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            :class="error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
            placeholder="vous@exemple.com"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Envoyer le code</span>
        </button>

        <p v-if="error" class="mt-4 text-center text-red-600 text-sm">{{ error }}</p>
        <p v-if="success" class="mt-4 text-center text-green-600 text-sm">{{ success }}</p>
      </form>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-sm text-blue-600 hover:underline dark:text-blue-400">
          <i class="fas fa-arrow-left mr-1"></i>Retour à la connexion
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