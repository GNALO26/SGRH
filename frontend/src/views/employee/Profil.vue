<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Mon Profil</h1>
      <p class="text-gray-500 text-sm">Gérez vos informations personnelles et votre sécurité.</p>
    </div>

    <!-- Informations personnelles -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 class="text-lg font-bold text-gray-800 border-b pb-3">Informations personnelles</h2>
      
      <form @submit.prevent="updateProfile" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              v-model="profileForm.first_name"
              required
              class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              v-model="profileForm.last_name"
              required
              class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              v-model="profileForm.email"
              required
              class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="text"
              v-model="profileForm.phone"
              class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="+229 ..."
            />
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="savingProfile"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-50 flex items-center"
          >
            <i v-if="savingProfile" class="fas fa-spinner fa-spin mr-2"></i>
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>

    <!-- Changement de mot de passe -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 class="text-lg font-bold text-gray-800 border-b pb-3">Changer le mot de passe</h2>
      
      <form @submit.prevent="updatePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel *</label>
          <input
            type="password"
            v-model="passwordForm.current_password"
            required
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe *</label>
            <input
              type="password"
              v-model="passwordForm.new_password"
              required
              minlength="8"
              class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe *</label>
            <input
              type="password"
              v-model="passwordForm.new_password_confirmation"
              required
              class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="savingPassword"
            class="bg-slate-800 hover:bg-slate-900 text-white font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-50 flex items-center"
          >
            <i v-if="savingPassword" class="fas fa-spinner fa-spin mr-2"></i>
            Modifier le mot de passe
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/store/auth'
import Swal from 'sweetalert2'

const auth = useAuthStore()
const savingProfile = ref(false)
const savingPassword = ref(false)

const profileForm = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: ''
})

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

onMounted(() => {
  if (auth.user) {
    profileForm.first_name = auth.user.first_name || ''
    profileForm.last_name = auth.user.last_name || ''
    profileForm.email = auth.user.email || ''
    profileForm.phone = auth.user.phone || ''
  }
})

async function updateProfile() {
  savingProfile.value = true
  try {
    const { data } = await api.put('/employee/profile', profileForm)
    if (auth.user) {
      Object.assign(auth.user, data.user || profileForm)
    }
    Swal.fire('Succès', 'Votre profil a été mis à jour.', 'success')
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur lors de la mise à jour.', 'error')
  } finally {
    savingProfile.value = false
  }
}

async function updatePassword() {
  if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
    Swal.fire('Attention', 'Les nouveaux mots de passe ne correspondent pas.', 'warning')
    return
  }

  savingPassword.value = true
  try {
    await api.put('/employee/profile/password', {
      current_password: passwordForm.current_password,
      password: passwordForm.new_password,
      password_confirmation: passwordForm.new_password_confirmation
    })

    Swal.fire('Succès', 'Votre mot de passe a été modifié.', 'success')
    passwordForm.current_password = ''
    passwordForm.new_password = ''
    passwordForm.new_password_confirmation = ''
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur lors du changement de mot de passe.', 'error')
  } finally {
    savingPassword.value = false
  }
}
</script>