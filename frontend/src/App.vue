<script setup>
import { onMounted } from 'vue'
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'
import { useAuthStore } from '@/store/auth'
import api from '@/api/axios'

const authStore = useAuthStore()

onMounted(async () => {
  if (!Capacitor.isNativePlatform()) return

  // Créer le canal de notification avec son personnalisé
  try {
    await PushNotifications.createChannel({
      id: 'sgrh_notifications',
      name: 'Notifications SGRH',
      description: 'Notifications de la plateforme SGRH',
      importance: 5, // IMPORTANCE_HIGH
      sound: 'notification', // nom du fichier sans extension .mp3
      vibration: true,
      visibility: 1, // VISIBILITY_PUBLIC
      lights: true,
      lightColor: '#2563EB',
    })
  } catch (e) {
    console.error('Erreur création canal', e)
  }

  // Demander la permission
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