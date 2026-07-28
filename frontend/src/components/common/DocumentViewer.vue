<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" @click.self="close">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
        <!-- En-tête -->
        <div class="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
          <h3 class="text-lg font-semibold dark:text-white truncate">{{ title }}</h3>
          <button @click="close" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
        </div>
        <!-- Contenu -->
        <div class="flex-1 min-h-0 p-2 overflow-hidden">
          <embed v-if="isPDF" :src="url" type="application/pdf" class="w-full h-full rounded" />
          <img v-else-if="isImage" :src="url" class="w-full h-full object-contain" alt="Document" />
          <div v-else class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <i class="fas fa-file text-6xl mb-4"></i>
            <p>Ce type de fichier ne peut pas être prévisualisé.</p>
            <a :href="url" target="_blank" class="mt-2 text-blue-600 hover:underline">
              <i class="fas fa-external-link-alt mr-1"></i> Ouvrir dans un nouvel onglet
            </a>
          </div>
        </div>
        <!-- Pied -->
        <div class="p-3 border-t dark:border-gray-700 text-center flex-shrink-0">
          <a :href="url" target="_blank" class="text-sm text-blue-600 hover:underline">
            <i class="fas fa-external-link-alt mr-1"></i> Ouvrir dans un nouvel onglet
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  url: String,
  title: String,
})
const emit = defineEmits(['close'])

const isPDF = computed(() => props.url?.toLowerCase().includes('.pdf'))
const isImage = computed(() => /\.(jpe?g|png|gif|webp|svg)$/i.test(props.url || ''))

function close() {
  emit('close')
}
</script>