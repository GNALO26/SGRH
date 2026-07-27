<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold dark:text-white">Documents</h1>
      <button @click="showForm = true" class="bg-blue-600 text-white px-4 py-2 rounded"><i class="fas fa-plus mr-1"></i> Ajouter un document</button>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr><th class="p-3 text-left dark:text-white">Titre</th><th class="p-3 text-left dark:text-white">Type</th><th class="p-3 text-left dark:text-white">Employé</th><th class="p-3 text-left dark:text-white">Date</th><th class="p-3 text-left dark:text-white">Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="doc in documents" :key="doc.id" class="border-b dark:border-gray-700">
            <td class="p-3 dark:text-white">{{ doc.title }}</td><td class="p-3 dark:text-white">{{ doc.type }}</td><td class="p-3 dark:text-white">{{ doc.employee?.name || 'Tous' }}</td><td class="p-3 dark:text-white">{{ new Date(doc.created_at).toLocaleDateString() }}</td>
            <td class="p-3 space-x-2"><a :href="doc.file_url" target="_blank" class="text-blue-600 hover:underline">Voir</a><button @click="deleteDoc(doc.id)" class="text-red-600 hover:underline">Supprimer</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 class="text-lg font-bold mb-4 dark:text-white">Ajouter un document</h2>
        <form @submit.prevent="upload" class="space-y-4">
          <div>
            <label class="block text-sm dark:text-white">Titre</label>
            <input v-model="form.title" required :class="['w-full border p-2 rounded dark:bg-gray-700 dark:text-white', fieldErrors.title ? 'border-red-500 ring-1 ring-red-500' : '']" />
            <p v-if="fieldErrors.title" class="text-red-600 text-xs mt-1">{{ fieldErrors.title[0] }}</p>
          </div>
          <div>
            <label class="block text-sm dark:text-white">Fichier</label>
            <input type="file" @change="handleFile" required :class="['w-full border p-2 rounded dark:bg-gray-700 dark:text-white', fieldErrors.file ? 'border-red-500 ring-1 ring-red-500' : '']" />
            <p v-if="fieldErrors.file" class="text-red-600 text-xs mt-1">{{ fieldErrors.file[0] }}</p>
          </div>
          <div>
            <label class="block text-sm dark:text-white">Type</label>
            <select v-model="form.type" required class="w-full border p-2 rounded dark:bg-gray-700 dark:text-white">
              <option value="contract">Contrat</option><option value="amendment">Avenant</option><option value="certificate">Certificat</option><option value="policy">Politique</option><option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label class="block text-sm dark:text-white">Employé (laisser vide pour tous)</label>
            <select v-model="form.employee_id" class="w-full border p-2 rounded dark:bg-gray-700 dark:text-white">
              <option :value="null">Tous</option><option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="showForm = false" class="px-4 py-2 border rounded dark:text-white">Annuler</button>
            <button type="submit" :disabled="submitting" class="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
              {{ submitting ? 'Envoi...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const documents = ref([]), employees = ref([]), showForm = ref(false), submitting = ref(false)
const form = ref({ title: '', type: 'contract', employee_id: null, file: null }), fieldErrors = ref({})

async function fetchDocuments() {
  const { data } = await api.get('/admin/documents'); documents.value = data
}
async function fetchEmployees() {
  const { data } = await api.get('/admin/employees'); employees.value = data
}
function handleFile(e) { form.value.file = e.target.files[0] }

async function upload() {
  if (!form.value.file) { Swal.fire('Erreur', 'Veuillez sélectionner un fichier.', 'warning'); return }
  submitting.value = true; fieldErrors.value = {}
  try {
    const payload = new FormData()
    payload.append('title', form.value.title); payload.append('file', form.value.file); payload.append('type', form.value.type)
    if (form.value.employee_id) payload.append('employee_id', form.value.employee_id)
    await api.post('/admin/documents', payload)
    Swal.fire('Succès', 'Document ajouté', 'success')
    showForm.value = false; form.value = { title: '', type: 'contract', employee_id: null, file: null }
    fetchDocuments()
  } catch (e) {
    if (e.response?.status === 422 && e.response.data?.fieldErrors) fieldErrors.value = e.response.data.fieldErrors
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  } finally { submitting.value = false }
}

async function deleteDoc(id) {
  const confirm = await Swal.fire({ title: 'Supprimer ce document ?', showCancelButton: true })
  if (confirm.isConfirmed) {
    await api.delete(`/admin/documents/${id}`)
    Swal.fire('Supprimé', '', 'success'); fetchDocuments()
  }
}

onMounted(() => { fetchDocuments(); fetchEmployees() })
</script>