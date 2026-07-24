<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Paie & Salaires</h1>
      <button @click="processPayroll" class="bg-blue-600 text-white px-4 py-2 rounded">Générer les bulletins</button>
    </div>
    <div class="bg-white rounded-xl shadow p-6 mb-4">
      <label class="block mb-2 font-medium">Période (mois)</label>
      <input type="month" v-model="period" class="border rounded p-2" />
      <button @click="fetchPayroll" class="ml-2 bg-gray-100 px-3 py-2 rounded">Charger</button>
    </div>
    <div class="bg-white rounded-xl shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr>
            <th class="p-3">Employé</th>
            <th class="p-3">Salaire de base</th>
            <th class="p-3">Jours travaillés</th>
            <th class="p-3">Jours payés</th>
            <th class="p-3">Déductions</th>
            <th class="p-3">Net à payer</th>
            <th class="p-3">Statut</th>
            <th class="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in payrollData" :key="item.id">
            <td class="p-3">{{ item.user?.name }}</td>
            <td class="p-3">{{ item.base_salary }}</td>
            <td class="p-3">{{ item.worked_days }}</td>
            <td class="p-3">
              <input v-if="editingId === item.id" type="number" v-model="item.paid_days" class="w-16 border p-1" />
              <span v-else>{{ item.paid_days }}</span>
            </td>
            <td class="p-3">{{ item.deductions }}</td>
            <td class="p-3 font-bold">{{ item.net_salary }}</td>
            <td class="p-3">
              <span :class="item.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'">
                {{ item.payment_status === 'paid' ? 'Payé' : 'En attente' }}
              </span>
            </td>
            <td class="p-3 space-x-2">
              <button v-if="item.payment_status !== 'paid'" @click="paySalary(item)" class="text-blue-600 hover:underline">Payer</button>
              <button @click="toggleEdit(item)" class="text-gray-600 hover:underline">{{ editingId === item.id ? 'Sauvegarder' : 'Ajuster' }}</button>
              <a :href="`/api/admin/payroll/${item.id}/download`" target="_blank" class="text-green-600 hover:underline" v-if="item.id">
                <i class="fas fa-download"></i> PDF
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const period = ref(new Date().toISOString().substr(0,7))
const payrollData = ref([])
const editingId = ref(null)

async function fetchPayroll() {
  try {
    const { data } = await api.get(`/admin/payroll?period=${period.value}`)
    payrollData.value = data
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  }
}

async function processPayroll() {
  try {
    await api.post('/admin/payroll/process', { period: period.value })
    Swal.fire('Succès', 'Bulletins générés', 'success')
    fetchPayroll()
  } catch (e) {
    Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
  }
}

async function paySalary(item) {
  const confirm = await Swal.fire({
    title: 'Confirmer le paiement ?',
    text: `Payer ${item.net_salary} FCFA à ${item.user?.name}`,
    showCancelButton: true,
    confirmButtonText: 'Payer',
    cancelButtonText: 'Annuler'
  })
  if (confirm.isConfirmed) {
    try {
      await api.post(`/admin/payroll/pay/${item.id}`)
      Swal.fire('Succès', 'Paiement initié', 'success')
      fetchPayroll()
    } catch (e) {
      Swal.fire('Erreur', e.response?.data?.message || 'Erreur', 'error')
    }
  }
}

function toggleEdit(item) {
  if (editingId.value === item.id) {
    api.patch(`/admin/payroll/${item.id}`, { paid_days: item.paid_days })
      .then(() => Swal.fire('Ajustement enregistré'))
      .catch(err => Swal.fire('Erreur', err.response?.data?.message, 'error'))
    editingId.value = null
  } else {
    editingId.value = item.id
  }
}

onMounted(fetchPayroll)
</script>