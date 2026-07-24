<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-primary">Utilisateurs & Rôles</h1>
      <button @click="showCreateForm = true" class="bg-accent text-white px-4 py-2 rounded hover:bg-accent-hover">
        <i class="fas fa-plus mr-1"></i> Ajouter un admin
      </button>
    </div>

    <div class="bg-card rounded-xl shadow-custom overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr><th class="p-3 text-primary">Nom</th><th class="p-3 text-primary">Email</th><th class="p-3 text-primary">Rôle</th><th class="p-3 text-primary">Créé le</th><th class="p-3 text-primary">Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-b border-custom">
            <td class="p-3 text-primary">{{ user.name }}</td>
            <td class="p-3 text-primary">{{ user.email }}</td>
            <td class="p-3 text-primary">{{ user.role }}</td>
            <td class="p-3 text-primary">{{ user.created_at }}</td>
            <td class="p-3">
              <button v-if="!user.is_primary" @click="deleteUser(user.id)" class="text-danger hover:underline">Supprimer</button>
              <span v-else class="text-muted">Admin principal</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showCreateForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-card rounded-xl p-6 w-full max-w-md shadow-custom border border-custom">
        <h2 class="text-lg font-bold mb-4 text-primary">Nouvel administrateur</h2>
        <form @submit.prevent="createUser">
          <div class="mb-3"><label class="block text-sm text-primary">Nom</label><input v-model="newUser.name" required class="w-full border border-custom p-2 rounded bg-card text-primary" /></div>
          <div class="mb-3"><label class="block text-sm text-primary">Email</label><input v-model="newUser.email" type="email" required class="w-full border border-custom p-2 rounded bg-card text-primary" /></div>
          <div class="mb-3"><label class="block text-sm text-primary">Mot de passe</label><input v-model="newUser.password" type="password" required class="w-full border border-custom p-2 rounded bg-card text-primary" /></div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="showCreateForm = false" class="px-4 py-2 border border-custom rounded text-primary">Annuler</button>
            <button type="submit" class="bg-accent text-white px-4 py-2 rounded hover:bg-accent-hover">Créer</button>
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

const users = ref([])
const showCreateForm = ref(false)
const newUser = ref({ name: '', email: '', password: '' })

async function fetchUsers() {
  const { data } = await api.get('/admin/users')
  users.value = data
}

async function createUser() {
  try {
    await api.post('/admin/users', newUser.value)
    Swal.fire('Succès', 'Administrateur créé', 'success')
    showCreateForm.value = false
    newUser.value = { name: '', email: '', password: '' }
    fetchUsers()
  } catch (e) { Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error') }
}

async function deleteUser(id) {
  const confirm = await Swal.fire({ title: 'Supprimer cet administrateur ?', showCancelButton: true, confirmButtonText: 'Supprimer', cancelButtonText: 'Annuler' })
  if (confirm.isConfirmed) {
    await api.delete(`/admin/users/${id}`)
    Swal.fire('Supprimé', '', 'success')
    fetchUsers()
  }
}

onMounted(fetchUsers)
</script>