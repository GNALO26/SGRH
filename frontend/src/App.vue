<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { useAuthStore } from '@/store/auth'
import api from '@/api/axios'

const authStore = useAuthStore()

onMounted(async () => {
  // Ne rien faire sur le web (les push notifications sont uniquement pour l'app native)
  if (!Capacitor.isNativePlatform()) return

  let permStatus = await PushNotifications.checkPermissions()
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions()
  }
  if (permStatus.receive !== 'granted') return

  await PushNotifications.register()

  PushNotifications.addListener('registration', async (token) => {
    if (authStore.isAuthenticated) {
      try {
        await api.post('/fcm-token', { fcm_token: token.value })
      } catch (e) {
        console.error('Erreur envoi token FCM', e)
      }
    }
  })

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Notification reçue :', notification)
  })
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>