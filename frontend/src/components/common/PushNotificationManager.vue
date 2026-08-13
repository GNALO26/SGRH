<template>
  <div v-if="false"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import api from '@/api/axios'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  if (!Capacitor.isNativePlatform()) return

  try {
    await PushNotifications.createChannel({
      id: 'sgrh_notifications',
      name: 'Notifications SGRH',
      description: 'Notifications de la plateforme SGRH',
      importance: 5,
      sound: 'notification', // fichier res/raw/notification.mp3
      vibration: true,
      visibility: 1,
      lights: true,
      lightColor: '#2563EB',
    })
  } catch (e) {
    console.warn('Canal déjà existant ou erreur', e)
  }

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
        console.error(e)
      }
    }
  })

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    const data = notification.data
    if (data && data.link) router.push(data.link)
  })

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    const data = notification.notification?.data
    if (data && data.link) router.push(data.link)
  })
})
</script>