<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-primary">Documents</h1>
      <button @click="showForm = true" class="bg-accent text-white px-4 py-2 rounded hover:bg-accent-hover transition-colors">
        <i class="fas fa-plus mr-1"></i> Ajouter un document
      </button>
    </div>

    <!-- Tableau des documents -->
    <div class="bg-card rounded-xl shadow-custom overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="p-3 text-left text-primary">Titre</th>
            <th class="p-3 text-left text-primary">Type</th>
            <th class="p-3 text-left text-primary">Employé</th>
            <th class="p-3 text-left text-primary">Date</th>
            <th class="p-3 text-left text-primary">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in documents" :key="doc.id" class="border-b border-custom hover:bg-card-hover">
            <td class="p-3 text-primary">{{ doc.title }}</td>
            <td class="p-3 text-primary">{{ doc.type }}</td>
            <td class="p-3 text-primary">{{ doc.employee?.name || 'Tous' }}</td>
            <td class="p-3 text-primary">{{ new Date(doc.created_at).toLocaleDateString() }}</td>
            <td class="p-3 space-x-2">
              <a :href="doc.file_url" target="_blank" class="text-accent hover:underline">Voir</a>
              <button @click="deleteDoc(doc.id)" class="text-danger hover:underline">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="documents.length === 0" class="p-4 text-muted text-center">Aucun document.</p>
    </div>

    <!-- Modal ajout -->
    <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showForm = false">
      <div class="bg-card rounded-xl p-6 w-full max-w-md shadow-custom border border-custom">
        <h2 class="text-lg font-bold mb-4 text-primary">Ajouter un document</h2>
        <form @submit.prevent="upload" class="space-y-4">
          <div>
            <label class="block text-sm text-primary">Titre</label>
            <input v-model="form.title" required class="w-full border border-custom rounded p-2 bg-card text-primary focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label class="block text-sm text-primary">Fichier</label>
            <input type="file" @change="handleFile" required class="w-full border border-custom rounded p-2 bg-card text-primary file:bg-accent file:text-white file:border-none file:rounded file:px-3 file:py-1" />
          </div>
          <div>
            <label class="block text-sm text-primary">Type</label>
            <select v-model="form.type" required class="w-full border border-custom rounded p-2 bg-card text-primary">
              <option value="contract">Contrat</option>
              <option value="amendment">Avenant</option>
              <option value="certificate">Certificat</option>
              <option value="policy">Politique</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-primary">Employé (laisser vide pour tous)</label>
            <select v-model="form.employee_id" class="w-full border border-custom rounded p-2 bg-card text-primary">
              <option :value="null">Tous</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="showForm = false" class="px-4 py-2 border border-custom rounded text-primary hover:bg-card-hover">Annuler</button>
            <button type="submit" class="bg-accent text-white px-4 py-2 rounded hover:bg-accent-hover transition-colors">Enregistrer</button>
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

const documents = ref([])
const employees = ref([])
const showForm = ref(false)
const form = ref({ title: '', type: 'contract', employee_id: null, file: null })

async function fetchDocuments() {
  try {
    const { data } = await api.get('/admin/documents')
    documents.value = data
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  }
}

async function fetchEmployees() {
  try {
    const { data } = await api.get('/admin/employees')
    employees.value = data
  } catch (e) {
    console.error('Erreur chargement employés', e)
  }
}

function handleFile(e) {
  form.value.file = e.target.files[0]
}

async function upload() {
  if (!form.value.file) {
    Swal.fire('Erreur', 'Veuillez sélectionner un fichier.', 'warning')
    return
  }
  try {
    const payload = new FormData()
    payload.append('title', form.value.title)
    payload.append('file', form.value.file)
    payload.append('type', form.value.type)
    if (form.value.employee_id) payload.append('employee_id', form.value.employee_id)

    await api.post('/admin/documents', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    Swal.fire('Succès', 'Document ajouté', 'success')
    showForm.value = false
    form.value = { title: '', type: 'contract', employee_id: null, file: null }
    fetchDocuments()
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  }
}

async function deleteDoc(id) {
  const confirm = await Swal.fire({ title: 'Supprimer ce document ?', showCancelButton: true, confirmButtonText: 'Supprimer', cancelButtonText: 'Annuler' })
  if (confirm.isConfirmed) {
    try {
      await api.delete(`/admin/documents/${id}`)
      Swal.fire('Supprimé', '', 'success')
      fetchDocuments()
    } catch (e) {
      Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
    }
  }
}

onMounted(() => {
  fetchDocuments()
  fetchEmployees()
})
</script>