<template>
  <router-link
    :to="to"
    class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-800 hover:text-white"
    :class="[small ? 'text-xs py-1.5' : 'text-sm']"
    active-class="bg-gray-800 text-white"
  >
    <i :class="icon" class="w-5 text-center"></i>
    <span class="flex-1">{{ label }}</span>
    <span
      v-if="badge"
      class="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
    >
      {{ badge }}
    </span>
  </router-link>
</template>

<script setup>
defineProps({
  to: { type: String, required: true },
  icon: { type: String, default: 'fas fa-circle' },
  label: { type: String, required: true },
  badge: { type: String, default: '' },
  small: { type: Boolean, default: false }
})
</script>