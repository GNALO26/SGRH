<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold dark:text-white">Mes demandes</h1>
    <div class="flex border-b dark:border-gray-700">
      <button @click="activeTab = 'leaves'" :class="['px-4 py-2 font-medium', activeTab === 'leaves' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 dark:text-gray-400']">
        <i class="fas fa-calendar-minus mr-1"></i>Congés & Absences
      </button>
      <button @click="activeTab = 'retard'" :class="['px-4 py-2 font-medium', activeTab === 'retard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 dark:text-gray-400']">
        <i class="fas fa-clock mr-1"></i>Autorisations de retard
      </button>
    </div>

    <!-- Congés & Absences -->
    <div v-if="activeTab === 'leaves'" class="space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold mb-4 dark:text-white">Nouvelle demande de congé / absence</h2>
        <form @submit.prevent="submitLeave" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm mb-1 dark:text-gray-300">Date de début</label>
              <input type="date" v-model="leaveForm.start_date" required class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm mb-1 dark:text-gray-300">Date de fin</label>
              <input type="date" v-model="leaveForm.end_date" required class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          <div>
            <label class="block text-sm mb-1 dark:text-gray-300">Type</label>
            <select v-model="leaveForm.type" required class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white">
              <option value="absence">Absence</option>
              <option value="vacation">Congé</option>
            </select>
          </div>
          <div>
            <label class="block text-sm mb-1 dark:text-gray-300">Motif</label>
            <textarea v-model="leaveForm.reason" rows="3" required class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white"></textarea>
          </div>
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Envoyer la demande</button>
        </form>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold mb-4 dark:text-white">Historique des demandes</h2>
        <div v-if="leaves.length">
          <div v-for="leave in leaves" :key="leave.id" class="flex justify-between items-center py-3 border-b last:border-0 dark:border-gray-700">
            <div>
              <p class="font-medium dark:text-white">{{ leave.type === 'vacation' ? 'Congé' : 'Absence' }} du {{ leave.start_date }} au {{ leave.end_date }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ leave.reason }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-1 rounded-full text-xs" :class="statusClass(leave.status)">
                {{ statusLabel(leave.status) }}
              </span>
              <button v-if="leave.status === 'pending'" @click="cancelLeave(leave.id)" class="text-red-500 hover:underline text-sm">Annuler</button>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 dark:text-gray-400 py-4 text-center">Aucune demande.</p>
      </div>
    </div>

    <!-- Autorisations de retard -->
    <div v-if="activeTab === 'retard'" class="space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold mb-4 dark:text-white">Demande d'autorisation de retard</h2>
        <form @submit.prevent="submitRetard" class="space-y-4">
          <div>
            <label class="block text-sm mb-1 dark:text-gray-300">Date</label>
            <input type="date" v-model="retardForm.date" required class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm mb-1 dark:text-gray-300">Heure d'arrivée prévue</label>
            <input type="time" v-model="retardForm.expected_arrival" required class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm mb-1 dark:text-gray-300">Motif</label>
            <textarea v-model="retardForm.reason" rows="3" required class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white"></textarea>
          </div>
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Envoyer</button>
        </form>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold mb-4 dark:text-white">Demandes d'autorisation de retard</h2>
        <div v-if="retardAuths.length">
          <div v-for="auth in retardAuths" :key="auth.id" class="flex justify-between items-center py-3 border-b last:border-0 dark:border-gray-700">
            <div>
              <p class="font-medium dark:text-white">{{ auth.date }} - Arrivée prévue {{ auth.expected_arrival }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ auth.reason }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-1 rounded-full text-xs" :class="statusClass(auth.status)">
                {{ statusLabel(auth.status) }}
              </span>
              <button v-if="auth.status === 'pending'" @click="cancelRetard(auth.id)" class="text-red-500 hover:underline text-sm">Annuler</button>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 dark:text-gray-400 py-4 text-center">Aucune demande.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const activeTab = ref('leaves')
