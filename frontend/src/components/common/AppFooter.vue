<template>
  <footer class="bg-white border-t border-gray-200 py-3 px-6 text-center text-sm text-gray-500">
    &copy; {{ currentYear }} SGRH. Tous droits réservés.
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>