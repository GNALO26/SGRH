<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-primary">Tableau de bord</h1>
      <p class="text-muted">{{ formattedDate }}</p>
    </div>

    <!-- Statistiques du jour -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard icon="fas fa-users" label="Total employés" :value="stats.total_employees" color="blue" />
      <StatsCard icon="fas fa-user-check" label="Présents" :value="stats.present_today + ' (' + presencePercent + '%)'" color="green" />
      <StatsCard icon="fas fa-clock" label="En retard" :value="stats.late_today" color="orange" />
      <StatsCard icon="fas fa-calendar-times" label="Permissions/Absences" :value="stats.approved_leaves_today" color="red" />
    </div>

    <!-- Graphique absentéisme – style épuré -->
    <div class="bg-card rounded-xl shadow-custom p-6">
      <h2 class="text-lg font-semibold mb-4 text-primary">Taux d'absentéisme (30 derniers jours)</h2>
      <div style="height: 280px;">
        <canvas ref="absenceChart"></canvas>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Activités récentes -->
      <div class="bg-card rounded-xl shadow-custom p-6">
        <h2 class="text-lg font-semibold mb-4 text-primary">Activités récentes</h2>
        <div class="space-y-3 max-h-80 overflow-y-auto">
          <div v-for="activity in activities" :key="activity.id" class="flex items-start gap-3 pb-3 border-b border-custom last:border-0">
            <div class="h-8 w-8 rounded-full bg-accent-light flex items-center justify-center text-accent">
              <i :class="activity.icon"></i>
            </div>
            <div class="flex-1">
              <p class="text-sm text-primary"><strong>{{ activity.user }}</strong> {{ activity.action }}</p>
              <p class="text-xs text-muted">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <!-- Retards cumulés -->
        <div class="bg-card rounded-xl shadow-custom p-6">
          <h2 class="text-lg font-semibold mb-2 text-primary">Retards cumulés ce mois</h2>
          <p class="text-3xl font-bold text-warning">{{ stats.monthly_late_minutes }} <span class="text-lg font-normal text-muted">min</span></p>
          <p class="text-sm text-muted mt-1">Par rapport au mois dernier <span class="text-danger">+12%</span></p>
        </div>
        <!-- Prochaines absences -->
        <div class="bg-card rounded-xl shadow-custom p-6">
          <h2 class="text-lg font-semibold mb-4 text-primary">Prochaines absences</h2>
          <div v-if="upcomingLeaves.length">
            <div v-for="leave in upcomingLeaves" :key="leave.id" class="flex justify-between py-2 border-b border-custom last:border-0">
              <div>
                <p class="font-medium text-primary">{{ leave.employee }}</p>
                <p class="text-sm text-muted">{{ leave.type }} : du {{ leave.start_date }} au {{ leave.end_date }}</p>
              </div>
            </div>
          </div>
          <p v-else class="text-muted">Aucune absence à venir.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import api from '@/api/axios'
import StatsCard from '@/components/common/StatsCard.vue'
import Chart from 'chart.js/auto'

const formattedDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const stats = ref({ total_employees: 0, present_today: 0, late_today: 0, approved_leaves_today: 0, monthly_late_minutes: 0 })
const activities = ref([])
const upcomingLeaves = ref([])
const absenceChart = ref(null)
let chartInstance = null

const presencePercent = computed(() => {
  if (stats.value.total_employees === 0) return 0
  return ((stats.value.present_today / stats.value.total_employees) * 100).toFixed(1)
})

async function fetchDashboard() {
  try {
    const { data } = await api.get('/admin/dashboard')
    stats.value = data.stats
    activities.value = data.activities
    upcomingLeaves.value = data.upcoming_leaves
    await nextTick()
    renderChart(data.absence_rate_history)
  } catch (e) {
    console.error(e)
  }
}

function renderChart(history) {
  if (!absenceChart.value) return
  const ctx = absenceChart.value.getContext('2d')
  if (!ctx) return
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }

  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? '#cbd5e1' : '#1e293b'
  const gridColor = isDark ? 'rgba(148,163,184,0.15)' : 'rgba(0,0,0,0.06)'

  // Dégradé sous la courbe
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, isDark ? 'rgba(59,130,246,0.4)' : 'rgba(37,99,235,0.25)')
  gradient.addColorStop(1, 'rgba(59,130,246,0)')

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: history.map(h => h.date),
      datasets: [{
        label: '', // pas de label pour épurer
        data: history.map(h => h.rate),
        borderColor: isDark ? '#60a5fa' : '#2563eb',
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,               // courbe lissée
        pointRadius: 3,
        pointBackgroundColor: isDark ? '#60a5fa' : '#2563eb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },   // légende masquée
        tooltip: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: isDark ? '#334155' : '#e2e8f0',
          borderWidth: 1,
          callbacks: {
            label: (ctx) => `${ctx.parsed.y} %`
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor, drawBorder: false },
          ticks: { color: textColor, maxTicksLimit: 7, font: { size: 10 } }
        },
        y: {
          grid: { color: gridColor, drawBorder: false },
          ticks: {
            color: textColor,
            callback: (value) => value + '%',
            font: { size: 10 }
          },
          beginAtZero: true
        }
      }
    }
  })
}

onMounted(fetchDashboard)
</script>