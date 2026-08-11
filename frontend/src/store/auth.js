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
    isAuthenticated: (state) => !!state.token && !!state.user,
    userRole: (state) => state.user?.role,
  },
  actions: {
    async login(credentials) {
      const { data } = await api.post('/login', credentials)
      // Si la réponse contient requires_2fa, on ne stocke pas le token
      if (data.requires_2fa) {
        localStorage.setItem('2fa_email', data.email)
        return { requires2FA: true, email: data.email }
      }
      // Sinon, connexion classique
      this.token = data.token
      this.user = data.user
      this.requiresExplanation = data.requires_explanation || false
      this.pendingAbsences = data.pending_absences || []
      localStorage.setItem('token', data.token)
      return data
    },
    async fetchUser() {
      const { data } = await api.get('/me')
      this.user = data
    },
    async checkAuth() {
      if (!this.token) { this.logout(); return false }
      try {
        await this.fetchUser()
        return true
      } catch (e) {
        this.logout()
        return false
      }
    },
    setRequiresExplanation(value) { this.requiresExplanation = value },
    logout() {
      this.token = null
      this.user = null
      this.requiresExplanation = false
      this.pendingAbsences = []
      localStorage.removeItem('token')
      localStorage.removeItem('2fa_email')
    }
  }
})