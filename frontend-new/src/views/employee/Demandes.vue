<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold dark:text-white">Mes demandes</h1>
    <div class="flex border-b dark:border-gray-700">
      <button @click="activeTab = 'leaves'" :class="['px-4 py-2 font-medium', activeTab === 'leaves' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 dark:text-gray-400']"><i class="fas fa-calendar-minus mr-1"></i>Congés & Absences</button>
      <button @click="activeTab = 'retard'" :class="['px-4 py-2 font-medium', activeTab === 'retard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 dark:text-gray-400']"><i class="fas fa-clock mr-1"></i>Autorisations de retard</button>
    </div>

    <!-- Congés & Absences -->
    <div v-if="activeTab === 'leaves'" class="space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold mb-4 dark:text-white">Nouvelle demande de congé / absence</h2>
        <form @submit.prevent="submitLeave" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm mb-1 dark:text-gray-300">Date de début</label>
              <input type="date" v-model="leaveForm.start_date" required :class="['w-full border rounded p-2 dark:bg-gray-700 dark:text-white', leaveErrors.start_date ? 'border-red-500 ring-1 ring-red-500' : '']" />
              <p v-if="leaveErrors.start_date" class="text-red-600 text-xs mt-1">{{ leaveErrors.start_date[0] }}</p>
            </div>
            <div>
              <label class="block text-sm mb-1 dark:text-gray-300">Date de fin</label>
              <input type="date" v-model="leaveForm.end_date" required :class="['w-full border rounded p-2 dark:bg-gray-700 dark:text-white', leaveErrors.end_date ? 'border-red-500 ring-1 ring-red-500' : '']" />
              <p v-if="leaveErrors.end_date" class="text-red-600 text-xs mt-1">{{ leaveErrors.end_date[0] }}</p>
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
            <textarea v-model="leaveForm.reason" rows="3" required :class="['w-full border rounded p-2 dark:bg-gray-700 dark:text-white', leaveErrors.reason ? 'border-red-500 ring-1 ring-red-500' : '']"></textarea>
            <p v-if="leaveErrors.reason" class="text-red-600 text-xs mt-1">{{ leaveErrors.reason[0] }}</p>
          </div>
          <button type="submit" :disabled="submittingLeave" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            <i v-if="submittingLeave" class="fas fa-spinner fa-spin"></i>
            {{ submittingLeave ? 'Envoi...' : 'Envoyer la demande' }}
          </button>
        </form>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold mb-4 dark:text-white">Historique des demandes</h2>
        <div v-if="leaves.length">
          <div
            v-for="leave in leaves"
            :key="leave.id"
            :id="`leave-${leave.id}`"
            class="flex justify-between items-center py-3 border-b last:border-0 dark:border-gray-700"
          >
            <div>
              <p class="font-medium dark:text-white">{{ leave.type === 'vacation' ? 'Congé' : 'Absence' }} du {{ leave.start_date }} au {{ leave.end_date }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ leave.reason }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-1 rounded-full text-xs" :class="statusClass(leave.status)">{{ statusLabel(leave.status) }}</span>
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
            <input type="date" v-model="retardForm.date" required :class="['w-full border rounded p-2 dark:bg-gray-700 dark:text-white', retardErrors.date ? 'border-red-500 ring-1 ring-red-500' : '']" />
            <p v-if="retardErrors.date" class="text-red-600 text-xs mt-1">{{ retardErrors.date[0] }}</p>
          </div>
          <div>
            <label class="block text-sm mb-1 dark:text-gray-300">Heure d'arrivée prévue</label>
            <input type="time" v-model="retardForm.expected_arrival" required :class="['w-full border rounded p-2 dark:bg-gray-700 dark:text-white', retardErrors.expected_arrival ? 'border-red-500 ring-1 ring-red-500' : '']" />
            <p v-if="retardErrors.expected_arrival" class="text-red-600 text-xs mt-1">{{ retardErrors.expected_arrival[0] }}</p>
          </div>
          <div>
            <label class="block text-sm mb-1 dark:text-gray-300">Motif</label>
            <textarea v-model="retardForm.reason" rows="3" required :class="['w-full border rounded p-2 dark:bg-gray-700 dark:text-white', retardErrors.reason ? 'border-red-500 ring-1 ring-red-500' : '']"></textarea>
            <p v-if="retardErrors.reason" class="text-red-600 text-xs mt-1">{{ retardErrors.reason[0] }}</p>
          </div>
          <button type="submit" :disabled="submittingRetard" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            <i v-if="submittingRetard" class="fas fa-spinner fa-spin"></i>
            {{ submittingRetard ? 'Envoi...' : 'Envoyer' }}
          </button>
        </form>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold mb-4 dark:text-white">Demandes d'autorisation de retard</h2>
        <div v-if="retardAuths.length">
          <div
            v-for="auth in retardAuths"
            :key="auth.id"
            :id="`retard-${auth.id}`"
            class="flex justify-between items-center py-3 border-b last:border-0 dark:border-gray-700"
          >
            <div>
              <p class="font-medium dark:text-white">{{ auth.date }} - Arrivée prévue {{ auth.expected_arrival }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ auth.reason }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-1 rounded-full text-xs" :class="statusClass(auth.status)">{{ statusLabel(auth.status) }}</span>
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
import { useHighlight } from '@/composables/useHighlight'

