<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-3">
    <div class="h-10 w-10 rounded-full flex items-center justify-center" :class="colorClasses">
      <i :class="icon" class="text-lg"></i>
    </div>
    <div>
      <p class="text-xs text-gray-500 dark:text-gray-400">{{ label }}</p>
      <p class="text-xl font-bold dark:text-white">{{ value }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: String,
  label: String,
  value: [String, Number],
  color: { type: String, default: 'blue' }
})

const colorClasses = computed(() => {
  const map = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  }
  return map[props.color] || map.blue
})
</script>