<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-10">
      <i class="fas fa-spinner fa-spin text-3xl text-accent"></i>
      <p class="mt-2 text-muted">Chargement du tableau de bord...</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="text-center py-10">
      <i class="fas fa-exclamation-triangle text-3xl text-danger"></i>
      <p class="mt-2 text-danger">Impossible de charger les données.</p>
      <button @click="refreshData" class="mt-3 bg-accent text-inverse px-4 py-2 rounded hover:bg-accent-hover">
        <i class="fas fa-sync-alt mr-1"></i> Réessayer
      </button>
    </div>

    <template v-else>
      <!-- En-tête bienvenue -->
      <div class="bg-card rounded-xl shadow-custom p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-primary">Bonjour, {{ user?.name }}</h1>
          <p class="text-secondary">{{ user?.position || 'Employé' }} - {{ user?.department || 'Service' }}</p>
          <p class="text-sm text-muted mt-1">{{ formattedDate }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-muted">Statut du jour</p>
          <span :class="statusClass" class="px-3 py-1 rounded-full text-white text-sm font-semibold">{{ statusLabel }}</span>
        </div>
      </div>

      <!-- Grille 3 colonnes -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne gauche -->
        <div class="flex flex-col space-y-6">
          <div class="bg-card rounded-xl shadow-custom p-6">
            <h2 class="text-lg font-semibold mb-3 text-primary"><i class="fas fa-fingerprint mr-2 text-accent"></i>Pointage</h2>
            <AttendanceButton v-if="canCheckIn" @success="refreshData" />
            <div v-else-if="todayAttendance" class="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
              <p class="text-green-800 dark:text-green-200"><i class="fas fa-check-circle mr-1"></i>Pointage effectué à <strong>{{ todayAttendance.check_in_time }}</strong></p>
              <p v-if="todayAttendance.late_minutes" class="text-orange-600 dark:text-orange-400 text-sm mt-1">Retard de {{ todayAttendance.late_minutes }} min</p>
            </div>
            <p v-else class="text-muted">Pointage non disponible.</p>
          </div>

          <div class="bg-card rounded-xl shadow-custom p-6">
            <h2 class="text-lg font-semibold mb-3 text-primary"><i class="fas fa-id-card mr-2 text-accent"></i>Informations</h2>
            <ul class="space-y-2 text-sm text-secondary">
              <li><span class="font-medium">Matricule :</span> {{ user?.matricule || 'Non renseigné' }}</li>
              <li><span class="font-medium">Poste :</span> {{ user?.position || 'Non renseigné' }}</li>
              <li><span class="font-medium">Service :</span> {{ user?.department || 'Non renseigné' }}</li>
              <li><span class="font-medium">Email :</span> {{ user?.email }}</li>
            </ul>
            <router-link to="/employee/profil" class="text-accent text-sm hover:underline mt-2 inline-block">Voir mon profil complet</router-link>
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 text-sm text-yellow-800 dark:text-yellow-200">
            <p v-if="leaveToday">Vous êtes en absence autorisée aujourd'hui. Le pointage est désactivé.</p>
            <p v-else>Aucune absence ou autorisation validée pour aujourd'hui.</p>
          </div>
        </div>

        <!-- Colonne centrale : Calendrier + absences + citation -->
        <div class="flex flex-col space-y-4">
          <div class="bg-card rounded-xl shadow-custom p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-primary">
                <i class="fas fa-calendar-alt mr-2 text-accent"></i>Calendrier
              </h2>
              <div class="flex items-center space-x-2">
                <button @click="prevMonth" class="p-1 rounded hover:bg-card-hover text-secondary">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <span class="text-sm font-medium text-primary">{{ currentMonthLabel }}</span>
                <button @click="nextMonth" class="p-1 rounded hover:bg-card-hover text-secondary">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
            <CalendarView :year="currentYear" :month="currentMonthNum" :events="calendarEvents" />
            <div v-if="upcomingHolidays.length" class="mt-4 bg-blue-50 dark:bg-blue-900 rounded-lg p-3 text-sm">
              <h3 class="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                <i class="fas fa-calendar mr-1"></i> Prochains jours fériés
              </h3>
              <div v-for="h in upcomingHolidays" :key="h.id" class="flex justify-between">
                <span class="text-secondary">{{ h.date }}</span>
                <span class="text-muted">{{ h.description }}</span>
              </div>
            </div>
          </div>

          <!-- Prochaines absences -->
          <div class="bg-card rounded-xl shadow-custom p-4">
            <div class="flex justify-between items-center mb-2">
              <h2 class="text-sm font-semibold text-primary">
                <i class="fas fa-calendar-check mr-1 text-accent"></i>Prochaines absences
              </h2>
              <router-link to="/employee/demandes" class="text-xs text-accent hover:underline">Voir tout</router-link>
            </div>
            <div v-if="upcomingLeaves.length">
              <div v-for="leave in upcomingLeaves.slice(0, 3)" :key="leave.id" class="py-1 border-b last:border-0 border-custom">
                <p class="font-medium text-xs text-primary">{{ leave.type_label || 'Congé' }}</p>
                <p class="text-xs text-muted">{{ leave.start_date }} au {{ leave.end_date }}</p>
              </div>
            </div>
            <p v-else class="text-muted text-xs">Aucun congé programmé.</p>
          </div>

          <!-- Citation -->
          <div class="bg-card rounded-xl shadow-custom p-5">
            <DailyQuote />
          </div>
        </div>

        <!-- Colonne droite -->
        <div class="flex flex-col space-y-6">
          <!-- Mes demandes -->
          <div class="bg-card rounded-xl shadow-custom p-6">
            <div class="flex justify-between items-center mb-3">
              <h2 class="text-lg font-semibold text-primary"><i class="fas fa-file-alt mr-2 text-accent"></i>Mes demandes</h2>
              <router-link to="/employee/demandes" class="text-sm text-accent hover:underline">Voir tout</router-link>
            </div>
            <div v-if="pendingRequests.length">
              <div v-for="req in pendingRequests" :key="req.id" class="flex justify-between items-center py-2 border-b last:border-0 border-custom">
                <div>
                  <p class="font-medium text-sm text-primary">{{ req.type === 'leave' ? 'Congé/Absence' : 'Autorisation retard' }} - {{ req.date }}</p>
                  <p class="text-xs text-muted">{{ req.reason }}</p>
                </div>
                <span class="px-2 py-0.5 rounded-full text-xs" :class="req.statusClass">{{ req.statusLabel }}</span>
              </div>
            </div>
            <p v-else class="text-muted text-sm">Aucune demande en attente.</p>
          </div>

          <!-- Derniers pointages -->
          <div class="bg-card rounded-xl shadow-custom p-6">
            <div class="flex justify-between items-center mb-3">
              <h2 class="text-lg font-semibold text-primary"><i class="fas fa-history mr-2 text-accent"></i>Derniers pointages</h2>
              <router-link to="/employee/presences" class="text-sm text-accent hover:underline">Voir plus</router-link>
            </div>
            <div v-if="recentAttendances.length">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-muted"><th>Date</th><th>Heure</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  <tr v-for="att in recentAttendances" :key="att.id" class="border-b border-custom">
                    <td class="text-primary">{{ att.date }}</td>
                    <td class="text-primary">{{ att.check_in_time }}</td>
                    <td><span :class="att.statusClass">{{ att.statusLabel }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-muted">Aucun pointage récent.</p>
          </div>

          <!-- Résumé du mois -->
          <div class="bg-card rounded-xl shadow-custom p-4 mt-auto">
            <h2 class="text-sm font-semibold mb-2 text-primary">
              <i class="fas fa-chart-pie mr-1 text-accent"></i>Résumé du mois
            </h2>
            <div class="grid grid-cols-2 gap-2">
              <div><p class="text-xs text-muted">Jours travaillés</p><p class="text-lg font-bold text-primary">{{ monthlySummary.worked_days }}</p></div>
              <div><p class="text-xs text-muted">Présences</p><p class="text-lg font-bold text-primary">{{ monthlySummary.present_days }}</p></div>
              <div><p class="text-xs text-muted">Retards</p><p class="text-lg font-bold text-primary">{{ monthlySummary.late_count }} ({{ monthlySummary.late_minutes }} min)</p></div>
              <div><p class="text-xs text-muted">Absences</p><p class="text-lg font-bold text-primary">{{ monthlySummary.absence_days }}</p></div>
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
import DailyQuote from '@/components/employee/DailyQuote.vue'

const auth = useAuthStore()
const user = computed(() => auth.user)

// État
const todayAttendance = ref(null)
const canCheckIn = ref(true)
const leaveToday = ref(false)
const pendingRequests = ref([])
const recentAttendances = ref([])
const monthlySummary = ref({ worked_days: 0, present_days: 0, late_count: 0, late_minutes: 0, absence_days: 0 })
const calendarEvents = ref([])
const upcomingHolidays = ref([])
const upcomingLeaves = ref([])
const loading = ref(true)
const error = ref(false)

// Gestion du mois affiché
const currentDate = ref(new Date())
const currentMonthNum = computed(() => currentDate.value.getMonth() + 1)
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonthLabel = computed(() => currentDate.value.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }))

const formattedDate = computed(() => new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

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

// Navigation calendaire
function prevMonth() {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() - 1)
  currentDate.value = d
  fetchDashboard()
}

function nextMonth() {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + 1)
  currentDate.value = d
  fetchDashboard()
}

async function fetchDashboard() {
  loading.value = true
  error.value = false
  try {
    const params = {
      month: currentMonthNum.value,
      year: currentYear.value,
    }
    const { data } = await api.get('/employee/dashboard', { params })
    todayAttendance.value = data.today_attendance
    canCheckIn.value = data.can_check_in
    leaveToday.value = data.leave_today
    pendingRequests.value = data.pending_requests || []
    recentAttendances.value = data.recent_attendances || []
    monthlySummary.value = data.monthly_summary
    calendarEvents.value = data.calendar_events || []
    upcomingHolidays.value = data.upcoming_holidays || []
    upcomingLeaves.value = data.upcoming_leaves || []
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