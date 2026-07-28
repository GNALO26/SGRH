<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Mes Documents</h1>
      <p class="text-gray-500 text-sm">Consultez et téléchargez vos documents RH (contrats, pièces jointes, justificatifs).</p>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-400">
        <i class="fas fa-spinner fa-spin text-3xl"></i>
        <p class="mt-2 text-sm">Chargement des documents...</p>
      </div>

      <div v-else-if="documents.length === 0" class="p-12 text-center text-gray-400">
        <i class="fas fa-file-pdf text-4xl mb-3 text-gray-300"></i>
        <p class="text-base font-medium text-gray-600">Aucun document disponible</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
              <th class="py-3 px-4">Nom du document</th>
              <th class="py-3 px-4">Type</th>
              <th class="py-3 px-4">Date d'ajout</th>
              <th class="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr v-for="doc in documents" :key="doc.id" class="hover:bg-gray-50/50 transition">
              <td class="py-3.5 px-4 font-medium text-gray-800 flex items-center gap-2">
                <i class="fas fa-file-alt text-blue-500"></i>
                {{ doc.title || doc.name }}
              </td>
              <td class="py-3.5 px-4 text-gray-600 uppercase text-xs font-semibold">{{ doc.type || 'PDF' }}</td>
              <td class="py-3.5 px-4 text-gray-600">{{ formatDate(doc.created_at) }}</td>
              <td class="py-3.5 px-4 text-right">
                <a
                  :href="doc.file_url"
                  target="_blank"
                  rel="noopener"
                  class="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded text-xs font-semibold transition"
                >
                  <i class="fas fa-download mr-1"></i> Télécharger
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const loading = ref(true)
const documents = ref([])

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('fr-FR')
}

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await api.get('/employee/documents')
    documents.value = data || []
  } catch (e) {
    Swal.fire('Erreur', 'Impossible de charger vos documents.', 'error')
  } finally {
    loading.value = false
  }
})
</script>