<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue'
import { PushNotifications } from '@capacitor/push-notifications'
import { useAuthStore } from '@/store/auth'
import api from '@/api/axios'

const authStore = useAuthStore()

onMounted(async () => {
  // Demander la permission et s'enregistrer pour les notifications push
  let permStatus = await PushNotifications.checkPermissions()
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions()
  }
  if (permStatus.receive !== 'granted') {
    console.warn('Permission de notification refusée')
    return
  }

  await PushNotifications.register()

  // Réception du token FCM
  PushNotifications.addListener('registration', async (token) => {
    console.log('FCM Token:', token.value)
    if (authStore.isAuthenticated) {
      try {
        await api.post('/fcm-token', { fcm_token: token.value })
      } catch (e) {
        console.error('Erreur envoi token FCM', e)
      }
    }
  })

  // Réception d'une notification en premier plan
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Notification reçue :', notification)
  })
})
</script>

<style>
/* Transition de base */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Transition slide (optionnelle, à utiliser avec meta.transition: 'slide') */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.slide-enter-from {
  transform: translateX(20px);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>