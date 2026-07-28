<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold dark:text-white">Mes documents</h1>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <div v-if="documents.length">
        <div v-for="doc in documents" :key="doc.id" class="flex justify-between items-center py-3 border-b last:border-0 dark:border-gray-700">
          <div>
            <p class="font-medium dark:text-white">{{ doc.title }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ doc.type }} - {{ new Date(doc.created_at).toLocaleDateString() }}</p>
          </div>
          <button @click="viewDocument(doc)" class="text-blue-600 hover:underline">
            <i class="fas fa-eye mr-1"></i> Voir
          </button>
        </div>
      </div>
      <p v-else class="text-gray-500 dark:text-gray-400">Aucun document disponible.</p>
    </div>

    <!-- Visualiseur de document -->
    <DocumentViewer :visible="viewerVisible" :url="viewerUrl" :title="viewerTitle" @close="viewerVisible = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import DocumentViewer from '@/components/common/DocumentViewer.vue'

const documents = ref([])
const viewerVisible = ref(false)
const viewerUrl = ref('')
const viewerTitle = ref('')

function viewDocument(doc) {
  viewerUrl.value = doc.file_url
  viewerTitle.value = doc.title
  viewerVisible.value = true
}

onMounted(async () => {
  try {
    const { data } = await api.get('/employee/documents')
    documents.value = data
  } catch (e) {
    console.error(e)
  }
})
</script>