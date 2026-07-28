<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" @click.self="close">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
        <div class="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 class="text-lg font-semibold dark:text-white">{{ title }}</h3>
          <button @click="close" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
        </div>
        <div class="flex-1 p-2">
          <!-- Pour les PDF : iframe -->
          <iframe v-if="isPDF" :src="url" class="w-full h-full rounded" frameborder="0"></iframe>
          <!-- Pour les images -->
          <img v-else-if="isImage" :src="url" class="w-full h-full object-contain" alt="Document" />
          <!-- Autres types : message + lien -->
          <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
            <i class="fas fa-file text-6xl mb-4"></i>
            <p>Aperçu non disponible pour ce type de fichier.</p>
            <a :href="url" target="_blank" class="mt-2 text-blue-600 hover:underline">Ouvrir dans un nouvel onglet</a>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  url: { type: String, default: '' },
  title: { type: String, default: 'Document' },
})

const emit = defineEmits(['close'])

const isPDF = computed(() => props.url.toLowerCase().endsWith('.pdf'))
const isImage = computed(() => /\.(jpe?g|png|gif|webp)$/i.test(props.url))

function close() {
  emit('close')
}
</script>