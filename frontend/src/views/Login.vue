<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 w-full max-w-md">
      <div class="text-center mb-6">
        <img src="/logo-sgrh.png" alt="SGRH" class="h-16 mx-auto mb-2" />
        <h1 class="text-2xl font-bold text-blue-900 dark:text-blue-300">SGRH</h1>
        <p class="text-gray-500 dark:text-gray-400">Connexion au système</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="kamalsanous@gmail.com"
          />
        </div>
        <div class="mb-6 relative">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            class="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="••••••••"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
            tabindex="-1"
          >
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Se connecter</span>
        </button>
        <p v-if="error" class="mt-4 text-red-600 dark:text-red-400 text-sm text-center">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    const data = await auth.login({ email: email.value, password: password.value })
    if (data.user.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/employee')
    }
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur de connexion. Vérifiez vos identifiants.'
  } finally {
    loading.value = false
  }
}
</script>