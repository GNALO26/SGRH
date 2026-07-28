<template>
  <div class="space-y-6">
    <!-- Barre de recherche -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-3 text-gray-500 dark:text-gray-400">
        <i class="fas fa-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher une question..."
          class="w-full bg-transparent border-none outline-none text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>
    </div>

    <!-- Statistiques rapides -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-blue-50 dark:bg-blue-900 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-blue-700 dark:text-blue-300">{{ faq.length }}</p>
        <p class="text-xs text-blue-600 dark:text-blue-400">Articles</p>
      </div>
      <div class="bg-purple-50 dark:bg-purple-900 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-purple-700 dark:text-purple-300">{{ categories.length }}</p>
        <p class="text-xs text-purple-600 dark:text-purple-400">Catégories</p>
      </div>
      <div class="bg-green-50 dark:bg-green-900 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-green-700 dark:text-green-300">98%</p>
        <p class="text-xs text-green-600 dark:text-green-400">Satisfaction</p>
      </div>
      <div class="bg-orange-50 dark:bg-orange-900 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-orange-700 dark:text-orange-300">{{ lastUpdate }}</p>
        <p class="text-xs text-orange-600 dark:text-orange-400">Dernière mise à jour</p>
      </div>
    </div>

    <!-- Les plus consultées -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4"><i class="fas fa-fire text-orange-500 mr-2"></i>Les plus consultées</h2>
      <div class="space-y-3">
        <div
          v-for="question in popularQuestions"
          :key="question.id"
          class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          @click="openAnswer(question)"
        >
          <i class="fas fa-star text-yellow-500 mt-1"></i>
          <span class="text-gray-700 dark:text-gray-300">{{ question.question }}</span>
        </div>
      </div>
    </div>

    <!-- Toutes les questions (accordéon) -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4"><i class="fas fa-question-circle text-blue-600 mr-2"></i>Toutes les questions</h2>
      <div class="space-y-2">
        <div v-for="question in filteredQuestions" :key="question.id" class="border border-gray-200 dark:border-gray-700 rounded-lg">
          <button
            @click="toggleQuestion(question.id)"
            class="w-full flex justify-between items-center p-4 text-left text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span>{{ question.question }}</span>
            <i
              :class="openId === question.id ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
              class="text-gray-500 dark:text-gray-400"
            ></i>
          </button>
          <div v-if="openId === question.id" class="p-4 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
            {{ question.reponse }}
          </div>
        </div>
      </div>
    </div>

    <!-- Besoin d'aide ? -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-blue-50 dark:bg-blue-900 rounded-xl p-6 text-center border border-blue-200 dark:border-blue-800">
        <i class="fas fa-headset text-3xl text-blue-600 dark:text-blue-400 mb-2"></i>
        <h3 class="font-semibold text-gray-800 dark:text-white">Besoin d'aide ?</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Notre équipe support est disponible pour vous assister.</p>
        <a href="mailto:support@sgrh.com" class="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">Contacter le support</a>
      </div>
      <div class="bg-blue-50 dark:bg-blue-900 rounded-xl p-6 text-center border border-blue-200 dark:border-blue-800">
        <i class="fas fa-envelope text-3xl text-blue-600 dark:text-blue-400 mb-2"></i>
        <h3 class="font-semibold text-gray-800 dark:text-white">Vous ne trouvez pas votre réponse ?</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Soumettre une demande d'assistance.</p>
        <router-link to="/employee/assistance" class="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">Nouvelle demande</router-link>
      </div>
    </div>

    <!-- Modale pour réponse -->
    <div v-if="selectedQuestion" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="selectedQuestion = null">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow border border-gray-200 dark:border-gray-700">
        <h3 class="font-semibold text-lg text-gray-800 dark:text-white">{{ selectedQuestion.question }}</h3>
        <p class="mt-4 text-gray-600 dark:text-gray-400">{{ selectedQuestion.reponse }}</p>
        <button @click="selectedQuestion = null" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const openId = ref(null)
const selectedQuestion = ref(null)

const categories = ['Général', 'Pointage', 'Congés', 'Documents', 'Technique']

const faq = ref([
  { id: 1, question: 'Comment effectuer un pointage ?', reponse: 'Rendez-vous sur la page Pointage et cliquez sur "Marquer ma présence". Assurez-vous que votre géolocalisation est activée.', popular: true },
  { id: 2, question: 'Que faire si j\'ai oublié de pointer ?', reponse: 'Contactez votre administrateur RH qui pourra régulariser votre pointage manuellement.', popular: true },
  { id: 3, question: 'Comment demander un congé ?', reponse: 'Allez dans "Mes demandes" > "Congés & Absences", remplissez le formulaire et envoyez.', popular: true },
  { id: 4, question: 'Puis-je changer mon mot de passe ?', reponse: 'Non, pour des raisons de sécurité, seul l\'administrateur peut changer votre mot de passe.', popular: false },
  { id: 5, question: 'Comment consulter mes bulletins de paie ?', reponse: 'Cette fonctionnalité a été remplacée par la gestion documentaire. Vos bulletins sont dans "Mes documents".', popular: false },
  { id: 6, question: 'Que faire en cas d\'erreur de pointage ?', reponse: 'Utilisez la page "Assistance" pour soumettre une demande de correction.', popular: true },
])

const lastUpdate = '15/07/2026'

const popularQuestions = computed(() => faq.value.filter(q => q.popular))
const filteredQuestions = computed(() => {
  if (!searchQuery.value) return faq.value
  return faq.value.filter(q => q.question.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

function toggleQuestion(id) {
  openId.value = openId.value === id ? null : id
}

function openAnswer(question) {
  selectedQuestion.value = question
}
</script>