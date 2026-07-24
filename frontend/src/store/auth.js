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
      const { data } = await api.post('/login', credentials)
      console.log('Réponse login brute :', data)   // ← débogage
      this.token = data.token
      this.user = data.user
      this.requiresExplanation = data.requires_explanation
      this.pendingAbsences = data.pending_absences
      localStorage.setItem('token', data.token)
      return data
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