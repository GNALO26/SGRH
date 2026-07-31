<template>
  <div>
    <LandingNav />
    <div class="pt-20 pb-10 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Télécharger SGRH</h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">Installez l'application Android pour vos employés.</p>
      </div>
    </div>
    <DownloadSection />
    <LandingFooter />
  </div>
</template>

<script setup>
import LandingNav from '@/components/landing/LandingNav.vue'
import DownloadSection from '@/components/landing/DownloadSection.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
</script>