<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold dark:text-white">Pointages</h1>
    <div class="flex gap-4 items-end flex-wrap">
      <div>
        <label class="block text-sm mb-1 dark:text-gray-300">Date</label>
        <input type="date" v-model="filters.date" class="border rounded p-2 dark:bg-gray-700 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm mb-1 dark:text-gray-300">Rechercher</label>
        <input v-model="filters.search" type="text" placeholder="Nom ou email..." class="border rounded p-2 dark:bg-gray-700 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm mb-1 dark:text-gray-300">Statut</label>
        <select v-model="filters.status" class="border rounded p-2 dark:bg-gray-700 dark:text-white">
          <option value="">Tous</option>
          <option value="on_time">À l'heure</option>
          <option value="late">Retard standard</option>
          <option value="major_late">Grand retard</option>
          <option value="authorized">Autorisé</option>
        </select>
      </div>
      <button @click="fetchData" class="bg-blue-600 text-white px-4 py-2 rounded h-fit">Filtrer</button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="p-3 text-left dark:text-white">Employé</th>
            <th class="p-3 text-left dark:text-white">Date</th>
            <th class="p-3 text-left dark:text-white">Heure</th>
            <th class="p-3 text-left dark:text-white">Statut</th>
            <th class="p-3 text-left dark:text-white">Retard (min)</th>
            <th class="p-3 text-left dark:text-white">Justifié</th>
            <th class="p-3 text-left dark:text-white">Justification</th>
            <th class="p-3 text-left dark:text-white">Coordonnées GPS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="att in attendances" :key="att.id" class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="p-3 dark:text-white">{{ att.user?.name || 'Utilisateur supprimé' }}</td>
            <td class="p-3 dark:text-white">{{ att.date }}</td>
            <td class="p-3 dark:text-white">{{ att.check_in_time }}</td>
            <td class="p-3">
              <span :class="statusClass(att.status)">{{ att.status }}</span>
            </td>
            <td class="p-3 dark:text-white">{{ att.late_minutes }}</td>
            <td class="p-3 dark:text-white">{{ att.is_justified ? 'Oui' : 'Non' }}</td>
            <td class="p-3 max-w-xs truncate dark:text-white">{{ att.justification || '-' }}</td>
            <td class="p-3 text-xs text-gray-500 dark:text-gray-400">{{ att.latitude }}, {{ att.longitude }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="attendances.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">Aucun pointage trouvé.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

const filters = ref({ date: '', search: '', status: '' })
const attendances = ref([])

const statusClass = (status) => {
  switch (status) {
    case 'on_time': return 'px-2 py-1 rounded-full text-xs bg-green-100 text-green-700'
    case 'late': return 'px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700'
    case 'major_late': return 'px-2 py-1 rounded-full text-xs bg-red-100 text-red-700'
    case 'authorized': return 'px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700'
    default: return ''
  }
}

async function fetchData() {
  const params = {}
  if (filters.value.date) params.date = filters.value.date
  if (filters.value.search) params.search = filters.value.search
  if (filters.value.status) params.status = filters.value.status
  const { data } = await api.get('/admin/attendances', { params })
  attendances.value = data.data || data
}

onMounted(fetchData)
</script>