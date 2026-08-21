<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-primary">Jours fériés</h1>

    <div class="bg-card rounded-xl shadow-custom p-6">
      <form @submit.prevent="addHoliday" class="flex gap-4 items-end">
        <div>
          <label class="block text-sm text-primary">Date</label>
          <input type="date" v-model="form.date" required class="border border-custom rounded p-2 bg-card text-primary" />
        </div>
        <div class="flex-1">
          <label class="block text-sm text-primary">Description</label>
          <input type="text" v-model="form.description" required class="border border-custom rounded p-2 w-full bg-card text-primary" />
        </div>
        <button type="submit" class="bg-accent text-white px-4 py-2 rounded h-fit hover:bg-accent-hover">Ajouter</button>
      </form>
    </div>

    <div class="bg-card rounded-xl shadow-custom overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr><th class="p-3 text-primary">Date</th><th class="p-3 text-primary">Description</th><th class="p-3 text-primary">Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="holiday in holidays" :key="holiday.id">
            <td class="p-3 text-primary">{{ holiday.date }}</td>
            <td class="p-3 text-primary">{{ holiday.description }}</td>
            <td class="p-3"><button @click="deleteHoliday(holiday.id)" class="text-danger hover:underline">Supprimer</button></td>
          </tr>
        </tbody>
      </table>
      <p v-if="holidays.length === 0" class="p-4 text-muted text-center">Aucun jour férié.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'
const holidays = ref([])
const form = ref({ date: '', description: '' })
async function fetchHolidays() {
  const { data } = await api.get('/holidays')
  holidays.value = data
}
async function addHoliday() {
  try {
    await api.post('/admin/holidays', form.value)
    Swal.fire('Succès', 'Jour férié ajouté', 'success')
    form.value = { date: '', description: '' }
    fetchHolidays()
  } catch (e) { Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error') }
}
async function deleteHoliday(id) {
  const confirm = await Swal.fire({ title: 'Supprimer ?', showCancelButton: true })
  if (confirm.isConfirmed) {
    await api.delete(`/admin/holidays/${id}`)
    fetchHolidays()
  }
}
onMounted(fetchHolidays)
</script>