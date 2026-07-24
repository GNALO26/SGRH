<template>
  <div class="flex h-screen bg-page">
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" @click="sidebarOpen = false"></div>
    <AdminSidebar :class="[sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'lg:translate-x-0']" class="fixed lg:static inset-y-0 left-0 z-50 w-60 transition-transform duration-300 ease-in-out" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="flex-1 overflow-y-auto p-4 md:p-6 bg-page">
        <router-view />
      </main>
      <AppFooter />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AdminSidebar from '@/components/common/AdminSidebar.vue'
import AppFooter from '@/components/common/AppFooter.vue'

const sidebarOpen = ref(false)
</script>