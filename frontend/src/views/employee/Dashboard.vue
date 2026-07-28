<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          Bienvenue, {{ auth.user?.first_name || auth.user?.name || 'Employé' }} 👋
        </h1>
        <p class="text-gray-500 text-sm">
          Voici le résumé de votre situation, de vos congés et de vos absences.
        </p>
      </div>
      <div class="flex gap-3">
        <router-link
          to="/employee/leave-requests"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition flex items-center shadow-sm"
        >
          <i class="fas fa-plus mr-2"></i> Demander un congé
        </router-link>
      </div>
    </div>

    <!-- Alerte Absences non justifiées -->
    <div
      v-if="stats.unjustifiedCount > 0"
      class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div class="flex items-center gap-3">
        <i class="fas fa-exclamation-triangle text-amber-500 text-2xl flex-shrink-0"></i>
        <div>
          <h3 class="font-semibold text-amber-800">
            {{ stats.unjustifiedCount }} absence(s) non explicative(s) détectée(s)
          </h3>
          <p class="text-amber-700 text-sm">
            Vous devez fournir une explication ou un justificatif pour régulariser votre dossier.
          </p>
        </div>
      </div>
      <router-link
        to="/employee/unjustified-absences"
        class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md font-medium text-sm transition whitespace-nowrap"
      >
        Justifier maintenant
      </router-link>
    </div>

    <!-- Cartes de Statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <!-- Solde de congés -->
      <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Solde de congés</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ stats.leaveBalance }} <span class="text-sm font-normal text-gray-500">jours</span></p>
        </div>
        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
          <i class="fas fa-umbrella-beach"></i>
        </div>
      </div>

      <!-- Demandes en attente -->
      <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Congés en attente</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ stats.pendingLeaveRequests }}</p>
        </div>
        <div class="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center text-xl">
          <i class="fas fa-clock"></i>
        </div>
      </div>

      <!-- Absences ce mois -->
      <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Absences ce mois</p>
          <p class="text-2xl font-bold text-gray-800 mt-1">{{ stats.absencesThisMonth }} <span class="text-sm font-normal text-gray-500">jour(s)</span></p>
        </div>
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl">
          <i class="fas fa-user-clock"></i>
        </div>
      </div>

      <!-- Absences non justifiées -->
      <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Non justifiées</p>
          <p class="text-2xl font-bold text-red-600 mt-1">{{ stats.unjustifiedCount }}</p>
        </div>
        <div class="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-xl">
          <i class="fas fa-exclamation-circle"></i>
        </div>
      </div>
    </div>

    <!-- Section du bas : Demandes récentes & Raccourcis -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Liste des dernières demandes de congés -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-gray-800">Dernières demandes de congés</h2>
          <router-link to="/employee/leave-requests" class="text-sm text-blue-600 hover:underline font-medium">
            Voir tout
          </router-link>
        </div>

        <div v-if="loading" class="py-8 text-center text-gray-400">
          <i class="fas fa-spinner fa-spin text-2xl"></i>
          <p class="mt-2 text-sm">Chargement des données...</p>
        </div>

        <div v-else-if="recentLeaveRequests.length === 0" class="py-8 text-center text-gray-400">
          <i class="fas fa-folder-open text-3xl mb-2"></i>
          <p class="text-sm">Aucune demande de congé enregistrée récemment.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
                <th class="py-3 px-2">Type</th>
                <th class="py-3 px-2">Période</th>
                <th class="py-3 px-2">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 text-sm">
              <tr v-for="req in recentLeaveRequests" :key="req.id" class="hover:bg-gray-50/50">
                <td class="py-3 px-2 font-medium text-gray-800">{{ req.type_label || req.type }}</td>
                <td class="py-3 px-2 text-gray-600">
                  Du {{ formatDate(req.start_date) }} au {{ formatDate(req.end_date) }}
                </td>
                <td class="py-3 px-2">
                  <span
                    :class="{
                      'bg-yellow-100 text-yellow-800': req.status === 'pending',
                      'bg-green-100 text-green-800': req.status === 'approved',
                      'bg-red-100 text-red-800': req.status === 'rejected'
                    }"
                    class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  >
                    {{ formatStatus(req.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Actions Rapides & Informations -->
      <div class="space-y-6">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">Accès rapides</h2>
          <div class="space-y-3">
            <router-link
              to="/employee/leave-requests"
              class="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition text-gray-700 font-medium text-sm"
            >
              <div class="flex items-center">
                <i class="fas fa-file-signature text-blue-600 mr-3 text-base"></i>
                Nouvelle demande de congé
              </div>
              <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
            </router-link>

            <router-link
              to="/employee/absences-history"
              class="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition text-gray-700 font-medium text-sm"
            >
              <div class="flex items-center">
                <i class="fas fa-history text-indigo-600 mr-3 text-base"></i>
                Historique des absences
              </div>
              <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
            </router-link>

            <router-link
              to="/employee/profile"
              class="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition text-gray-700 font-medium text-sm"
            >
              <div class="flex items-center">
                <i class="fas fa-user-cog text-emerald-600 mr-3 text-base"></i>
                Mon profil & Paramètres
              </div>
              <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
            </router-link>
          </div>
        </div>

        <!-- Informations Mon Poste -->
        <div class="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl p-6 shadow-sm">
          <h3 class="font-bold text-base mb-2">Informations contrat</h3>
          <div class="space-y-2 text-sm text-slate-300">
            <p><span class="text-slate-400">Poste :</span> {{ auth.user?.position || 'Non spécifié' }}</p>
            <p><span class="text-slate-400">Département :</span> {{ auth.user?.department || 'Non spécifié' }}</p>
            <p><span class="text-slate-400">Date d'arrivée :</span> {{ formatDate(auth.user?.hired_at) || 'N/A' }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/store/auth'
import Swal from 'sweetalert2'

const auth = useAuthStore()
const loading = ref(true)

const stats = ref({
  leaveBalance: 0,
  pendingLeaveRequests: 0,
  absencesThisMonth: 0,
  unjustifiedCount: 0
})

const recentLeaveRequests = ref([])

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

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await api.get('/employee/dashboard-summary')
    stats.value = {
      leaveBalance: data.leave_balance ?? 0,
      pendingLeaveRequests: data.pending_requests_count ?? 0,
      absencesThisMonth: data.absences_this_month ?? 0,
      unjustifiedCount: data.unjustified_absences_count ?? 0
    }
    recentLeaveRequests.value = data.recent_leave_requests || []
  } catch (e) {
    Swal.fire({
      title: 'Erreur',
      text: 'Impossible de charger les données du tableau de bord.',
      icon: 'error',
      confirmButtonText: 'D\'accord'
    })
  } flex {
    loading.value = false
  }
})
</script>