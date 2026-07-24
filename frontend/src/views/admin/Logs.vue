<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-primary">Journaux d'activité</h1>
    <div class="bg-card rounded-xl shadow-custom p-4">
      <div class="max-h-[600px] overflow-y-auto">
        <div v-for="log in logs" :key="log.id" class="flex items-start gap-3 py-2 border-b border-custom last:border-0">
          <div class="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent">
            <i :class="log.icon || 'fas fa-info-circle'"></i>
          </div>
          <div>
            <p class="text-sm text-primary">{{ log.description }}</p>
            <p class="text-xs text-muted">{{ log.created_at }}</p>
          </div>
        </div>
      </div>
      <p v-if="logs.length === 0" class="text-muted py-4 text-center">Aucune activité enregistrée.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
const logs = ref([])
onMounted(async () => {
  const { data } = await api.get('/admin/logs')
  logs.value = data
})
</script>