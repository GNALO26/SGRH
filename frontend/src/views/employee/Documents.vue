<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-primary">Mes documents</h1>
    <div class="bg-card rounded-xl shadow-custom p-6">
      <div v-if="documents.length">
        <div v-for="doc in documents" :key="doc.id" class="flex justify-between py-2 border-b border-custom last:border-0">
          <div>
            <p class="font-medium text-primary">{{ doc.title }}</p>
            <p class="text-xs text-muted">{{ doc.type }} - {{ new Date(doc.created_at).toLocaleDateString() }}</p>
          </div>
          <a :href="doc.file_url" target="_blank" class="text-accent hover:underline">
            <i class="fas fa-download mr-1"></i> Télécharger
          </a>
        </div>
      </div>
      <p v-else class="text-muted">Aucun document disponible.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
const documents = ref([])
onMounted(async () => {
  const { data } = await api.get('/employee/documents')
  documents.value = data
})
</script>