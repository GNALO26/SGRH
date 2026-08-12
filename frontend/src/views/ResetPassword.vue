<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 w-full max-w-md">
      <div class="text-center mb-6">
        <img src="/logo-sgrh.png" alt="SGRH" class="h-16 mx-auto mb-2" />
        <h1 class="text-2xl font-bold text-blue-900 dark:text-blue-400">SGRH</h1>
        <p class="text-gray-500 dark:text-gray-400">Nouveau mot de passe</p>
      </div>

      <form @submit.prevent="resetPassword">
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input v-model="email" type="email" required class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" :disabled="loading" @keydown.enter="focusNext('code')" />
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code à 6 chiffres</label>
          <input ref="codeInput" v-model="code" type="text" maxlength="6" required class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" :disabled="loading" placeholder="123456" @keydown.enter="focusNext('password')" />
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
          <div class="relative">
            <input ref="passwordInput" v-model="password" :type="showPassword ? 'text' : 'password'" required class="w-full border rounded p-2 pr-10 dark:bg-gray-700 dark:text-white" :disabled="loading" @keydown.enter="focusNext('password_confirmation')" />
            <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-3 text-gray-400 hover:text-gray-600" tabindex="-1">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer le mot de passe</label>
          <input ref="passwordConfirmationInput" v-model="password_confirmation" type="password" required class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" :disabled="loading" @keydown.enter="resetPassword" />
        </div>
        <button type="submit" :disabled="loading" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Réinitialiser</span>
        </button>
        <p v-if="message" class="mt-4 text-green-600 text-sm text-center">{{ message }}</p>
        <p v-if="error" class="mt-4 text-red-600 text-sm text-center">{{ error }}</p>
      </form>

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
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const code = ref('')
const password = ref('')
const password_confirmation = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')
const showPassword = ref(false)

// Références pour la navigation au clavier
const codeInput = ref(null)
const passwordInput = ref(null)
const passwordConfirmationInput = ref(null)

function focusNext(field) {
  if (field === 'code' && codeInput.value) codeInput.value.focus()
  else if (field === 'password' && passwordInput.value) passwordInput.value.focus()
  else if (field === 'password_confirmation' && passwordConfirmationInput.value) passwordConfirmationInput.value.focus()
}

async function resetPassword() {
  if (loading.value) return
  loading.value = true
  message.value = ''
  error.value = ''
  try {
    await api.post('/reset-password', {
      email: email.value,
      code: code.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
    })
    message.value = 'Mot de passe réinitialisé avec succès. Redirection vers la connexion...'
    setTimeout(() => router.push('/login'), 3000)
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de la réinitialisation.'
  } finally {
    loading.value = false
  }
}
</script>