const leaves = ref([])
const retardAuths = ref([])
const leaveForm = ref({ start_date: '', end_date: '', type: 'absence', reason: '' })
const retardForm = ref({ date: '', expected_arrival: '', reason: '' })

let pollingInterval = null

function statusClass(status) {
  return {
    'pending': 'bg-yellow-100 text-yellow-700',
    'approved': 'bg-green-100 text-green-700',
    'rejected': 'bg-red-100 text-red-700',
  }[status] || 'bg-gray-100 text-gray-700'
}

function statusLabel(status) {
  return {
    'pending': 'En attente',
    'approved': 'Validée',
    'rejected': 'Refusée',
  }[status] || status
}

async function fetchLeaves() {
  try {
    const { data } = await api.get('/employee/leaves')
    // Détecter les changements de statut
    if (leaves.value.length > 0) {
      data.forEach(newLeave => {
        const oldLeave = leaves.value.find(l => l.id === newLeave.id)
        if (oldLeave && oldLeave.status === 'pending' && newLeave.status !== 'pending') {
          const statusText = newLeave.status === 'approved' ? 'validée' : 'refusée'
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: newLeave.status === 'approved' ? 'success' : 'error',
            title: `Votre demande de ${newLeave.type === 'vacation' ? 'congé' : 'absence'} a été ${statusText}.`,
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
          })
        }
      })
    }
    leaves.value = data
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  }
}

async function fetchRetards() {
  try {
    const { data } = await api.get('/employee/retard-authorizations')
    if (retardAuths.value.length > 0) {
      data.forEach(newAuth => {
        const oldAuth = retardAuths.value.find(a => a.id === newAuth.id)
        if (oldAuth && oldAuth.status === 'pending' && newAuth.status !== 'pending') {
          const statusText = newAuth.status === 'approved' ? 'validée' : 'refusée'
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: newAuth.status === 'approved' ? 'success' : 'error',
            title: `Votre autorisation de retard du ${newAuth.date} a été ${statusText}.`,
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
          })
        }
      })
    }
    retardAuths.value = data
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  }
}

function startPolling() {
  pollingInterval = setInterval(() => {
    if (activeTab.value === 'leaves') fetchLeaves()
    else fetchRetards()
  }, 30000) // 30 secondes
}

onMounted(() => {
  fetchLeaves()
  fetchRetards()
  startPolling()
})

onUnmounted(() => {
  clearInterval(pollingInterval)
})

// Recharger les données lorsqu'on change d'onglet
watch(activeTab, () => {
  if (activeTab.value === 'leaves') fetchLeaves()
  else fetchRetards()
})

async function submitLeave() {
  try {
    await api.post('/employee/leaves', leaveForm.value)
    Swal.fire('Succès', 'Demande envoyée.', 'success')
    leaveForm.value = { start_date: '', end_date: '', type: 'absence', reason: '' }
    fetchLeaves()
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  }
}

async function submitRetard() {
  try {
    await api.post('/employee/retard-authorizations', retardForm.value)
    Swal.fire('Succès', 'Demande envoyée.', 'success')
    retardForm.value = { date: '', expected_arrival: '', reason: '' }
    fetchRetards()
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  }
}

async function cancelLeave(id) {
  const confirm = await Swal.fire({ title: 'Annuler la demande ?', showCancelButton: true, confirmButtonText: 'Oui', cancelButtonText: 'Non' })
  if (confirm.isConfirmed) {
    try {
      await api.delete(`/employee/leaves/${id}`)
      fetchLeaves()
      Swal.fire('Succès', 'Demande annulée', 'success')
    } catch (e) {
      Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
    }
  }
}

async function cancelRetard(id) {
  const confirm = await Swal.fire({ title: 'Annuler la demande ?', showCancelButton: true, confirmButtonText: 'Oui', cancelButtonText: 'Non' })
  if (confirm.isConfirmed) {
    try {
      await api.delete(`/employee/retard-authorizations/${id}`)
      fetchRetards()
      Swal.fire('Succès', 'Demande annulée', 'success')
    } catch (e) {
      Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
    }
  }
}
</script>