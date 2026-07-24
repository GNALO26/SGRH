<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-primary">Pointage du jour</h1>
    <div class="bg-card rounded-xl shadow-custom p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-muted">{{ formattedDate }}</p>
          <p class="text-xl font-semibold" :class="statusTextClass">{{ statusLabel }}</p>
          <p class="text-muted text-sm">{{ statusMessage }}</p>
        </div>
        <div class="h-16 w-16 rounded-full flex items-center justify-center" :class="statusColorClass">
          <i :class="statusIconClass" class="text-2xl"></i>
        </div>
      </div>
      <div class="mt-6" v-if="canCheckIn">
        <AttendanceButton @success="refresh" />
      </div>
      <div v-else-if="todayAttendance" class="mt-4 p-3 bg-green-50 dark:bg-green-900 rounded">
        <p class="text-sm text-green-800 dark:text-green-200">Pointage effectué à <strong>{{ todayAttendance.check_in_time }}</strong></p>
        <p v-if="todayAttendance.late_minutes" class="text-sm text-warning">Retard de {{ todayAttendance.late_minutes }} minutes.</p>
      </div>
    </div>

    <div class="bg-card rounded-xl shadow-custom p-6">
      <h2 class="text-lg font-semibold mb-4 text-primary">Historique des pointages</h2>
      <div class="flex gap-4 mb-4">
        <input type="month" v-model="filterMonth" @change="fetchHistory" class="border rounded p-2 bg-card text-primary border-custom" />
        <select v-model="filterStatus" @change="fetchHistory" class="border rounded p-2 bg-card text-primary border-custom">
          <option value="">Tous les statuts</option>
          <option value="on_time">À l'heure</option>
          <option value="late">Retard</option>
          <option value="major_late">Grand retard</option>
          <option value="authorized">Autorisé</option>
        </select>
      </div>
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left border-b border-custom">
            <th class="py-2 text-primary">Date</th><th class="py-2 text-primary">Heure</th><th class="py-2 text-primary">Statut</th><th class="py-2 text-primary">Retard</th><th class="py-2 text-primary">Justificatif</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="att in history" :key="att.id" class="border-b border-custom">
            <td class="py-2 text-primary">{{ att.date }}</td>
            <td class="py-2 text-primary">{{ att.check_in_time }}</td>
            <td class="py-2"><span class="px-2 py-1 rounded-full text-xs" :class="att.statusClass">{{ att.statusLabel }}</span></td>
            <td class="py-2 text-primary">{{ att.late_minutes ? att.late_minutes + ' min' : '-' }}</td>
            <td class="py-2 text-primary">{{ att.justification || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import AttendanceButton from '@/components/attendance/AttendanceButton.vue'

const todayAttendance = ref(null)
const canCheckIn = ref(true)
const history = ref([])
const filterMonth = ref(new Date().toISOString().substr(0,7))
const filterStatus = ref('')

const formattedDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const statusLabel = computed(() => todayAttendance.value ? 'Pointage effectué' : 'Non pointé')
const statusMessage = computed(() => todayAttendance.value ? `Arrivée à ${todayAttendance.value.check_in_time}` : 'Vous n\'avez pas encore pointé aujourd\'hui.')
const statusColorClass = computed(() => todayAttendance.value ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700')
const statusIconClass = computed(() => todayAttendance.value ? 'fas fa-check text-green-600 dark:text-green-400' : 'fas fa-clock text-muted')
const statusTextClass = computed(() => todayAttendance.value ? 'text-green-700 dark:text-green-400' : 'text-muted')

async function fetchStatus() {
  try {
    const { data } = await api.get('/employee/attendance/today')
    todayAttendance.value = data.attendance
    canCheckIn.value = data.canCheckIn
  } catch (e) { console.error(e) }
}

async function fetchHistory() {
  try {
    const params = { month: filterMonth.value, status: filterStatus.value }
    const { data } = await api.get('/employee/attendance/history', { params })
    history.value = data.data || data
  } catch (e) { console.error(e) }
}

function refresh() { fetchStatus(); fetchHistory() }

onMounted(() => { fetchStatus(); fetchHistory() })
</script>