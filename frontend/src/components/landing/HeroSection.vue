<template>
  <section class="relative h-[80vh] flex items-center justify-center overflow-hidden">
    <!-- Vidéo de fond (choisie aléatoirement au montage) -->
    <video
      autoplay
      muted
      loop
      playsinline
      class="absolute inset-0 w-full h-full object-cover"
      :key="videoSrc"
    >
      <source :src="videoSrc" type="video/mp4" />
    </video>

    <!-- Overlay dégradé -->
    <div class="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900/80"></div>

    <!-- Contenu -->
    <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
      <h1 class="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
        <span class="block">Gestion RH</span>
        <span class="text-blue-400">nouvelle génération</span>
      </h1>
      <p class="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
        Pointage géolocalisé, congés, statistiques, documents et plus encore – Tout-en-un, sécurisé et pensé pour vous.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link to="/login" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg">
          <i class="fas fa-arrow-right mr-2"></i>Accéder à mon tableau de bord
        </router-link>
        <a href="#features" class="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm font-semibold py-3 px-8 rounded-lg transition-colors text-lg border border-white/30">
          <i class="fas fa-search mr-2"></i>Découvrir les fonctionnalités
        </a>
      </div>

      <!-- Badge Android -->
      <div class="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
        <i class="fab fa-android text-green-400"></i>
        <span class="text-white text-sm">Application Android disponible</span>
      </div>
    </div>

    <!-- Indicateur de défilement -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
      <i class="fas fa-chevron-down text-2xl"></i>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const videos = [
  '/assets/videos/hero-01.mp4',
  '/assets/videos/hero-02.mp4',
  '/assets/videos/hero-03.mp4',
  '/assets/videos/hero-background.mp4', // vidéo existante
]

// Choisir une vidéo aléatoire à chaque montage
const randomIndex = Math.floor(Math.random() * videos.length)
const videoSrc = ref(videos[randomIndex])
</script>