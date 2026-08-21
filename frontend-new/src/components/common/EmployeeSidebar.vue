<template>
  <aside class="w-64 bg-blue-900 dark:bg-gray-900 text-white flex flex-col h-full" :class="$attrs.class">
  <div class="p-4 border-b border-blue-700 dark:border-gray-700">
    <img src="/logo-sgrh.png" alt="SGRH" class="h-10 mx-auto" />
    <p class="text-center text-sm mt-2">Espace Employé</p>
  </div>
  <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
    <SidebarLink to="/employee" icon="fas fa-home" label="Tableau de bord" />
    <SidebarLink to="/employee/profil" icon="fas fa-user" label="Mon profil" />
    <SidebarLink to="/employee/pointage" icon="fas fa-fingerprint" label="Pointage" />
    <SidebarLink to="/employee/presences" icon="fas fa-calendar-check" label="Mes présences" />
    <SidebarLink to="/employee/demandes" icon="fas fa-file-alt" label="Mes demandes" />
    <SidebarLink to="/employee/documents" icon="fas fa-folder-open" label="Mes documents" />
    <SidebarLink to="/employee/unjustified-absences" icon="fas fa-exclamation-triangle" label="Mes absences" />
    <SidebarLink to="/employee/notifications" icon="fas fa-bell" label="Notifications" />
    <SidebarLink to="/employee/assistance" icon="fas fa-life-ring" label="Assistance" />
    <SidebarLink to="/employee/faq" icon="fas fa-question-circle" label="FAQ" />
  </nav>
  <div class="p-4 border-t border-blue-700 dark:border-gray-700">
    <button @click="logout" class="w-full flex items-center gap-2 text-sm text-gray-300 hover:text-white">
      <i class="fas fa-sign-out-alt"></i> Déconnexion
    </button>
  </div>
</aside>
</template>

<script setup>
import SidebarLink from './SidebarLink.vue'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
function logout() {
  auth.logout()
  router.push('/login')
}
</script>