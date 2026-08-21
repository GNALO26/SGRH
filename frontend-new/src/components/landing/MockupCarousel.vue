<template>
  <section class="py-20 bg-gray-50 dark:bg-gray-950">
    <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Une interface pensée pour chaque rôle</h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Découvrez les tableaux de bord administrateur et employé.</p>
      </div>

      <!-- Empilement vertical -->
      <div class="space-y-12">
        <!-- Admin -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <img src="/assets/mockups/admin-dashboard.png" alt="Dashboard Admin" class="w-full h-auto object-cover" />
          <div class="p-6">
            <h3 class="font-bold text-xl text-gray-900 dark:text-white mb-2">Tableau de bord Admin</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Statistiques, graphiques d'absentéisme, gestion complète des employés.</p>
          </div>
        </div>

        <!-- Employé -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <img src="/assets/mockups/employee-dashboard.png" alt="Dashboard Employé" class="w-full h-auto object-cover" />
          <div class="p-6">
            <h3 class="font-bold text-xl text-gray-900 dark:text-white mb-2">Tableau de bord Employé</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Pointage, calendrier mensuel, demande de congés, suivi des présences.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>