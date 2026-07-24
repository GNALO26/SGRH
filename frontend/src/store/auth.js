import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    requiresExplanation: false,
    pendingAbsences: [],
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role,
  },
  actions: {
    async login(credentials) {
      try {
        const { data } = await api.post('/login', credentials)
        // Vérifier que les données nécessaires sont présentes
        if (!data.token || !data.user) {
          throw new Error('Réponse invalide du serveur')
        }
        this.token = data.token
        this.user = data.user
        this.requiresExplanation = data.requires_explanation
        this.pendingAbsences = data.pending_absences
        localStorage.setItem('token', data.token)
        return data
      } catch (error) {
        // Si l'erreur vient d'une réponse API (ex: 422, 401)
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
        // Si c'est notre propre erreur (jetée ci-dessus)
        throw error
      }
    },
    async fetchUser() {
      const { data } = await api.get('/me')
      this.user = data
    },
    logout() {
      this.token = null
      this.user = null
      this.requiresExplanation = false
      this.pendingAbsences = []
      localStorage.removeItem('token')
    }
  }
})