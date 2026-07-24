<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-primary">Absences non justifiées</h1>
    <div class="flex gap-4 mb-4">
      <select v-model="statusFilter" @change="fetchData" class="border border-custom rounded p-2 bg-card text-primary">
        <option value="">Tous</option>
        <option value="pending">En attente</option>
        <option value="explained">Expliquées</option>
      </select>
    </div>
    <div class="bg-card rounded-xl shadow-custom overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="p-3 text-primary">Employé</th>
            <th class="p-3 text-primary">Période</th>
            <th class="p-3 text-primary">Statut</th>
            <th class="p-3 text-primary">Explication</th>
            <th class="p-3 text-primary">Justificatif</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="abs in absences" :key="abs.id">
            <td class="p-3 text-primary">{{ abs.user?.name }}</td>
            <td class="p-3 text-primary">{{ abs.from_date }} - {{ abs.to_date }}</td>
            <td class="p-3">
              <span :class="abs.status === 'pending' ? 'text-warning' : 'text-success'">
                {{ abs.status === 'pending' ? 'En attente' : 'Expliquée' }}
              </span>
            </td>
            <td class="p-3 text-primary max-w-xs truncate">{{ abs.explanation || '-' }}</td>
            <td class="p-3">
              <a v-if="abs.justificatif_url" :href="abs.justificatif_url" target="_blank" class="text-accent hover:underline">Voir</a>
              <span v-else class="text-muted">-</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="absences.length === 0" class="p-4 text-muted text-center">Aucune absence.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
const absences = ref([])
const statusFilter = ref('')
async function fetchData() {
  const params = {}
  if (statusFilter.value) params.status = statusFilter.value
  const { data } = await api.get('/admin/unjustified-absences', { params })
  absences.value = data.data || data
}
onMounted(fetchData)
</script>