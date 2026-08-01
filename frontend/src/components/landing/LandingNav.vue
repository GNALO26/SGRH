<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2">
          <img src="/logo-sgrh.png" alt="SGRH" class="h-8 w-auto" />
          <span class="text-xl font-bold text-blue-900 dark:text-blue-400">SGRH</span>
        </router-link>

        <!-- Liens desktop -->
        <div class="hidden md:flex items-center gap-8">
          <router-link to="/" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Accueil</router-link>
          <router-link to="/fonctionnalites" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Fonctionnalités</router-link>
          <router-link to="/telechargement" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Télécharger</router-link>
          <router-link to="/login" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
            Se connecter
          </router-link>
        </div>

        <!-- Menu mobile -->
        <button @click="mobileOpen = !mobileOpen" class="md:hidden text-gray-700 dark:text-gray-300">
          <i :class="mobileOpen ? 'fas fa-times' : 'fas fa-bars'" class="text-xl"></i>
        </button>
      </div>

      <!-- Menu mobile déroulant -->
      <div v-if="mobileOpen" class="md:hidden pb-4 space-y-2">
        <router-link to="/" class="block py-2 text-gray-700 dark:text-gray-300">Accueil</router-link>
        <router-link to="/fonctionnalites" class="block py-2 text-gray-700 dark:text-gray-300">Fonctionnalités</router-link>
        <router-link to="/telechargement" class="block py-2 text-gray-700 dark:text-gray-300">Télécharger</router-link>
        <router-link to="/login" class="block py-2 text-blue-600 font-semibold">Se connecter</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
const mobileOpen = ref(false)
</script>