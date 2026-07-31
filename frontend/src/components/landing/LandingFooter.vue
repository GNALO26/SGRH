<template>
  <footer class="bg-gray-900 dark:bg-black text-gray-400 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <img src="/logo-sgrh.png" alt="SGRH" class="h-8 w-auto" />
            <span class="text-white font-bold text-lg">SGRH</span>
          </div>
          <p class="text-sm">La solution RH complète pour simplifier la gestion de vos équipes.</p>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Liens rapides</h4>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/" class="hover:text-white transition-colors">Accueil</router-link></li>
            <li><router-link to="/fonctionnalites" class="hover:text-white transition-colors">Fonctionnalités</router-link></li>
            <li><router-link to="/telechargement" class="hover:text-white transition-colors">Télécharger</router-link></li>
            <li><router-link to="/login" class="hover:text-white transition-colors">Se connecter</router-link></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Contact</h4>
          <ul class="space-y-2 text-sm">
            <li><i class="fas fa-envelope mr-2"></i> contact@sgrh.com</li>
            <li><i class="fas fa-phone mr-2"></i> +229 00 00 00 00</li>
          </ul>
        </div>
      </div>
      <div class="border-t border-gray-800 pt-8 text-center text-sm">
        <p>&copy; 2026 SGRH. Tous droits réservés.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>