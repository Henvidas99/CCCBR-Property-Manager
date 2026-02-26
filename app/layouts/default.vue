<template>
  <div class="flex h-screen bg-mainbg">
    <!-- Sidebar desktop -->
    <AppSidebar
      :collapsed="collapsedSidebar"
      class="hidden lg:flex"
    />

    <!-- Sidebar móvil flotante -->
    <transition name="fade">
      <div
        v-if="mobileSidebarOpen"
        class="fixed inset-0 z-50 flex"
      >
        <div
          class="fixed inset-0 bg-black bg-opacity-30"
          @click="mobileSidebarOpen = false"
        ></div>

        <!-- Sidebar flotante -->
        <AppSidebar
          :collapsed="false"
          class="relative z-50 w-64 h-full"
          @close-mobile-sidebar="mobileSidebarOpen = false"
        />
      </div>
    </transition>

    <div class="flex-1 flex flex-col">
      <!-- Navbar -->
      <AppNavbar @toggle-mobile-sidebar="mobileSidebarOpen = !mobileSidebarOpen" />

      <!-- Contenido principal -->
      <main class="p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from '~/components/layouts/AppSidebar.vue'
import AppNavbar from '~/components/layouts/AppNavbar.vue'

const collapsedSidebar = ref(false)   
const mobileSidebarOpen = ref(false)  
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>