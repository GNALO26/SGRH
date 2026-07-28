<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-10">
      <i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
      <p class="mt-2 text-gray-500 dark:text-gray-400">Chargement du tableau de bord...</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="text-center py-10">
      <i class="fas fa-exclamation-triangle text-3xl text-red-500"></i>
      <p class="mt-2 text-red-600 dark:text-red-400">Impossible de charger les données.</p>
      <button @click="refreshData" class="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        <i class="fas fa-sync-alt mr-1"></i> Réessayer
      </button>
    </div>

    <template v-else>
      <!-- En-tête bienvenue -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold dark:text-white">Bonjour, {{ user?.name }}</h1>
          <p class="text-gray-500 dark:text-gray-400">{{ user?.position || 'Employé' }} - {{ user?.department || 'Service' }}</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">{{ formattedDate }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-500 dark:text-gray-400">Statut du jour</p>
          <span :class="statusClass" class="px-3 py-1 rounded-full text-white text-sm font-semibold">{{ statusLabel }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne gauche -->
        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 class="text-lg font-semibold mb-3 dark:text-white"><i class="fas fa-fingerprint mr-2 text-blue-600"></i>Pointage</h2>
            <AttendanceButton v-if="canCheckIn" @success="refreshData" />
            <div v-else-if="todayAttendance" class="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
              <p class="text-green-800 dark:text-green-200"><i class="fas fa-check-circle mr-1"></i>Pointage effectué à <strong>{{ todayAttendance.check_in_time }}</strong></p>
              <p v-if="todayAttendance.late_minutes" class="text-orange-600 dark:text-orange-400 text-sm mt-1">Retard de {{ todayAttendance.late_minutes }} min</p>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400">Pointage non disponible pour le moment.</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 class="text-lg font-semibold mb-3 dark:text-white"><i class="fas fa-id-card mr-2 text-blue-600"></i>Informations</h2>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li><span class="font-medium">Matricule :</span> {{ user?.matricule || '-' }}</li>
              <li><span class="font-medium">Poste :</span> {{ user?.position || '-' }}</li>
              <li><span class="font-medium">Service :</span> {{ user?.department || '-' }}</li>
              <li><span class="font-medium">Email :</span> {{ user?.email }}</li>
            </ul>
            <router-link to="/employee/profil" class="text-blue-600 text-sm hover:underline mt-2 inline-block">Voir mon profil complet</router-link>
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 text-sm text-yellow-800 dark:text-yellow-200">
            <p v-if="leaveToday">Vous êtes en absence autorisée aujourd'hui. Le pointage est désactivé.</p>
            <p v-else>Aucune absence ou autorisation validée pour aujourd'hui.</p>
          </div>
        </div>

        <!-- Colonne centrale -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 class="text-lg font-semibold mb-4 dark:text-white"><i class="fas fa-calendar-alt mr-2 text-blue-600"></i>Calendrier {{ currentMonth }}</h2>
          <CalendarView :year="currentYear" :month="currentMonthNum" :events="calendarEvents" />
          <div class="mt-4 space-y-3">
            <DailyQuote />
            <div v-if="upcomingHolidays.length" class="bg-blue-50 dark:bg-blue-900 rounded-lg p-3 text-sm">
              <h3 class="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                <i class="fas fa-calendar mr-1"></i> Prochains jours fériés
              </h3>
              <div v-for="h in upcomingHolidays" :key="h.id" class="flex justify-between">
                <span class="text-gray-700 dark:text-gray-200">{{ h.date }}</span>
                <span class="text-gray-500 dark:text-gray-400">{{ h.description }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne droite -->
        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div class="flex justify-between items-center mb-3">
              <h2 class="text-lg font-semibold dark:text-white"><i class="fas fa-file-alt mr-2 text-blue-600"></i>Mes demandes</h2>
              <router-link to="/employee/demandes" class="text-sm text-blue-600 hover:underline">Voir tout</router-link>
            </div>
            <div v-if="pendingRequests.length">
              <div v-for="req in pendingRequests" :key="req.id" class="flex justify-between items-center py-2 border-b last:border-0 dark:border-gray-700">
                <div>
                  <p class="font-medium text-sm dark:text-white">{{ req.type === 'leave' ? 'Congé/Absence' : 'Autorisation retard' }} - {{ req.date }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ req.reason }}</p>
                </div>
                <span class="px-2 py-0.5 rounded-full text-xs" :class="req.statusClass">{{ req.statusLabel }}</span>
              </div>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400 text-sm">Aucune demande en attente.</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div class="flex justify-between items-center mb-3">
              <h2 class="text-lg font-semibold dark:text-white"><i class="fas fa-history mr-2 text-blue-600"></i>Derniers pointages</h2>
              <router-link to="/employee/presences" class="text-sm text-blue-600 hover:underline">Voir plus</router-link>
            </div>
            <div v-if="recentAttendances.length">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-gray-500 dark:text-gray-400"><th>Date</th><th>Heure</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  <tr v-for="att in recentAttendances" :key="att.id" class="border-b dark:border-gray-700">
                    <td class="dark:text-white">{{ att.date }}</td>
                    <td class="dark:text-white">{{ att.check_in_time }}</td>
                    <td><span :class="att.statusClass">{{ att.statusLabel }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400">Aucun pointage récent.</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 class="text-lg font-semibold mb-3 dark:text-white"><i class="fas fa-chart-pie mr-2 text-blue-600"></i>Résumé du mois</h2>
            <div class="grid grid-cols-2 gap-4">
              <StatsCard icon="fas fa-calendar-check" label="Jours travaillés" :value="monthlySummary.worked_days" color="blue" />
              <StatsCard icon="fas fa-user-check" label="Présences" :value="monthlySummary.present_days" color="green" />
              <StatsCard icon="fas fa-clock" label="Retards" :value="monthlySummary.late_count + ' (' + monthlySummary.late_minutes + ' min)'" color="orange" />
              <StatsCard icon="fas fa-calendar-times" label="Absences" :value="monthlySummary.absence_days" color="red" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import api from '@/api/axios'
import AttendanceButton from '@/components/attendance/AttendanceButton.vue'
import CalendarView from '@/components/attendance/CalendarView.vue'
import StatsCard from '@/components/common/StatsCard.vue'
import DailyQuote from '@/components/employee/DailyQuote.vue'

const auth = useAuthStore()
const user = computed(() => auth.user)

const todayAttendance = ref(null)
const canCheckIn = ref(false)
const leaveToday = ref(false)
const pendingRequests = ref([])
const recentAttendances = ref([])
const monthlySummary = ref({ worked_days: 0, present_days: 0, late_count: 0, late_minutes: 0, absence_days: 0 })
const calendarEvents = ref([])
const upcomingHolidays = ref([])
const currentMonth = new Date().toLocaleString('fr-FR', { month: 'long' })
const currentYear = new Date().getFullYear()
const currentMonthNum = new Date().getMonth() + 1
const loading = ref(true)
const error = ref(false)

const formattedDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const statusClass = computed(() => {
  if (!todayAttendance.value) return 'bg-gray-400'
  if (todayAttendance.value.status === 'on_time') return 'bg-green-500'
  if (['late','major_late'].includes(todayAttendance.value.status)) return 'bg-orange-500'
  return 'bg-blue-500'
})
const statusLabel = computed(() => {
  if (leaveToday.value) return 'Absence autorisée'
  if (!todayAttendance.value) return 'Non pointé'
  if (todayAttendance.value.status === 'on_time') return 'Présent (à l\'heure)'
  if (todayAttendance.value.status === 'late') return 'En retard'
  if (todayAttendance.value.status === 'major_late') return 'Grand retard'
  return 'Présent'
})

async function fetchDashboard() {
  loading.value = true
  error.value = false
  try {
    const { data } = await api.get('/employee/dashboard')
    todayAttendance.value = data.today_attendance
    canCheckIn.value = data.can_check_in
    leaveToday.value = data.leave_today
    pendingRequests.value = data.pending_requests || []
    recentAttendances.value = data.recent_attendances || []
    monthlySummary.value = data.monthly_summary
    calendarEvents.value = data.calendar_events || []
    upcomingHolidays.value = data.upcoming_holidays || []
  } catch (e) {
    console.error('Erreur chargement dashboard employé', e)
    error.value = true
  } finally {
    loading.value = false
  }
}

function refreshData() {
  fetchDashboard()
}

onMounted(fetchDashboard)
</script>