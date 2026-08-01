<template>
  <section class="py-20 bg-gray-50 dark:bg-gray-950">
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Une interface pensée pour chaque rôle</h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Découvrez les tableaux de bord administrateur et employé.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <!-- Admin -->
        <div class="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <img src="/assets/mockups/admin-dashboard.png" alt="Dashboard Admin" class="w-full h-auto lg:h-[500px] object-cover object-top" />
          <div class="p-6">
            <h3 class="font-bold text-xl text-gray-900 dark:text-white mb-2">Tableau de bord Admin</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Statistiques, graphiques d'absentéisme, gestion complète des employés.</p>
          </div>
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="text-white font-bold text-lg"><i class="fas fa-search-plus mr-2"></i>Voir en détail</span>
          </div>
        </div>

        <!-- Employé -->
        <div class="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <img src="/assets/mockups/employee-dashboard.png" alt="Dashboard Employé" class="w-full h-auto lg:h-[500px] object-cover object-top" />
          <div class="p-6">
            <h3 class="font-bold text-xl text-gray-900 dark:text-white mb-2">Tableau de bord Employé</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Pointage, calendrier mensuel, demande de congés, suivi des présences.</p>
          </div>
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="text-white font-bold text-lg"><i class="fas fa-search-plus mr-2"></i>Voir en détail</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>