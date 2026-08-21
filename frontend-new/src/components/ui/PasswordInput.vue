<template>
  <div class="relative">
    <input
      :type="visible ? 'text' : 'password'"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :required="required"
      :placeholder="placeholder"
      :class="['w-full border p-2 rounded pr-10 dark:bg-gray-700 dark:text-white', error ? 'border-red-500 ring-1 ring-red-500' : '']"
    />
    <button type="button" @click="visible = !visible" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabindex="-1">
      <i :class="visible ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
    </button>
  </div>
  <p v-if="error" class="text-red-600 text-xs mt-1">{{ error }}</p>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ modelValue: String, required: Boolean, placeholder: String, error: String })
defineEmits(['update:modelValue'])
const visible = ref(false)
</script>