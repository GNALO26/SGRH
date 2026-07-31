<template>
  <section id="features" class="py-20 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Des fonctionnalités conçues pour vous simplifier la vie</h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Tout ce dont vous avez besoin pour gérer vos équipes efficacement.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="(feature, index) in features" :key="index" class="group bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <i :class="feature.icon" class="text-2xl text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform"></i>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ feature.title }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const features = [
  { icon: 'fas fa-map-marker-alt', title: 'Pointage géolocalisé', description: 'GPS + 4 paliers horaires + anti-fraude intégré.' },
  { icon: 'fas fa-calendar-check', title: 'Congés & Absences', description: 'Demandes en ligne, validation en un clic, blocage automatique du pointage.' },
  { icon: 'fas fa-chart-bar', title: 'Statistiques en temps réel', description: 'Taux d\'absentéisme, retards cumulés, graphiques interactifs.' },
  { icon: 'fas fa-folder-open', title: 'Documents RH', description: 'Stockage Cloudinary sécurisé, partage avec les employés.' },
  { icon: 'fas fa-mobile-alt', title: 'Application Android', description: 'Pointage mobile, notifications push, interface native.' },
  { icon: 'fas fa-lock', title: 'Sécurité renforcée', description: 'Tokens expirables, CORS, chiffrement, journaux d\'activité.' },
  { icon: 'fas fa-headset', title: 'Assistance & FAQ', description: 'Tickets de support, suivi en temps réel, aide interactive.' },
  { icon: 'fas fa-users-cog', title: 'Gestion des utilisateurs', description: 'CRUD, rôles administrateur/employé, permissions.' },
]
</script>