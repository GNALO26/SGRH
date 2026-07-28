<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" @click.self="close">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
        <!-- En-tête -->
        <div class="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 class="text-lg font-semibold dark:text-white truncate">{{ title }}</h3>
          <button @click="close" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
        </div>
        <!-- Contenu -->
        <div class="flex-1 p-2 overflow-hidden">
          <!-- PDF : tenté dans un iframe, avec fallback -->
          <template v-if="isPDF">
            <iframe v-if="!iframeError" :src="url" class="w-full h-full rounded" frameborder="0" @error="iframeError = true"></iframe>
            <div v-else class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <i class="fas fa-file-pdf text-6xl mb-4"></i>
              <p>Le PDF ne peut pas être affiché ici.</p>
              <a :href="url" target="_blank" class="mt-2 text-blue-600 hover:underline">
                <i class="fas fa-external-link-alt mr-1"></i> Ouvrir dans un nouvel onglet
              </a>
            </div>
          </template>
          <!-- Images -->
          <img v-else-if="isImage" :src="url" class="w-full h-full object-contain" alt="Document" @error="imageError = true" />
          <div v-if="imageError" class="text-center text-red-500 mt-2">L'image n'a pas pu être chargée.</div>
          <!-- Autres types -->
          <div v-else class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <i class="fas fa-file text-6xl mb-4"></i>
            <p>Aperçu non disponible pour ce type de fichier.</p>
            <a :href="url" target="_blank" class="mt-2 text-blue-600 hover:underline">
              <i class="fas fa-external-link-alt mr-1"></i> Ouvrir dans un nouvel onglet
            </a>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  url: String,
  title: String,
})
const emit = defineEmits(['close'])

const isPDF = computed(() => props.url?.toLowerCase().endsWith('.pdf'))
const isImage = computed(() => /\.(jpe?g|png|gif|webp|svg)$/i.test(props.url))

const iframeError = ref(false)
const imageError = ref(false)

function close() {
  iframeError.value = false
  imageError.value = false
  emit('close')
}
</script>