<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <img src="/logo-sgrh.png" alt="SGRH" class="h-14 mx-auto mb-3" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Nouveau mot de passe</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Saisissez le code reçu par email et votre nouveau mot de passe
        </p>
      </div>

      <form @submit.prevent="resetPassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            :class="error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code à 6 chiffres</label>
          <input
            v-model="code"
            type="text"
            maxlength="6"
            inputmode="numeric"
            required
            class="w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            :class="error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
            placeholder="000000"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
              :class="error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
              placeholder="••••••••"
            />
            <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabindex="-1">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer le mot de passe</label>
          <div class="relative">
            <input
              v-model="passwordConfirmation"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
              :class="error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
              placeholder="••••••••"
            />
            <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabindex="-1">
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Réinitialiser</span>
        </button>

        <p v-if="error" class="text-center text-red-600 text-sm">{{ error }}</p>
        <p v-if="success" class="text-center text-green-600 text-sm">{{ success }}</p>
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