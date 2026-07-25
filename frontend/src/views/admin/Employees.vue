<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold dark:text-white">Employés</h1>
      <button @click="openCreateModal" class="bg-blue-600 text-white px-4 py-2 rounded">
        <i class="fas fa-plus mr-1"></i> Ajouter
      </button>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="p-3 text-left dark:text-white">Nom</th>
            <th class="p-3 text-left dark:text-white">Email</th>
            <th class="p-3 text-left dark:text-white">Matricule</th>
            <th class="p-3 text-left dark:text-white">Poste</th>
            <th class="p-3 text-left dark:text-white">Service</th>
            <th class="p-3 text-left dark:text-white">Salaire</th>
            <th class="p-3 text-left dark:text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in employees" :key="emp.id" class="border-b dark:border-gray-700">
            <td class="p-3 dark:text-white">{{ emp.name }}</td>
            <td class="p-3 dark:text-white">{{ emp.email }}</td>
            <td class="p-3 dark:text-white">{{ emp.matricule || '-' }}</td>
            <td class="p-3 dark:text-white">{{ emp.position || '-' }}</td>
            <td class="p-3 dark:text-white">{{ emp.department || '-' }}</td>
            <td class="p-3 dark:text-white">{{ emp.base_salary || '-' }}</td>
            <td class="p-3 space-x-2">
              <button @click="editEmployee(emp)" class="text-blue-600 hover:underline">Éditer</button>
              <button @click="changePassword(emp)" class="text-yellow-600 hover:underline">Mot de passe</button>
              <button @click="deleteEmployee(emp.id)" class="text-red-600 hover:underline">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal création/édition -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 class="text-lg font-bold mb-4 dark:text-white">{{ editingEmployee ? 'Modifier' : 'Nouvel employé' }}</h2>
        <form @submit.prevent="saveEmployee">
          <div class="mb-3">
            <label class="block text-sm dark:text-white">Nom</label>
            <input v-model="form.name" required class="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="mb-3">
            <label class="block text-sm dark:text-white">Email</label>
            <input v-model="form.email" type="email" required class="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label class="block text-sm dark:text-white">Matricule</label>
              <input v-model="form.matricule" class="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm dark:text-white">Service</label>
              <input v-model="form.department" class="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          <div class="mb-3">
            <label class="block text-sm dark:text-white">Poste</label>
            <input v-model="form.position" class="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="mb-3">
            <label class="block text-sm dark:text-white">Salaire de base</label>
            <input v-model="form.base_salary" type="number" class="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="mb-3" v-if="!editingEmployee">
            <label class="block text-sm dark:text-white">Mot de passe</label>
            <input v-model="form.password" type="password" required class="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="showModal = false" class="px-4 py-2 border rounded dark:text-white">Annuler</button>
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Enregistrer</button>
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

const employees = ref([])
const showModal = ref(false)
const editingEmployee = ref(null)
const form = ref({ name: '', email: '', password: '', matricule: '', position: '', department: '', base_salary: '' })

async function fetchEmployees() {
  const { data } = await api.get('/admin/employees')
  employees.value = data
}

function openCreateModal() {
  editingEmployee.value = null
  form.value = { name: '', email: '', password: '', matricule: '', position: '', department: '', base_salary: '' }
  showModal.value = true
}

function editEmployee(emp) {
  editingEmployee.value = emp
  form.value = { ...emp, password: '' }
  showModal.value = true
}

async function saveEmployee() {
  try {
    if (editingEmployee.value) {
      await api.put(`/admin/employees/${editingEmployee.value.id}`, form.value)
    } else {
      await api.post('/admin/employees', form.value)
    }
    showModal.value = false
    Swal.fire('Succès', 'Employé enregistré', 'success')
    fetchEmployees()
  } catch (e) {
    let errorMessage = 'Erreur inconnue'
    if (e.response?.status === 422 && e.response.data?.errors) {
      const errors = e.response.data.errors
      const firstField = Object.keys(errors)[0]
      errorMessage = errors[firstField][0]
    } else if (e.response?.data?.message) {
      errorMessage = e.response.data.message
    }
    Swal.fire('Erreur', errorMessage, 'error')
  }
}

async function changePassword(emp) {
  const { value: password } = await Swal.fire({
    title: 'Nouveau mot de passe',
    input: 'password',
    inputPlaceholder: 'Mot de passe',
    showCancelButton: true,
    inputValidator: (v) => !v ? 'Champ requis' : null
  })
  if (password) {
    await api.patch(`/admin/employees/${emp.id}/password`, { password, password_confirmation: password })
    Swal.fire('Succès', 'Mot de passe mis à jour', 'success')
  }
}

async function deleteEmployee(id) {
  const confirm = await Swal.fire({ title: 'Confirmer la suppression ?', icon: 'warning', showCancelButton: true })
  if (confirm.isConfirmed) {
    await api.delete(`/admin/employees/${id}`)
    fetchEmployees()
  }
}

onMounted(fetchEmployees)
</script>