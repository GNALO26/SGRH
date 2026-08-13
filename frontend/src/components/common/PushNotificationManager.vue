<template>
  <!-- Ce composant n'affiche rien, il gère uniquement les push en arrière-plan -->
  <div v-if="false"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import api from '@/api/axios'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'

const router = useRouter()
const authStore = useAuthStore()

let notificationListener = null

onMounted(async () => {
  // Ne rien faire sur le web
  if (!Capacitor.isNativePlatform()) return

  try {
    // Créer le canal de notification avec son personnalisé
    await PushNotifications.createChannel({
      id: 'sgrh_notifications',
      name: 'Notifications SGRH',
      description: 'Notifications de la plateforme SGRH',
      importance: 5,
      sound: 'notification', // fichier dans android/app/src/main/res/raw/notification.mp3
      vibration: true,
      visibility: 1,
      lights: true,
      lightColor: '#2563EB',
    })
  } catch (e) {
    console.warn('Canal de notification non créé (déjà existant ?)', e)
  }

  // Permission
  let permStatus = await PushNotifications.checkPermissions()
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions()
  }
  if (permStatus.receive !== 'granted') return

  await PushNotifications.register()

  // Réception du token FCM
  PushNotifications.addListener('registration', async (token) => {
    if (authStore.isAuthenticated) {
      try {
        await api.post('/fcm-token', { fcm_token: token.value })
      } catch (e) {
        console.error('Erreur envoi token FCM', e)
      }
    }
  })

  // Notification reçue en premier plan
  notificationListener = PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Notification reçue :', notification)
    // Si une notification contient un lien (données FCM), on peut naviguer
    const data = notification.data
    if (data && data.link) {
      router.push(data.link)
    }
  })

  // Notification tapée quand l'app est en arrière-plan / fermée
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Notification actionnée :', notification)
    const data = notification.notification?.data
    if (data && data.link) {
      router.push(data.link)
    }
  })
})

onUnmounted(() => {
  if (notificationListener) {
    notificationListener.remove()
  }
})
</script>