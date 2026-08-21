<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold dark:text-white">Mon profil</h1>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6 max-w-lg">
      <div class="flex items-center gap-4 mb-6">
        <img :src="avatar" class="h-16 w-16 rounded-full object-cover border-2 border-blue-200" />
        <div>
          <h2 class="text-xl font-semibold dark:text-white">{{ user.name }}</h2>
          <p class="text-gray-500 dark:text-gray-400">{{ user.email }}</p>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium mb-2 dark:text-white">Changer la photo de profil</label>
        <input type="file" @change="handleFile" accept="image/*" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" />
        <button @click="uploadAvatar" class="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Mettre à jour</button>
      </div>

      <div class="space-y-3">
        <div><span class="text-sm text-gray-500 dark:text-gray-400">Rôle :</span> <span class="dark:text-white">Administrateur</span></div>
        <div><span class="text-sm text-gray-500 dark:text-gray-400">Email :</span> <span class="dark:text-white">{{ user.email }}</span></div>
      </div>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-4">Pour modifier vos informations, contactez le super administrateur.</p>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/store/auth'
import { computed, ref } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const auth = useAuthStore()
const user = computed(() => auth.user)
const avatarFile = ref(null)

const avatar = computed(() =>
  auth.user?.avatar_url ||
  'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.value?.name || '') + '&background=0D47A1&color=fff'
)

function handleFile(e) {
  avatarFile.value = e.target.files[0]
}

async function uploadAvatar() {
  if (!avatarFile.value) {
    Swal.fire('Erreur', 'Veuillez sélectionner un fichier.', 'warning')
    return
  }
  try {
    const form = new FormData()
    form.append('avatar', avatarFile.value)
    const { data } = await api.post('/user/avatar', form)
    auth.user.avatar_url = data.avatar_url
    Swal.fire('Succès', 'Photo mise à jour.', 'success')
    avatarFile.value = null
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  }
}
</script>