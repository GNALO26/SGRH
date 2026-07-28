<template>
  <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
    <!-- En-tête -->
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Espace Pointage</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Gérez votre présence quotidienne en temps réel</p>
      </div>
      <div className="flex items-center space-x-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg font-medium">
        <i className="fas font-clock"></i>
        <span>Horaire : {{ officialOpeningTime?.slice(0, 5) }} - {{ officialClosingTime?.slice(0, 5) }}</span>
      </div>
    </div>

    <!-- Chargement -->
    <div v-if="loading" className="flex items-center justify-center py-12">
      <i className="fas font-circle-notch fa-spin text-3xl text-blue-600"></i>
      <span className="ml-3 text-gray-600 font-medium">Chargement du tableau de bord...</span>
    </div>

    <template v-else>
      <!-- Cartes d'information principale -->
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Carte Statut du Jour -->
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut d'aujourd'hui</span>
            <div className="mt-3 flex items-center space-x-3">
              <div v-if="alreadyCheckedIn" className="flex items-center space-x-2 text-emerald-600 font-bold text-lg">
                <i className="fas font-check-circle text-2xl"></i>
                <span>Présence enregistrée</span>
              </div>
              <div v-else-if="canCheckIn" className="flex items-center space-x-2 text-amber-600 font-bold text-lg">
                <i className="fas font-clock text-2xl"></i>
                <span>Pointage ouvert</span>
              </div>
              <div v-else className="flex items-center space-x-2 text-gray-500 font-bold text-lg">
                <i className="fas font-times-circle text-2xl"></i>
                <span>Pointage fermé</span>
              </div>
            </div>
          </div>

          <div v-if="latestAttendance" className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span>Dernier pointage :</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {{ formatTime(latestAttendance.check_in_time) }}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Statut :</span>
              <span 
                className="px-2 py-0.5 rounded text-xs font-semibold"
                :class="{
                  'bg-emerald-100 text-emerald-800': latestAttendance.status === 'on_time',
                  'bg-amber-100 text-amber-800': latestAttendance.status === 'late',
                  'bg-red-100 text-red-800': latestAttendance.status === 'very_late'
                }"
              >
                {{ getStatusLabel(latestAttendance) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Carte Géofencing & GPS -->
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Géofencing GPS</span>
              <button 
                @click="getGeolocation" 
                className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
              >
                <i className="fas font-sync-alt" :class="{ 'fa-spin': gettingLocation }"></i>
                <span>Actualiser</span>
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <div v-if="geoError" className="text-sm text-red-600 flex items-start space-x-2">
                <i className="fas font-exclamation-triangle mt-0.5 shrink-0"></i>
                <span>{{ geoError }}</span>
              </div>

              <template v-else-if="userLat && userLng">
                <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <i className="fas font-map-marker-alt text-blue-500"></i>
                  <span>Distance entreprise : <strong>{{ distanceMeters !== null ? `${distanceMeters} m` : 'Calcul...' }}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <i className="fas font-building text-gray-400"></i>
                  <span>Rayon autorisé : <strong>{{ geofenceRadius }} m</strong></span>
                </div>
              </template>

              <div v-else className="text-sm text-gray-500">
                Recherche de votre position GPS...
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <span 
              v-if="isWithinFence" 
              className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full"
            >
              <i className="fas font-check-circle mr-1.5"></i> Dans la zone autorisée
            </span>
            <span 
              v-else 
              className="inline-flex items-center text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-900/30 px-2.5 py-1 rounded-full"
            >
              <i className="fas font-shield-alt mr-1.5"></i> Hors de la zone autorisée
            </span>
          </div>
        </div>

      </div>

      <!-- Formulaire de Pointage -->
      <div v-if="!alreadyCheckedIn" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Marquer mon arrivée</h2>

        <form @submit.prevent="handleCheckIn" className="space-y-4">
          <div v-if="requireJustification" className="space-y-1">
            <label className="block text-sm font-medium text-amber-800 dark:text-amber-400">
              Motif du retard (Obligatoire) *
            </label>
            <textarea
              v-model="justification"
              placeholder="Veuillez préciser la raison de votre retard..."
              className="w-full p-3 border border-amber-300 rounded-lg text-sm dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              rows="3"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="!canCheckIn || submitting || !isWithinFence || !!geoError"
            className="w-full py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center space-x-2"
            :class="canCheckIn && isWithinFence && !geoError && !submitting
              ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.99]'
              : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500'"
          >
            <i v-if="submitting" className="fas font-circle-notch fa-spin"></i>
            <i v-else className="fas font-fingerprint"></i>
            <span>{{ submitting ? 'Pointage en cours...' : 'Valider mon pointage' }}</span>
          </button>

          <p v-if="!isWithinFence && !geoError" className="text-xs text-center text-red-500">
            Rapprochez-vous des locaux de l'entreprise pour pouvoir pointer.
          </p>
        </form>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '@/api/axios'
import Swal from 'sweetalert2'

// États réactifs
const loading = ref(true)
const submitting = ref(false)
const gettingLocation = ref(false)

const canCheckIn = ref(false)
const alreadyCheckedIn = ref(false)
const officialOpeningTime = ref('08:00:00')
const officialClosingTime = ref('20:00:00')
const latestAttendance = ref(null)

const companyLat = ref(null)
const companyLng = ref(null)
const geofenceRadius = ref(100)

const userLat = ref(null)
const userLng = ref(null)
const distanceMeters = ref(null)
const geoError = ref(null)

const justification = ref('')
const requireJustification = ref(false)

// Distance Haversine
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null
  const R = 6371e3
  const rad1 = (lat1 * Math.PI) / 180
  const rad2 = (lat2 * Math.PI) / 180
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad1) * Math.cos(rad2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

const isWithinFence = computed(() => {
  if (distanceMeters.value === null) return false
  return distanceMeters.value <= geofenceRadius.value
})

// Obtenir la géolocalisation
const getGeolocation = () => {
  geoError.value = null
  gettingLocation.value = true

  if (!navigator.geolocation) {
    geoError.value = "Géolocalisation non supportée par votre navigateur."
    gettingLocation.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLat.value = pos.coords.latitude
      userLng.value = pos.coords.longitude
      gettingLocation.value = false

      if (companyLat.value && companyLng.value) {
        distanceMeters.value = calculateDistance(
          userLat.value, userLng.value,
          companyLat.value, companyLng.value
        )
      }
    },
    (err) => {
      gettingLocation.value = false
      if (err.code === 1) geoError.value = "Autorisation GPS refusée."
      else if (err.code === 2) geoError.value = "Position GPS indisponible."
      else geoError.value = "Délai d'attente GPS dépassé."
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

// Charger le Dashboard depuis Laravel Render
const fetchDashboard = async () => {
  try {
    loading.value = true
    const { data } = await axios.get('/api/employee/dashboard')
    if (data.success) {
      canCheckIn.value = data.can_check_in
      alreadyCheckedIn.value = data.already_checked_in
      officialOpeningTime.value = data.official_opening_time
      officialClosingTime.value = data.official_closing_time
      latestAttendance.value = data.latest_attendance

      if (data.company_location) {
        companyLat.value = data.company_location.latitude
        companyLng.value = data.company_location.longitude
        geofenceRadius.value = data.company_location.geofence_radius || 100
      }
    }
  } catch (e) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: e.response?.data?.message || 'Impossible de récupérer les données.',
    })
  } finally {
    loading.value = false
    getGeolocation()
  }
}

