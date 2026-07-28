<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <button @click="$emit('toggle-sidebar')" class="lg:hidden text-gray-600 dark:text-gray-300 focus:outline-none">
        <i class="fas fa-bars text-xl"></i>
      </button>
      <img src="/logo-sgrh.png" alt="SGRH" class="h-8 md:h-10 w-auto" />
      <span class="text-lg md:text-xl font-bold text-blue-800 dark:text-blue-400 hidden sm:block">SGRH</span>
    </div>
    <div class="flex items-center gap-4">
      <button @click="toggleDark" class="text-gray-600 dark:text-gray-300 text-xl focus:outline-none">
        <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
      </button>

      <!-- Cloche pour les deux rôles -->
      <div class="relative cursor-pointer" @click="goToNotifications">
        <i class="fas fa-bell text-gray-600 dark:text-gray-300 text-xl"></i>
        <!-- Badge uniquement pour l'employé (admin peut être ajouté plus tard) -->
        <span v-if="role === 'employee' && unreadCount > 0" class="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {{ unreadCount }}
        </span>
      </div>

      <div class="relative flex items-center gap-2 cursor-pointer" @click="menuOpen = !menuOpen">
        <img :src="avatarUrl" alt="Avatar" class="h-8 w-8 rounded-full object-cover" />
        <span class="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">{{ userName }}</span>
        <i class="fas fa-chevron-down text-gray-500 text-xs"></i>
      </div>

      <div v-if="menuOpen" class="absolute right-4 top-14 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50">
        <router-link :to="profileLink" class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
          <i class="fas fa-user mr-2"></i> Mon profil
        </router-link>
        <router-link :to="settingsLink" class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
          <i class="fas fa-cog mr-2"></i> Paramètres
        </router-link>
        <hr class="my-1 dark:border-gray-700">
        <button @click="logout" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
          <i class="fas fa-sign-out-alt mr-2"></i> Déconnexion
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'
import { useDarkMode } from '@/composables/useDarkMode'

defineEmits(['toggle-sidebar'])

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)
const { unreadCount, fetchUnreadCount } = useNotifications()
const { isDark, toggle } = useDarkMode()
const toggleDark = toggle

const role = computed(() => auth.user?.role)
const userName = computed(() => auth.user?.name || 'Utilisateur')
const avatarUrl = computed(() =>
  auth.user?.avatar_url ||
  'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName.value) + '&background=0D47A1&color=fff'
)
const profileLink = computed(() => role.value === 'admin' ? '/admin/profil' : '/employee/profil')
const settingsLink = computed(() => role.value === 'admin' ? '/admin/parametres' : '/employee/parametres')

let notificationInterval = null

function logout() { auth.logout(); router.push('/login') }
function goToNotifications() {
  if (role.value === 'employee') {
    router.push('/employee/notifications')
  } else if (role.value === 'admin') {
    router.push('/admin/logs')  // ou '/admin/notifications' si créé
  }
}

onMounted(() => {
  if (auth.isAuthenticated && role.value === 'employee') {
    fetchUnreadCount()
    notificationInterval = setInterval(fetchUnreadCount, 30000)
  }
})

onUnmounted(() => clearInterval(notificationInterval))
</script>