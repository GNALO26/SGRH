<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Bulletins de paie</h1>
    <div class="bg-white rounded-xl shadow p-6">
      <div v-if="bulletins.length">
        <div v-for="b in bulletins" :key="b.id" class="flex justify-between items-center py-3 border-b last:border-0">
          <span>{{ b.period }}</span>
          <span>{{ b.net_salary }} FCFA</span>
          <a v-if="b.id" :href="`/api/admin/payroll/${b.id}/download`" target="_blank" class="text-blue-600 hover:underline">
            <i class="fas fa-download mr-1"></i> PDF
          </a>
          <span v-else class="text-gray-400 text-sm">Indisponible</span>
        </div>
      </div>
      <p v-else class="text-gray-500">Aucun bulletin disponible.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

const bulletins = ref([])
onMounted(async () => {
  try {
    const { data } = await api.get('/employee/bulletins')
    bulletins.value = data
  } catch (e) {
    console.error(e)
  }
})
</script>