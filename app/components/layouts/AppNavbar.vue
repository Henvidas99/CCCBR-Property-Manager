<template>
  <header class="h-16 bg-white flex items-center px-4 sm:px-6 shadow-md justify-between">
    <!-- Hamburger -->
    <button
      @click="$emit('toggle-mobile-sidebar')"
      class="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition lg:hidden"
    >
      <svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>

    <!-- Título -->
    <h1 class="text-gray-800 text-xl font-semibold flex-1 text-center lg:text-left truncate max-w-[50%] sm:max-w-[60%] xs:hidden">
      CCCBR Manager
    </h1>

    <!-- Acciones -->
    <div class="flex items-center space-x-4">

      <!-- Chat button con badge de no leídos -->
      <button
        @click="showChat = true"
        class="relative flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        title="Mensajes"
      >
        <ChatBubbleLeftEllipsisIcon class="h-5 w-5 text-gray-700"/>
        <!-- Badge de no leídos -->
        <Transition name="badge-pop">
          <span
            v-if="totalUnread > 0"
            class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-white font-bold"
            style="font-size: 0.6rem; background: linear-gradient(135deg, #202d59, #a31e22);"
          >
            {{ totalUnread > 99 ? '99+' : totalUnread }}
          </span>
        </Transition>
      </button>

      <!-- Notificaciones -->
      <button class="relative flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition">
        <BellIcon class="h-5 w-5 text-gray-700"/>
        <span class="absolute top-1 right-1 inline-block w-2 h-2 bg-red-500 rounded-full"/>
      </button>

      <!-- Logout -->
      <button @click="logout" class="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition">
        <ArrowRightStartOnRectangleIcon class="h-5 w-5 text-gray-700"/>
      </button>

      <ChatModal v-model="showChat"/>
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  ChatBubbleLeftEllipsisIcon,
  BellIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import { ref } from 'vue'
import ChatModal from '~/components/chats/ChatModal.vue'
import { useChats } from '~/composables/useChats'
import { useUser } from '~/composables/useUser'

defineEmits(['toggle-mobile-sidebar'])

const showChat = ref(false)
const { totalUnread, fetchChats, connectSocket } = useChats()
const { user } = useUser()

// Conectar WS y cargar chats cuando el header se monta (usuario ya está autenticado)
onMounted(async () => {
  await fetchChats()
  const token = localStorage.getItem('auth_token')
  if (token) connectSocket(token)
})

const logout = () => navigateTo('/')
</script>

<style scoped>
.badge-pop-enter-active { animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.badge-pop-leave-active { animation: badgePop 0.15s ease reverse; }
@keyframes badgePop {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}
</style>