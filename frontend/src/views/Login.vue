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
          <input v-model="email" type="email" required class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" placeholder="vous@exemple.com" />
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
          <input v-model="password" type="password" required class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" placeholder="••••••••" />
        </div>
        <button type="submit" :disabled="loading" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Se connecter</span>
        </button>
        <p v-if="error" class="mt-4 text-red-600 text-sm text-center">{{ error }}</p>
        <p v-if="successMessage" class="mt-4 text-green-600 text-sm text-center">{{ successMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('alfredsossa17@gmail.com')
const password = ref('SGRHpro2026JONAO')
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const response = await fetch('https://sgrh-x7a8.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || 'Erreur serveur')
    }

    const data = await response.json()
    successMessage.value = 'Connexion réussie ! Token reçu : ' + data.token.substring(0, 20) + '...'
    console.log('Réponse fetch :', data)

    // Stocker le token (test)
    localStorage.setItem('token', data.token)

    // Rediriger (si tu veux tester la redirection, décommente)
    // router.push('/admin')
  } catch (e) {
    console.error('Erreur fetch:', e)
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>