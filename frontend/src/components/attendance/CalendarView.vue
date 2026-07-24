<template>
  <div class="grid grid-cols-7 gap-1 text-center">
    <div v-for="day in daysOfWeek" :key="day" class="text-xs font-medium text-muted py-1">{{ day }}</div>
    <div
      v-for="(day, idx) in calendarDays"
      :key="idx"
      class="relative h-8 flex items-center justify-center text-sm rounded-full"
      :class="day.class"
    >
      {{ day.day }}
      <span
        v-if="day.dot"
        class="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full"
        :class="day.dotColor"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  events: { type: Array, default: () => [] }
})

const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(props.year, props.month - 1, 1)
  const lastDay = new Date(props.year, props.month, 0)
  const totalDays = lastDay.getDate()
  let startDayOfWeek = firstDay.getDay()
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ day: '', class: '', dot: false })
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${props.year}-${String(props.month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const event = props.events.find(e => e.date === dateStr)
    let dotColor = ''
    let classNames = 'text-primary hover:bg-card-hover cursor-default'
    if (event) {
      switch (event.status) {
        case 'present':
          dotColor = 'bg-green-500'; classNames += ' font-semibold'; break
        case 'late':
          dotColor = 'bg-orange-500'; break
        case 'absent':
          dotColor = 'bg-red-500'; break
        case 'leave':
          dotColor = 'bg-blue-500'; break
        case 'holiday':
          dotColor = 'bg-purple-500'; break
      }
    }
    days.push({ day: d, class: classNames, dot: !!event, dotColor })
  }
  return days
})
</script>