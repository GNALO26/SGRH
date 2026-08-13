<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>

  <!-- Gestionnaire de notifications push (monté uniquement sur mobile) -->
  <PushNotificationManager v-if="isNative" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import PushNotificationManager from '@/components/common/PushNotificationManager.vue'

const isNative = ref(false)

onMounted(() => {
  isNative.value = Capacitor.isNativePlatform()
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