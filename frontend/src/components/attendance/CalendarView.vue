<template>
  <div>
    <div class="grid grid-cols-7 gap-1 text-center">
      <div v-for="day in daysOfWeek" :key="day" class="text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
        {{ day }}
      </div>
      <div
        v-for="(day, idx) in calendarDays"
        :key="idx"
        class="relative h-9 flex items-center justify-center text-sm rounded-full"
        :class="day.class"
      >
        {{ day.day }}
        <span
          v-if="day.dot"
          class="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full"
          :class="day.dotColor"
        ></span>
      </div>
    </div>

    <!-- Légende -->
    <div class="mt-4 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
      <span class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-full bg-green-500"></span> Présent
      </span>
      <span class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-full bg-orange-500"></span> Retard
      </span>
      <span class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-full bg-blue-500"></span> Congé/Absence
      </span>
      <span class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-full bg-yellow-500"></span> Jour férié
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  events: { type: Array, default: () => [] } // { date: 'YYYY-MM-DD', status: 'present'|'late'|'leave'|'holiday' }
})

const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(props.year, props.month - 1, 1)
  const lastDay = new Date(props.year, props.month, 0)
  const totalDays = lastDay.getDate()
  let startDayOfWeek = firstDay.getDay() // 0 = dimanche
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1 // lundi = 0

  // Cases vides avant le 1er jour du mois
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ day: '', class: '', dot: false })
  }

  // Jours du mois
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${props.year}-${String(props.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const event = props.events.find(e => e.date === dateStr)
    let dotColor = ''
    let classNames = 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-default'

    if (event) {
      switch (event.status) {
        case 'present':
          dotColor = 'bg-green-500'
          break
        case 'late':
          dotColor = 'bg-orange-500'
          break
        case 'leave':
          dotColor = 'bg-blue-500'
          break
        case 'holiday':
          dotColor = 'bg-yellow-500'
          break
      }
    }
    days.push({ day: d, class: classNames, dot: !!event, dotColor })
  }
  return days
})
</script>