<template>
  <div class="space-y-6 max-w-xl">
    <h1 class="text-2xl font-bold dark:text-white">Paramètres de l'entreprise</h1>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <form @submit.prevent="saveSettings" class="space-y-4">
        <div>
          <label class="block text-sm font-medium dark:text-white">Heure d'ouverture officielle</label>
          <input type="time" v-model="form.official_opening_time" required class="border rounded p-2 w-full dark:bg-gray-700 dark:text-white" />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-sm font-medium dark:text-white">Emplacement de l'entreprise</label>
            <button
              type="button"
              @click="useMyPosition"
              :disabled="locating"
              class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              <i v-if="locating" class="fas fa-spinner fa-spin mr-1"></i>
              <i v-else class="fas fa-location-arrow mr-1"></i>
              {{ locating ? 'Localisation...' : 'Utiliser ma position' }}
            </button>
          </div>
          <div ref="mapContainer" style="height: 300px; border-radius: 0.5rem; border: 1px solid #ddd;"></div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Cliquez sur la carte ou utilisez le bouton pour définir les coordonnées.</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium dark:text-white">Latitude</label>
            <input type="number" step="any" v-model="form.company_latitude" required class="border rounded p-2 w-full dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium dark:text-white">Longitude</label>
            <input type="number" step="any" v-model="form.company_longitude" required class="border rounded p-2 w-full dark:bg-gray-700 dark:text-white" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium dark:text-white">Rayon de tolérance (mètres)</label>
          <input type="number" v-model="form.geofence_radius_meters" required min="1" class="border rounded p-2 w-full dark:bg-gray-700 dark:text-white" />
        </div>
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Enregistrer</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watchEffect } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const form = ref({
  official_opening_time: '08:00',
  company_latitude: null,
  company_longitude: null,
  geofence_radius_meters: 50,
})

const locating = ref(false)
const mapContainer = ref(null)
let map = null
let marker = null

async function initMap() {
  if (!mapContainer.value) return
  if (map) return // déjà initialisée

  const lat = form.value.company_latitude || 6.3702
  const lng = form.value.company_longitude || 2.3912

  map = L.map(mapContainer.value).setView([lat, lng], 15)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  if (form.value.company_latitude && form.value.company_longitude) {
    marker = L.marker([lat, lng]).addTo(map)
  }

  map.on('click', (e) => {
    setPosition(e.latlng.lat, e.latlng.lng)
  })
}

function setPosition(lat, lng) {
  form.value.company_latitude = lat
  form.value.company_longitude = lng
  if (marker) {
    marker.setLatLng([lat, lng])
  } else {
    marker = L.marker([lat, lng]).addTo(map)
  }
  map.setView([lat, lng], map.getZoom())
}

function useMyPosition() {
  if (!navigator.geolocation) {
    Swal.fire('Erreur', 'Géolocalisation non supportée.', 'error')
    return
  }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setPosition(pos.coords.latitude, pos.coords.longitude)
      locating.value = false
      Swal.fire('Succès', 'Position actuelle définie.', 'success')
    },
    (err) => {
      locating.value = false
      Swal.fire('Erreur', 'Impossible d\'obtenir votre position : ' + err.message, 'error')
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/company-settings')
    if (data) {
      form.value = { ...form.value, ...data }
    }
  } catch (e) {
    console.error('Erreur chargement paramètres', e)
  }

  await nextTick()
  // On laisse le DOM se stabiliser avant d'initialiser la carte
  setTimeout(() => {
    initMap()
  }, 100)
})

async function saveSettings() {
  try {
    await api.put('/admin/company-settings', form.value)
    Swal.fire('Succès', 'Paramètres mis à jour avec succès', 'success')
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  }
}
</script>