// Effectuer le pointage
const handleCheckIn = async () => {
  if (!userLat.value || !userLng.value) {
    Swal.fire('GPS requis', 'Veuillez autoriser et activer le GPS.', 'warning')
    return
  }

  try {
    submitting.value = true
    const { data } = await axios.post('/api/attendances/check-in', {
      latitude: userLat.value,
      longitude: userLng.value,
      justification: justification.value.trim() || null
    })

    Swal.fire({
      icon: 'success',
      title: 'Pointé !',
      text: data.message || 'Votre présence a été enregistrée avec succès.',
      timer: 2000,
      showConfirmButton: false
    })

    justification.value = ''
    requireJustification.value = false
    await fetchDashboard()

  } catch (e) {
    const errorData = e.response?.data
    if (errorData?.require_justification) {
      requireJustification.value = true
      Swal.fire('Justification requise', errorData.message, 'warning')
    } else {
      Swal.fire('Erreur de pointage', errorData?.message || 'Une erreur est survenue.', 'error')
    }
  } finally {
    submitting.value = false
  }
}

const formatTime = (isoString) => {
  if (!isoString) return '--:--'
  return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const getStatusLabel = (att) => {
  if (att.status === 'on_time') return "À l'heure"
  if (att.status === 'late') return `Retard (${att.late_minutes} min)`
  return `Grand retard (${att.late_minutes} min)`
}

onMounted(() => {
  fetchDashboard()
})
</script>