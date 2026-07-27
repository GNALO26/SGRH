<template>
  <div class="space-y-6 max-w-xl">
    <h1 class="text-2xl font-bold dark:text-white">Paramètres de l'entreprise</h1>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <form @submit.prevent="saveSettings" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium dark:text-white">Heure d'ouverture</label>
            <input
              type="time"
              v-model="form.official_opening_time"
              required
              :class="['border rounded p-2 w-full dark:bg-gray-700 dark:text-white', fieldErrors.official_opening_time ? 'border-red-500 ring-1 ring-red-500' : '']"
            />
            <p v-if="fieldErrors.official_opening_time" class="text-red-600 text-xs mt-1">{{ fieldErrors.official_opening_time[0] }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium dark:text-white">Heure de fermeture</label>
            <input
              type="time"
              v-model="form.official_closing_time"
              required
              :class="['border rounded p-2 w-full dark:bg-gray-700 dark:text-white', fieldErrors.official_closing_time ? 'border-red-500 ring-1 ring-red-500' : '']"
            />
            <p v-if="fieldErrors.official_closing_time" class="text-red-600 text-xs mt-1">{{ fieldErrors.official_closing_time[0] }}</p>
          </div>
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
          <div id="map" style="height: 300px; border-radius: 0.5rem; border: 1px solid #ddd;"></div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Cliquez sur la carte ou utilisez le bouton pour définir les coordonnées.</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium dark:text-white">Latitude</label>
            <input
              type="number"
              step="any"
              v-model="form.company_latitude"
              required
              :class="['border rounded p-2 w-full dark:bg-gray-700 dark:text-white', fieldErrors.company_latitude ? 'border-red-500 ring-1 ring-red-500' : '']"
            />
            <p v-if="fieldErrors.company_latitude" class="text-red-600 text-xs mt-1">{{ fieldErrors.company_latitude[0] }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium dark:text-white">Longitude</label>
            <input
              type="number"
              step="any"
              v-model="form.company_longitude"
              required
              :class="['border rounded p-2 w-full dark:bg-gray-700 dark:text-white', fieldErrors.company_longitude ? 'border-red-500 ring-1 ring-red-500' : '']"
            />
            <p v-if="fieldErrors.company_longitude" class="text-red-600 text-xs mt-1">{{ fieldErrors.company_longitude[0] }}</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium dark:text-white">Rayon de tolérance (mètres)</label>
          <input
            type="number"
            v-model="form.geofence_radius_meters"
            required
            min="1"
            :class="['border rounded p-2 w-full dark:bg-gray-700 dark:text-white', fieldErrors.geofence_radius_meters ? 'border-red-500 ring-1 ring-red-500' : '']"
          />
          <p v-if="fieldErrors.geofence_radius_meters" class="text-red-600 text-xs mt-1">{{ fieldErrors.geofence_radius_meters[0] }}</p>
        </div>

        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Enregistrer</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const form = ref({
  official_opening_time: '08:00',
  official_closing_time: '20:00',
  company_latitude: null,
  company_longitude: null,
  geofence_radius_meters: 50,
})

const fieldErrors = ref({})
const locating = ref(false)
let map = null
let marker = null

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/company-settings')
    if (data) {
      form.value = {
        ...form.value,
        ...data,
        official_opening_time: data.official_opening_time?.substring(0, 5) || '08:00',
        official_closing_time: data.official_closing_time?.substring(0, 5) || '20:00',
      }
    }
  } catch (e) {
    console.error('Erreur chargement paramètres', e)
  }

  setTimeout(() => {
    const el = document.getElementById('map')
    if (!el) return

    const lat = form.value.company_latitude || 6.3702
    const lng = form.value.company_longitude || 2.3912

    try {
      map = L.map(el).setView([lat, lng], 15)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      if (form.value.company_latitude && form.value.company_longitude) {
        marker = L.marker([lat, lng]).addTo(map)
      }

      map.on('click', (e) => {
        setPosition(e.latlng.lat, e.latlng.lng)
      })
    } catch (err) {
      console.error('Erreur initialisation carte', err)
    }
  }, 200)
})

function setPosition(lat, lng) {
  form.value.company_latitude = lat
  form.value.company_longitude = lng
  if (marker) {
    marker.setLatLng([lat, lng])
  } else {
    marker = L.marker([lat, lng]).addTo(map)
  }
  if (map) {
    map.setView([lat, lng], map.getZoom())
  }
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

async function saveSettings() {
  fieldErrors.value = {}
  try {
    await api.put('/admin/company-settings', form.value)
    Swal.fire('Succès', 'Paramètres mis à jour avec succès', 'success')
  } catch (e) {
    if (e.response?.status === 422 && e.response.data?.fieldErrors) {
      fieldErrors.value = e.response.data.fieldErrors
    }
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  }
}
</script>