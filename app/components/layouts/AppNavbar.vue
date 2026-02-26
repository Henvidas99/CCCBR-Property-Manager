<template>
  <header class="h-16 bg-white flex items-center px-4 sm:px-6 shadow-md justify-between">
    <!-- Botón hamburguesa móvil -->
    <button
      @click="$emit('toggle-mobile-sidebar')"
      class="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition lg:hidden"
    >
      <svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>

    <!-- Título -->
    <h1
      class="text-gray-800 text-xl font-semibold flex-1 text-center lg:text-left truncate max-w-[50%] sm:max-w-[60%] xs:hidden"
      title="CCCBR Property Manager"
    >
      CCCBR Property Manager
    </h1>

    <!-- Botones de acción -->
    <div class="flex items-center space-x-4">
      <button class="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition">
        <ChatBubbleLeftEllipsisIcon class="h-5 w-5 text-gray-700" />
      </button>

      <button class="relative flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition">
        <BellIcon class="h-5 w-5 text-gray-700" />
        <span class="absolute top-1 right-1 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <button @click="logout" class="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition">
        <ArrowRightStartOnRectangleIcon class="h-5 w-5 text-gray-700" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  ChatBubbleLeftEllipsisIcon,
  BellIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/vue/24/outline'

const logout = () => {
  console.log('Cerrar sesión')
}
</script>