<template>
  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-4 shadow-inner text-center">
    <p class="text-sm italic text-gray-700 dark:text-gray-200">"{{ currentQuote }}"</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const quotes = [
  "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme. - Winston Churchill",
  "La seule façon de faire du bon travail est d'aimer ce que vous faites. - Steve Jobs",
  "Ne remets pas à demain ce que tu peux faire aujourd'hui. - Benjamin Franklin",
  "Le travail éloigne de nous trois grands maux : l'ennui, le vice et le besoin. - Voltaire",
  "La persévérance est la noblesse de l'effort. - Victor Hugo"
]

const currentQuote = ref(quotes[0])

onMounted(() => {
  currentQuote.value = quotes[Math.floor(Math.random() * quotes.length)]
})
</script>