const activeTab = ref('leaves')
const leaves = ref([])
const retardAuths = ref([])
const leaveForm = ref({ start_date: '', end_date: '', type: 'absence', reason: '' })
const retardForm = ref({ date: '', expected_arrival: '', reason: '' })
const leaveErrors = ref({})
const retardErrors = ref({})
const submittingLeave = ref(false)
const submittingRetard = ref(false)
let pollingInterval = null

useHighlight()

function statusClass(s) { return { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' }[s] || '' }
function statusLabel(s) { return { pending: 'En attente', approved: 'Validée', rejected: 'Refusée' }[s] || s }

async function fetchLeaves() {
  try {
    const { data } = await api.get('/employee/leaves')
    leaves.value.forEach(old => {
      const n = data.find(l => l.id === old.id)
      if (n && old.status === 'pending' && n.status !== 'pending') {
        Swal.fire({ toast: true, position: 'top-end', icon: n.status === 'approved' ? 'success' : 'error', title: `Votre demande de ${n.type === 'vacation' ? 'congé' : 'absence'} a été ${n.status === 'approved' ? 'validée' : 'refusée'}.`, showConfirmButton: false, timer: 5000 })
      }
    })
    leaves.value = data
  } catch (e) { Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error') }
}

async function fetchRetards() {
  try {
    const { data } = await api.get('/employee/retard-authorizations')
    retardAuths.value.forEach(old => {
      const n = data.find(a => a.id === old.id)
      if (n && old.status === 'pending' && n.status !== 'pending') {
        Swal.fire({ toast: true, position: 'top-end', icon: n.status === 'approved' ? 'success' : 'error', title: `Votre autorisation de retard du ${n.date} a été ${n.status === 'approved' ? 'validée' : 'refusée'}.`, showConfirmButton: false, timer: 5000 })
      }
    })
    retardAuths.value = data
  } catch (e) { Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error') }
}

function startPolling() { pollingInterval = setInterval(() => { if (activeTab.value === 'leaves') fetchLeaves(); else fetchRetards() }, 30000) }

onMounted(() => { fetchLeaves(); fetchRetards(); startPolling() })
onUnmounted(() => clearInterval(pollingInterval))
watch(activeTab, () => { if (activeTab.value === 'leaves') fetchLeaves(); else fetchRetards() })

async function submitLeave() {
  if (submittingLeave.value) return
  submittingLeave.value = true
  leaveErrors.value = {}
  try {
    await api.post('/employee/leaves', leaveForm.value)
    Swal.fire('Succès', 'Demande envoyée.', 'success')
    leaveForm.value = { start_date: '', end_date: '', type: 'absence', reason: '' }
    fetchLeaves()
  } catch (e) {
    if (e.response?.status === 422 && e.response.data?.fieldErrors) leaveErrors.value = e.response.data.fieldErrors
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  } finally { submittingLeave.value = false }
}

async function submitRetard() {
  if (submittingRetard.value) return
  submittingRetard.value = true
  retardErrors.value = {}
  try {
    await api.post('/employee/retard-authorizations', retardForm.value)
    Swal.fire('Succès', 'Demande envoyée.', 'success')
    retardForm.value = { date: '', expected_arrival: '', reason: '' }
    fetchRetards()
  } catch (e) {
    if (e.response?.status === 422 && e.response.data?.fieldErrors) retardErrors.value = e.response.data.fieldErrors
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  } finally { submittingRetard.value = false }
}

async function cancelLeave(id) {
  if ((await Swal.fire({ title: 'Annuler la demande ?', showCancelButton: true })).isConfirmed) {
    await api.delete(`/employee/leaves/${id}`)
    fetchLeaves()
    Swal.fire('Succès', 'Demande annulée', 'success')
  }
}

async function cancelRetard(id) {
  if ((await Swal.fire({ title: 'Annuler la demande ?', showCancelButton: true })).isConfirmed) {
    await api.delete(`/employee/retard-authorizations/${id}`)
    fetchRetards()
    Swal.fire('Succès', 'Demande annulée', 'success')
  }
}
</script>