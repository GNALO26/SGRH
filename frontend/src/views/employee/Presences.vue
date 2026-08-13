<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold dark:text-white">Mes présences</h1>
      <div class="flex gap-2">
        <button @click="download('csv')" class="px-3 py-1.5 border rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
          <i class="fas fa-download mr-1"></i>CSV
        </button>
        <button @click="download('pdf')" class="px-3 py-1.5 border rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
          <i class="fas fa-file-pdf mr-1"></i>PDF
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <div class="flex flex-wrap gap-4 mb-4">
        <input type="date" v-model="startDate" class="border rounded p-2 dark:bg-gray-700 dark:text-white" />
        <input type="date" v-model="endDate" class="border rounded p-2 dark:bg-gray-700 dark:text-white" />
        <select v-model="filterStatus" class="border rounded p-2 dark:bg-gray-700 dark:text-white">
          <option value="">Tous</option>
          <option value="on_time">À l'heure</option>
          <option value="late">Retard</option>
          <option value="major_late">Grand retard</option>
          <option value="authorized">Autorisé</option>
        </select>
        <button @click="fetchData" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Filtrer</button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="py-3 px-4 text-left dark:text-white">Date</th>
              <th class="py-3 px-4 text-left dark:text-white">Heure d'arrivée</th>
              <th class="py-3 px-4 text-left dark:text-white">Statut</th>
              <th class="py-3 px-4 text-left dark:text-white">Minutes de retard</th>
              <th class="py-3 px-4 text-left dark:text-white">Justifié</th>
              <th class="py-3 px-4 text-left dark:text-white">Localisation</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="att in attendances"
              :key="att.id"
              :id="`att-${att.id}`"
              class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td class="py-3 px-4 dark:text-white">{{ att.date }}</td>
              <td class="py-3 px-4 dark:text-white">{{ att.check_in_time }}</td>
              <td class="py-3 px-4"><span class="px-2 py-1 rounded-full text-xs" :class="att.statusClass">{{ att.statusLabel }}</span></td>
              <td class="py-3 px-4 dark:text-white">{{ att.late_minutes || '-' }}</td>
              <td class="py-3 px-4 dark:text-white">{{ att.is_justified ? 'Oui' : 'Non' }}</td>
              <td class="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{{ att.latitude }}, {{ att.longitude }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="attendances.length === 0" class="text-gray-500 dark:text-gray-400 py-8 text-center">Aucune présence trouvée.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'
import { useHighlight } from '@/composables/useHighlight'

const attendances = ref([])
const startDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().substr(0,10))
const endDate = ref(new Date().toISOString().substr(0,10))
const filterStatus = ref('')

useHighlight()

async function fetchData() {
  const params = { start_date: startDate.value, end_date: endDate.value, status: filterStatus.value }
  const { data } = await api.get('/employee/attendance/history', { params })
  attendances.value = data.data || data
  attendances.value.forEach(att => {
    switch (att.status) {
      case 'on_time':
        att.statusClass = 'bg-green-100 text-green-700'
        att.statusLabel = 'À l\'heure'
        break
      case 'late':
        att.statusClass = 'bg-orange-100 text-orange-700'
        att.statusLabel = 'Retard'
        break
      case 'major_late':
        att.statusClass = 'bg-red-100 text-red-700'
        att.statusLabel = 'Grand retard'
        break
      case 'authorized':
        att.statusClass = 'bg-blue-100 text-blue-700'
        att.statusLabel = 'Autorisé'
        break
      default:
        att.statusClass = 'bg-gray-100 text-gray-700'
        att.statusLabel = att.status
    }
  })
}

async function download(format) {
  if (!startDate.value || !endDate.value) {
    Swal.fire('Erreur', 'Veuillez sélectionner une plage de dates.', 'warning')
    return
  }
  if (new Date(endDate.value) < new Date(startDate.value)) {
    Swal.fire('Erreur', 'La date de fin doit être postérieure à la date de début.', 'warning')
    return
  }

  try {
    const response = await api.get('/employee/attendance/export', {
      params: { format, start_date: startDate.value, end_date: endDate.value },
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `presences.${format}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (e) {
    console.error('Erreur de téléchargement', e)
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur lors du téléchargement.', 'error')
  }
}

onMounted(fetchData)
</script>