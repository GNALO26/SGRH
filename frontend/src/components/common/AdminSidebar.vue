<template>
  <aside class="w-64 bg-gray-900 text-white flex flex-col h-full" :class="$attrs.class">
    <div class="p-4 border-b border-gray-700">
      <img src="/logo-sgrh.png" alt="SGRH" class="h-10 mx-auto" />
      <p class="text-center text-sm mt-2 font-semibold">Administrateur</p>
    </div>
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <SidebarLink to="/admin" icon="fas fa-tachometer-alt" label="Tableau de bord" />
      <SidebarLink to="/admin/employes" icon="fas fa-users" label="Employés" />
      <SidebarLink to="/admin/pointages" icon="fas fa-fingerprint" label="Pointages" />
      <SidebarLink to="/admin/documents" icon="fas fa-folder-open" label="Documents" />

      <div class="space-y-1">
        <button @click="absOpen = !absOpen" class="flex items-center w-full px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
          <i class="fas fa-calendar-times w-5 text-center"></i>
          <span class="flex-1 ml-3 text-sm">Gestion des absences</span>
          <i :class="absOpen ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" class="text-xs"></i>
        </button>
        <div v-show="absOpen" class="pl-4 space-y-1">
          <SidebarLink to="/admin/conges" icon="fas fa-calendar-minus" label="Congés & absences" small />
          <SidebarLink to="/admin/autorisations" icon="fas fa-clock" label="Autorisations de retard" small />
          <SidebarLink to="/admin/unjustified-absences" icon="fas fa-exclamation-triangle" label="Absences non justifiées" small />
          <SidebarLink to="/admin/holidays" icon="fas fa-calendar" label="Jours fériés" small />
        </div>
      </div>

      <SidebarLink to="/admin/assistance" icon="fas fa-life-ring" label="Assistance" />
      <SidebarLink to="/admin/statistiques" icon="fas fa-chart-bar" label="Statistiques & Rapports" />
      <SidebarLink to="/admin/parametres" icon="fas fa-cogs" label="Paramètres" />
      <SidebarLink to="/admin/utilisateurs" icon="fas fa-user-shield" label="Utilisateurs & Rôles" />
      <SidebarLink to="/admin/logs" icon="fas fa-history" label="Journaux d'activité" />
    </nav>
    <div class="p-4 border-t border-gray-700">
      <button @click="logout" class="w-full flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <i class="fas fa-sign-out-alt"></i>
        <span>Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import SidebarLink from './SidebarLink.vue'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

const absOpen = ref(false)
const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>