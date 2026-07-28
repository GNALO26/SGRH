<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Mes demandes de congés</h1>
        <p class="text-gray-500 text-sm">Soumettez une nouvelle demande ou consultez l'état de vos demandes passées.</p>
      </div>
      <button
        @click="showModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition flex items-center justify-center shadow-sm"
      >
        <i class="fas fa-plus mr-2"></i> Nouvelle demande
      </button>
    </div>

    <!-- Tableau des demandes -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-400">
        <i class="fas fa-spinner fa-spin text-3xl"></i>
        <p class="mt-2 text-sm">Chargement des demandes...</p>
      </div>

      <div v-else-if="requests.length === 0" class="p-12 text-center text-gray-400">
        <i class="fas fa-umbrella-beach text-4xl mb-3 text-gray-300"></i>
        <p class="text-base font-medium text-gray-600">Aucune demande de congé enregistrée</p>
        <p class="text-sm mt-1">Cliquez sur le bouton ci-dessus pour effectuer votre première demande.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th class="py-3 px-4">Type</th>
              <th class="py-3 px-4">Date début</th>
              <th class="py-3 px-4">Date fin</th>
              <th class="py-3 px-4">Durée</th>
              <th class="py-3 px-4">Raison</th>
              <th class="py-3 px-4">Statut</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr v-for="req in requests" :key="req.id" class="hover:bg-gray-50/50 transition">
              <td class="py-3.5 px-4 font-semibold text-gray-800">{{ getLeaveTypeLabel(req.type) }}</td>
              <td class="py-3.5 px-4 text-gray-600">{{ formatDate(req.start_date) }}</td>
              <td class="py-3.5 px-4 text-gray-600">{{ formatDate(req.end_date) }}</td>
              <td class="py-3.5 px-4 text-gray-600 font-medium">{{ req.days_count }} jour(s)</td>
              <td class="py-3.5 px-4 text-gray-500 max-w-xs truncate" :title="req.reason">
                {{ req.reason || '-' }}
              </td>
              <td class="py-3.5 px-4">
                <span
                  :class="{
                    'bg-amber-100 text-amber-800': req.status === 'pending',
                    'bg-emerald-100 text-emerald-800': req.status === 'approved',
                    'bg-rose-100 text-rose-800': req.status === 'rejected'
                  }"
                  class="px-2.5 py-1 rounded-full text-xs font-semibold inline-block"
                >
                  {{ formatStatus(req.status) }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-right">
                <button
                  v-if="req.status === 'pending'"
                  @click="cancelRequest(req.id)"
                  class="text-rose-600 hover:text-rose-800 text-xs font-medium bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded transition"
                >
                  Annuler
                </button>
                <span v-else class="text-gray-400 text-xs">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Nouvelle Demande -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in">
        <div class="flex justify-between items-center border-b pb-3">
          <h2 class="text-lg font-bold text-gray-800">Demander un congé</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <form @submit.prevent="submitLeaveRequest" class="space-y-4">
          <!-- Type de congé -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type de congé *</label>
            <select
              v-model="form.type"
              required
              class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="" disabled>Sélectionnez un type</option>
              <option value="paid">Congé Payé</option>
              <option value="sick">Congé Maladie</option>
              <option value="unpaid">Congé Sans Solde</option>
              <option value="maternity">Maternité / Paternité</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
              <input
                type="date"
                v-model="form.start_date"
                required
                class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin *</label>
              <input
                type="date"
                v-model="form.end_date"
                required
                class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <!-- Raison -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Motif / Raison *</label>
            <textarea
              v-model="form.reason"
              rows="3"
              required
              placeholder="Explication détaillée de votre demande..."
              class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            ></textarea>
          </div>

          <!-- Pièce jointe -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pièce jointe (facultatif)</label>
            <input
              type="file"
              @change="handleFileChange"
              accept=".pdf,.jpg,.jpeg,.png"
              class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border rounded-lg p-1"
            />
          </div>

          <!-- Actions modal -->
          <div class="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm disabled:opacity-50 flex items-center"
            >
              <i v-if="submitting" class="fas fa-spinner fa-spin mr-2"></i>
              {{ submitting ? 'Soumission...' : 'Envoyer la demande' }}
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

const loading = ref(true)
const submitting = ref(false)
const showModal = ref(false)
const requests = ref([])

const form = reactive({
  type: '',
  start_date: '',
  end_date: '',
  reason: '',
  file: null
})

function getLeaveTypeLabel(type) {
  const types = {
    paid: 'Congé Payé',
    sick: 'Congé Maladie',
    unpaid: 'Congé Sans Solde',
    maternity: 'Maternité / Paternité',
    other: 'Autre'
  }
  return types[type] || type
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('fr-FR')
}

function formatStatus(status) {
  switch (status) {
    case 'pending': return 'En attente'
    case 'approved': return 'Approuvée'
    case 'rejected': return 'Refusée'
    default: return status
  }
}

function handleFileChange(event) {
  form.file = event.target.files[0] || null
}

function closeModal() {
  showModal.value = false
  form.type = ''
  form.start_date = ''
  form.end_date = ''
  form.reason = ''
  form.file = null
}

async function loadRequests() {
  loading.value = true
  try {
    const { data } = await api.get('/employee/leave-requests')
    requests.value = data || []
  } catch (e) {
    Swal.fire('Erreur', 'Impossible de charger l\'historique des congés.', 'error')
  } finally {
    loading.value = false
  }
}

async function submitLeaveRequest() {
  if (new Date(form.start_date) > new Date(form.end_date)) {
    Swal.fire('Attention', 'La date de début ne peut pas être supérieure à la date de fin.', 'warning')
    return
  }

  submitting.value = true
  try {
    const payload = new FormData()
    payload.append('type', form.type)
    payload.append('start_date', form.start_date)
    payload.append('end_date', form.end_date)
    payload.append('reason', form.reason)
    if (form.file) payload.append('attachment', form.file)

    await api.post('/employee/leave-requests', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    Swal.fire('Succès', 'Votre demande de congé a été transmise.', 'success')
    closeModal()
    await loadRequests()
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur lors de l\'envoi de la demande.', 'error')
  } finally {
    submitting.value = false
  }
}

async function cancelRequest(id) {
  const result = await Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: 'Voulez-vous vraiment annuler cette demande ?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Oui, annuler',
    cancelButtonText: 'Non'
  })

  if (result.isConfirmed) {
    try {
      await api.delete(`/employee/leave-requests/${id}`)
      Swal.fire('Annulée', 'La demande a été annulée.', 'success')
      await loadRequests()
    } catch (e) {
      Swal.fire('Erreur', 'Impossible d\'annuler cette demande.', 'error')
    }
  }
}

onMounted(() => {
  loadRequests()
})
</script>