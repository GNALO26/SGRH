<template>
  <div>
    <LandingNav />
    <div class="pt-20 pb-10 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Fonctionnalités</h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">Tout ce que SGRH peut faire pour vous.</p>
      </div>
    </div>
    <FeaturesGrid />
    <CtaSection />
    <LandingFooter />
  </div>
</template>

<script setup>
import LandingNav from '@/components/landing/LandingNav.vue'
import FeaturesGrid from '@/components/landing/FeaturesGrid.vue'
import CtaSection from '@/components/landing/CtaSection.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
</script>