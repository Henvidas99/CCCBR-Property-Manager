<template>
  <aside
    :class="[
      'h-full bg-layout text-gray-800 flex flex-col justify-between shadow-lg transition-width duration-300',
      collapsed ? 'w-20' : 'w-64'
    ]"
  >
  

    <div>
      <NuxtLink to="/" class="flex justify-center items-center p-4">
        <img v-if="!collapsed" src="/cccbrlogo.png" alt="CCCBR Logo" class="w-28" />
        <img v-else src="/cccbrlogo.png" alt="CCCBR Logo Small" class="w-10" />
      </NuxtLink>

      <nav class="flex flex-col space-y-3 px-3.5 mt-4">
        <NuxtLink
          v-for="item in menu"
          :key="item.name"
          :to="item.link"
          @mouseover="hoverItem = item.link"
          @mouseleave="hoverItem = ''"
          class="relative flex items-center transition-all duration-300"
          :class="collapsed
            ? 'rounded-full justify-center px-2.5 py-2.5'
            : 'px-3 py-1.5 rounded-2xl'"
          :style="getItemStyle(item.link)"
        >
          <div
            :class="[
              'flex items-center justify-center rounded-full transition-transform duration-300',
              collapsed ? 'h-7 w-7' : 'h-9 w-9'
            ]"
            :style="getIconStyle(item.link)"
          >
            <component :is="item.icon" :class="collapsed ? 'h-4 w-4' : 'h-5 w-5'" />
          </div>

          <span v-if="!collapsed" class="ml-4 font-medium text-sm">{{ item.name }}</span>


          <transition name="fade">
            <div
              v-if="collapsed && hoverItem === item.link"
              class="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-50"
            >
              {{ item.name }}
              <div class="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
            </div>
          </transition>

        </NuxtLink>
      </nav>
    </div>

    <!-- Bottom section -->
    <div class="px-4 py-6 w-full flex flex-col items-center space-y-3">
      <div v-if="!collapsed" class="w-full flex items-center space-x-3 bg-contrast rounded-2xl p-3 shadow-md hover:shadow-lg transition-shadow duration-300">
        <img src="/avatar.png" alt="User" class="h-10 w-10 rounded-full border-2 border-gray-300" />
        <div>
          <p class="font-semibold text-gray-800">Henry Vargas</p>
          <p class="text-sm text-gray-500">Administrador</p>
        </div>
      </div>

      <div v-else class="flex items-center justify-center w-full">
        <img src="/avatar.png" alt="User" class="h-10 w-10 rounded-full border-2 border-gray-300" />
      </div>

      <button
        @click="collapsed = !collapsed"
        class="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition items-center justify-center hidden lg:flex"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps({
  collapsed: { type: Boolean, default: false },
})
defineEmits(['close-mobile-sidebar'])


import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { HomeIcon, MapIcon, ShoppingCartIcon, UserIcon } from '@heroicons/vue/24/outline'

const collapsed = ref(false)
const hoverItem = ref('')
const route = useRoute()

const menu = [
  { name: 'Explorador', link: '/', icon: HomeIcon },
  { name: 'Portafolio', link: '/portfolio', icon: MapIcon },
  { name: 'Marketplace', link: '/marketplace', icon: ShoppingCartIcon },
  { name: 'Perfil', link: '/profile', icon: UserIcon },
]

const isActive = (link: string) => route.path === link || (!route.path && link === '/')

const getItemStyle = (link: string) => {
  const active = isActive(link)
  const hover = hoverItem.value === link

  if (active && hover) return { background: 'linear-gradient(to right, #a31e22, #202d59)', color: '#fff' }
  if (active) return { background: 'linear-gradient(to right, #202d59, #a31e22)', color: '#fff' }
  if (hover) return { background: 'linear-gradient(to right, #a31e22, #202d59)', color: '#fff' }

  return { background: '#f0f0f0', color: '#000' }
}

const getIconStyle = (link: string) => {
  const active = isActive(link)
  const hover = hoverItem.value === link

  if (active && hover) return { background: 'white', color: '#a31e22', transform: 'scale(1.15)' }
  if (active) return { background: 'white', color: '#202d59', transform: 'scale(1.1)' }
  if (hover) return { background: 'white', color: '#a31e22', transform: 'scale(1.05)' }

  return { background: '#e0e0e0', color: '#202d59', transform: 'scale(1)' }
}
</script>


<style scoped>
aside {
  transition-property: width;
}

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