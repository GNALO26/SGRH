import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role,
  },
  actions: {
    async login(credentials) {
      const { data } = await api.post('/login', credentials)
      console.log('Réponse login :', data) // Pour déboguer
      if (!data.token || !data.user) {
        throw new Error(data.message || 'Réponse invalide du serveur')
      }
      this.token = data.token
      this.user = data.user
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
      localStorage.removeItem('token')
    }
  }
})