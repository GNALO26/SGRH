<template>
  <div class="bg-card rounded-xl shadow-custom p-4 flex items-center gap-3">
    <div class="h-10 w-10 rounded-full flex items-center justify-center" :class="colorClasses">
      <i :class="icon" class="text-lg"></i>
    </div>
    <div>
      <p class="text-xs text-muted">{{ label }}</p>
      <p class="text-xl font-bold text-primary">{{ value }}</p>
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
  // Utilisation des couleurs sémantiques et des variantes sombres
  const map = {
    blue:   'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    green:  'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
    red:    'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
  }
  return map[props.color] || map.blue
})
</script>