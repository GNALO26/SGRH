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
            <td class="p-3 relative">
              <button @click="toggleMenu(emp.id)" class="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white focus:outline-none">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <!-- Menu déroulant -->
              <div v-if="activeMenu === emp.id" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <button @click="editEmployee(emp); activeMenu = null" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                  <i class="fas fa-edit text-blue-600"></i> Éditer
                </button>
                <button @click="changePassword(emp); activeMenu = null" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                  <i class="fas fa-key text-yellow-600"></i> Mot de passe
                </button>
                <button @click="deleteEmployee(emp.id); activeMenu = null" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                  <i class="fas fa-trash-alt text-red-600"></i> Supprimer
                </button>
              </div>
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
            <input v-model="form.name" required :class="['w-full border p-2 rounded dark:bg-gray-700 dark:text-white', fieldErrors.name ? 'border-red-500 ring-1 ring-red-500' : '']" />
            <p v-if="fieldErrors.name" class="text-red-600 text-xs mt-1">{{ fieldErrors.name[0] }}</p>
          </div>
          <div class="mb-3">
            <label class="block text-sm dark:text-white">Email</label>
            <input v-model="form.email" type="email" required :class="['w-full border p-2 rounded dark:bg-gray-700 dark:text-white', fieldErrors.email ? 'border-red-500 ring-1 ring-red-500' : '']" />
            <p v-if="fieldErrors.email" class="text-red-600 text-xs mt-1">{{ fieldErrors.email[0] }}</p>
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
            <input v-model="form.base_salary" type="number" :class="['w-full border p-2 rounded dark:bg-gray-700 dark:text-white', fieldErrors.base_salary ? 'border-red-500 ring-1 ring-red-500' : '']" />
            <p v-if="fieldErrors.base_salary" class="text-red-600 text-xs mt-1">{{ fieldErrors.base_salary[0] }}</p>
          </div>
          <div class="mb-3" v-if="!editingEmployee">
            <label class="block text-sm dark:text-white">Mot de passe</label>
            <div class="relative">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required :class="['w-full border p-2 rounded pr-10 dark:bg-gray-700 dark:text-white', fieldErrors.password ? 'border-red-500 ring-1 ring-red-500' : '']" />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabindex="-1">
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <p v-if="fieldErrors.password" class="text-red-600 text-xs mt-1">{{ fieldErrors.password[0] }}</p>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="showModal = false" class="px-4 py-2 border rounded dark:text-white">Annuler</button>
            <button type="submit" :disabled="submitting" class="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
              <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
              {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const employees = ref([])
const showModal = ref(false)
const editingEmployee = ref(null)
const form = ref({ name: '', email: '', password: '', matricule: '', position: '', department: '', base_salary: '' })
const submitting = ref(false)
const showPassword = ref(false)
const fieldErrors = reactive({})
const activeMenu = ref(null)

function toggleMenu(id) {
  activeMenu.value = activeMenu.value === id ? null : id
}

async function fetchEmployees() {
  const { data } = await api.get('/admin/employees')
  employees.value = data
}

function openCreateModal() {
  editingEmployee.value = null
  form.value = { name: '', email: '', password: '', matricule: '', position: '', department: '', base_salary: '' }
  showPassword.value = false
  Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
  showModal.value = true
}

function editEmployee(emp) {
  editingEmployee.value = emp
  form.value = { ...emp, password: '' }
  showPassword.value = false
  Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
  showModal.value = true
}

async function saveEmployee() {
  if (submitting.value) return
  submitting.value = true
  Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
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
    if (e.response?.status === 422 && e.response.data?.fieldErrors) {
      Object.assign(fieldErrors, e.response.data.fieldErrors)
    }
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  } finally {
    submitting.value = false
  }
}

async function changePassword(emp) {
  const { value: password } = await Swal.fire({
    title: 'Nouveau mot de passe',
    input: 'password',
    inputPlaceholder: 'Mot de passe',
    showCancelButton: true,
    inputValidator: (v) => !v ? 'Champ requis' : (v.length < 8 ? 'Minimum 8 caractères' : null)
  })
  if (password) {
    try {
      await api.patch(`/admin/employees/${emp.id}/password`, { password, password_confirmation: password })
      Swal.fire('Succès', 'Mot de passe mis à jour', 'success')
    } catch (e) {
      Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
    }
  }
}

async function deleteEmployee(id) {
  const confirm = await Swal.fire({ title: 'Confirmer la suppression ?', icon: 'warning', showCancelButton: true })
  if (confirm.isConfirmed) {
    try {
      await api.delete(`/admin/employees/${id}`)
      Swal.fire('Succès', 'Employé supprimé', 'success')
      fetchEmployees()
    } catch (e) {
      Swal.fire('Erreur', e.response?.data?.message || e.message || 'Erreur lors de la suppression', 'error')
    }
  }
}

onMounted(fetchEmployees)
</script>