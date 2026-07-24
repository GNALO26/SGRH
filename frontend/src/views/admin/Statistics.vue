<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-bold text-primary">Statistiques & Rapports</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-card rounded-xl shadow-custom p-6">
        <h2 class="text-lg font-semibold mb-4 text-primary">Retards cumulés par mois</h2>
        <canvas ref="monthlyLateChart" height="200"></canvas>
      </div>
      <div class="bg-card rounded-xl shadow-custom p-6">
        <h2 class="text-lg font-semibold mb-4 text-primary">Top 5 des employés en retard (mois courant)</h2>
        <div v-if="topLateEmployees.length" class="space-y-2">
          <div v-for="(emp, idx) in topLateEmployees" :key="emp.id" class="flex justify-between items-center">
            <span class="text-primary">{{ idx + 1 }}. {{ emp.name }}</span>
            <span class="font-semibold text-warning">{{ emp.total_late_minutes }} min</span>
          </div>
        </div>
        <p v-else class="text-muted">Aucune donnée.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import Chart from 'chart.js/auto'

const monthlyLateChart = ref(null)
const topLateEmployees = ref([])
let chartInstance = null

onMounted(async () => {
  try {
    const { data: lateData } = await api.get('/admin/statistics/monthly-late')
    if (monthlyLateChart.value) {
      const ctx = monthlyLateChart.value.getContext('2d')
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: lateData.labels,
          datasets: [{ label: 'Minutes de retard', data: lateData.values, backgroundColor: '#F59E0B' }]
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a' } } },
          scales: {
            x: { ticks: { color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#1e293b' } },
            y: { ticks: { color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#1e293b' } }
          }
        }
      })
    }
    const { data: topData } = await api.get('/admin/statistics/top-late')
    topLateEmployees.value = topData
  } catch (e) { console.error(e) }
})
</script>