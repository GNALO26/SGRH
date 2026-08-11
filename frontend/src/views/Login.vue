<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 w-full max-w-md">
      <div class="text-center mb-6">
        <img src="/logo-sgrh.png" alt="SGRH" class="h-16 mx-auto mb-2" />
        <h1 class="text-2xl font-bold text-blue-900 dark:text-blue-400">SGRH</h1>
        <p class="text-gray-500 dark:text-gray-400">Connexion au système</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            :class="error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
            placeholder="vous@exemple.com"
          />
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
          <PasswordInput v-model="password" required placeholder="••••••••" />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Se connecter</span>
        </button>
        <p v-if="error" class="mt-4 text-red-600 text-sm text-center">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import PasswordInput from '@/components/ui/PasswordInput.vue'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    const result = await authStore.login({ email: email.value, password: password.value })

    if (result.requires2FA) {
      localStorage.setItem('2fa_email', result.email)
      router.push('/verify-2fa')
      return
    }

    router.push(authStore.user?.role === 'admin' ? '/admin' : '/employee')
  } catch (e) {
    console.error('Erreur login:', e)
    if (e.response?.data?.message) {
      error.value = e.response.data.message
    } else if (e.message === 'Network Error') {
      error.value = 'Erreur réseau. Vérifiez votre connexion ou contactez l\'administrateur.'
    } else {
      error.value = 'Erreur de connexion. Vérifiez vos identifiants.'
    }
  } finally {
    loading.value = false
  }
}
</script>