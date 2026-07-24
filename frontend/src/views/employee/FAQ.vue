<template>
  <div class="space-y-6">
    <!-- Barre de recherche -->
    <div class="bg-card rounded-xl shadow-custom p-4 border border-custom">
      <div class="flex items-center gap-3 text-muted">
        <i class="fas fa-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher une question..."
          class="w-full bg-transparent border-none outline-none text-primary placeholder-muted"
        />
      </div>
    </div>

    <!-- Statistiques rapides -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-stat-bg rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-stat-text">{{ faq.length }}</p>
        <p class="text-xs text-stat-text opacity-80">Articles</p>
      </div>
      <div class="bg-stat-bg rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-stat-text">{{ categories.length }}</p>
        <p class="text-xs text-stat-text opacity-80">Catégories</p>
      </div>
      <div class="bg-stat-bg rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-stat-text">98%</p>
        <p class="text-xs text-stat-text opacity-80">Satisfaction</p>
      </div>
      <div class="bg-stat-bg rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-stat-text">{{ lastUpdate }}</p>
        <p class="text-xs text-stat-text opacity-80">Dernière mise à jour</p>
      </div>
    </div>

    <!-- Les plus consultées -->
    <div class="bg-card rounded-xl shadow-custom p-6 border border-custom">
      <h2 class="text-xl font-bold text-primary mb-4"><i class="fas fa-fire text-orange-500 mr-2"></i>Les plus consultées</h2>
      <div class="space-y-3">
        <div v-for="question in popularQuestions" :key="question.id" class="flex items-start gap-3 p-2 rounded-lg hover:bg-card-hover cursor-pointer" @click="openAnswer(question)">
          <i class="fas fa-star text-warning mt-1"></i>
          <span class="text-secondary">{{ question.question }}</span>
        </div>
      </div>
    </div>

    <!-- Toutes les questions (accordéon) -->
    <div class="bg-card rounded-xl shadow-custom p-6 border border-custom">
      <h2 class="text-xl font-bold text-primary mb-4"><i class="fas fa-question-circle text-accent mr-2"></i>Toutes les questions</h2>
      <div class="space-y-2">
        <div v-for="question in filteredQuestions" :key="question.id" class="border border-custom rounded-lg">
          <button @click="toggleQuestion(question.id)" class="w-full flex justify-between items-center p-4 text-left text-primary hover:bg-card-hover">
            <span>{{ question.question }}</span>
            <i :class="openId === question.id ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-muted"></i>
          </button>
          <div v-if="openId === question.id" class="p-4 border-t border-custom text-secondary">
            {{ question.reponse }}
          </div>
        </div>
      </div>
    </div>

    <!-- Besoin d'aide ? -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-accent-light rounded-xl p-6 text-center border border-custom">
        <i class="fas fa-headset text-3xl text-accent mb-2"></i>
        <h3 class="font-semibold text-primary">Besoin d'aide ?</h3>
        <p class="text-sm text-muted mt-2">Notre équipe support est disponible pour vous assister.</p>
        <a href="mailto:support@sgrh.com" class="inline-block mt-3 bg-accent text-white px-4 py-2 rounded hover:bg-accent-hover">Contacter le support</a>
      </div>
      <div class="bg-accent-light rounded-xl p-6 text-center border border-custom">
        <i class="fas fa-envelope text-3xl text-accent mb-2"></i>
        <h3 class="font-semibold text-primary">Vous ne trouvez pas votre réponse ?</h3>
        <p class="text-sm text-muted mt-2">Soumettre une demande d'assistance.</p>
        <router-link to="/employee/assistance" class="inline-block mt-3 bg-accent text-white px-4 py-2 rounded hover:bg-accent-hover">Nouvelle demande</router-link>
      </div>
    </div>

    <!-- Modale pour réponse -->
    <div v-if="selectedQuestion" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="selectedQuestion = null">
      <div class="bg-card rounded-xl p-6 max-w-md w-full shadow-custom border border-custom">
        <h3 class="font-semibold text-lg text-primary">{{ selectedQuestion.question }}</h3>
        <p class="mt-4 text-secondary">{{ selectedQuestion.reponse }}</p>
        <button @click="selectedQuestion = null" class="mt-4 bg-accent text-white px-4 py-2 rounded">Fermer</button>
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