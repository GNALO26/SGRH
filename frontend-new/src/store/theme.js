import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: localStorage.getItem('theme') === 'dark',
  }),
  actions: {
    toggle() {
      this.isDark = !this.isDark
      document.documentElement.classList.toggle('dark', this.isDark)
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
    },
    init() {
      if (this.isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    detectSystem() {
      if (!localStorage.getItem('theme')) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.isDark = prefersDark
        document.documentElement.classList.toggle('dark', prefersDark)
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light')
      }
    }
  }
})