<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Espace Pointage</h1>
      <p class="text-gray-500 text-sm">Enregistrez vos heures d'arrivée et de départ pour la journée en cours.</p>
    </div>

    <!-- Carte Horloge & Actions -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center space-y-6">
      <div class="inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold">
        {{ currentDate }}
      </div>

      <div class="text-5xl font-extrabold text-gray-800 tracking-tight font-mono">
        {{ currentTime }}
      </div>

      <!-- Statut du jour -->
      <div class="flex justify-center items-center gap-6 text-sm py-2">
        <div>
          <span class="text-gray-400 block text-xs">Arrivée</span>
          <span class="font-bold text-gray-700">{{ todayAttendance?.check_in || '--:--' }}</span>
        </div>
        <div class="h-8 w-px bg-gray-200"></div>
        <div>
          <span class="text-gray-400 block text-xs">Départ</span>
          <span class="font-bold text-gray-700">{{ todayAttendance?.check_out || '--:--' }}</span>
        </div>
      </div>

      <!-- Boutons de pointage -->
      <div class="flex justify-center gap-4 pt-2">
        <button
          @click="handleCheckIn"
          :disabled="loading || todayAttendance?.check_in"
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
        >
          <i class="fas fa-sign-in-alt mr-2"></i> Pointer Arrivée
        </button>

        <button
          @click="handleCheckOut"
          :disabled="loading || !todayAttendance?.check_in || todayAttendance?.check_out"
          class="bg-rose-600 hover:bg-rose-700 text-white font-medium px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
        >
          <i class="fas fa-sign-out-alt mr-2"></i> Pointer Départ
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const currentTime = ref('')
const currentDate = ref('')
const todayAttendance = ref(null)
const loading = ref(false)
let timer = null

function updateClock() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('fr-FR')
  currentDate.value = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function fetchTodayAttendance() {
  try {
    const { data } = await api.get('/employee/attendances/today')
    todayAttendance.value = data
  } catch (e) {
    //
  }
}

async function handleCheckIn() {
  loading.value = true
  try {
    const { data } = await api.post('/employee/attendances/check-in')
    todayAttendance.value = data
    Swal.fire('Succès', 'Pointage d\'arrivée enregistré.', 'success')
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur de pointage.', 'error')
  } finally {
    loading.value = false
  }
}

async function handleCheckOut() {
  loading.value = true
  try {
    const { data } = await api.post('/employee/attendances/check-out')
    todayAttendance.value = data
    Swal.fire('Succès', 'Pointage de départ enregistré.', 'success')
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur de pointage.', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
  fetchTodayAttendance()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>