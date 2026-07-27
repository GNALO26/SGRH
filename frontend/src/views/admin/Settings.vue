<template>
  <div class="space-y-6 max-w-xl">
    <h1 class="text-2xl font-bold dark:text-white">Paramètres de l'entreprise</h1>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <form @submit.prevent="saveSettings" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium dark:text-white">Heure d'ouverture</label>
            <input
              type="time" v-model="form.official_opening_time" required
              :class="['border rounded p-2 w-full dark:bg-gray-700 dark:text-white', fieldErrors.official_opening_time ? 'border-red-500' : '']"
            />
            <p v-if="fieldErrors.official_opening_time" class="text-red-600 text-xs mt-1">{{ fieldErrors.official_opening_time[0] }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium dark:text-white">Heure de fermeture</label>
            <input
              type="time" v-model="form.official_closing_time" required
              :class="['border rounded p-2 w-full dark:bg-gray-700 dark:text-white', fieldErrors.official_closing_time ? 'border-red-500' : '']"
            />
            <p v-if="fieldErrors.official_closing_time" class="text-red-600 text-xs mt-1">{{ fieldErrors.official_closing_time[0] }}</p>
          </div>
        </div>

        <!-- Le reste de la carte et des champs latitude/longitude/rayon reste identique... -->
        <!-- Insérez ici le bloc carte, latitude, longitude, rayon déjà existant -->

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
  official_closing_time: '20:00',  // ← ajouté
  company_latitude: null,
  company_longitude: null,
  geofence_radius_meters: 50,
})

const fieldErrors = ref({})
const locating = ref(false)
let map = null, marker = null

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
  } catch (e) { console.error('Erreur chargement paramètres', e) }

  setTimeout(() => {
    const el = document.getElementById('map')
    if (!el) return
    const lat = form.value.company_latitude || 6.3702
    const lng = form.value.company_longitude || 2.3912
    try {
      map = L.map(el).setView([lat, lng], 15)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map)
      if (form.value.company_latitude && form.value.company_longitude) marker = L.marker([lat, lng]).addTo(map)
      map.on('click', (e) => setPosition(e.latlng.lat, e.latlng.lng))
    } catch (err) { console.error('Erreur initialisation carte', err) }
  }, 200)
})

function setPosition(lat, lng) {
  form.value.company_latitude = lat; form.value.company_longitude = lng
  if (marker) marker.setLatLng([lat, lng]); else marker = L.marker([lat, lng]).addTo(map)
  if (map) map.setView([lat, lng], map.getZoom())
}

function useMyPosition() { /* inchangé */ }

async function saveSettings() {
  fieldErrors.value = {}
  try {
    await api.put('/admin/company-settings', form.value)
    Swal.fire('Succès', 'Paramètres mis à jour avec succès', 'success')
  } catch (e) {
    if (e.response?.status === 422 && e.response.data?.fieldErrors) fieldErrors.value = e.response.data.fieldErrors
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  }
}
</script>