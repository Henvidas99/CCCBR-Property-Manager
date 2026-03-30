<template>
  <aside class="h-full w-64 bg-layout text-gray-800 flex flex-col justify-between shadow-lg">

    <div class="flex flex-col h-full">

      <!-- LOGO -->
      <NuxtLink to="/" class="flex justify-center items-center p-4">
        <img src="/cccbrlogo.png" class="w-28" />
      </NuxtLink>

      <!-- DIVIDER -->
      <div class="px-4 pb-3">
        <div class="h-px bg-contrast w-full"></div>
      </div>

      <!-- MENU -->
      <nav class="flex flex-col px-3.5 overflow-y-auto">

        <div
          v-for="section in menu"
          :key="section.title"
          class="flex flex-col space-y-2 mb-4"
        >

          <!-- HEADER -->
          <div
            class="flex items-center justify-between px-3 py-2 text-[13px] font-bold uppercase cursor-pointer transition-colors duration-200"
            :class="getSectionStyle(section.title)"
            @mouseenter="hoverSection = section.title"
            @mouseleave="hoverSection = ''"
            @click="toggleSection(section.title)"
          >
            {{ section.title }}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 transition-transform duration-300 ease-out"
              :class="openSection === section.title ? 'rotate-90' : ''"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <!-- ITEMS -->
          <transition name="accordion">
            <div
              v-show="openSection === section.title"
              class="flex flex-col space-y-2"
            >
              <template v-for="item in section.items" :key="item.key">
                <!-- External link -->
                <a
                  v-if="item.external"
                  :href="item.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  @mouseover="hoverItem = item.key"
                  @mouseleave="hoverItem = ''"
                  :class="[
                    'relative flex items-center px-3 py-1.5 rounded-2xl transition-all duration-300',
                    getItemStyle(item.key)
                  ]"
                >
                  <div :class="['flex items-center justify-center rounded-full h-9 w-9 transition-transform duration-300', getIconStyle(item.key)]">
                    <component :is="item.icon" class="h-5 w-5" />
                  </div>
                  <span class="ml-4 font-medium text-sm">{{ item.name }}</span>
                </a>

                <!-- Internal link -->
                <NuxtLink
                  v-else
                  :to="item.link"
                  @mouseover="hoverItem = item.key"
                  @mouseleave="hoverItem = ''"
                  @click="activeKey = item.key"
                  :class="[
                    'relative flex items-center px-3 py-1.5 rounded-2xl transition-all duration-300',
                    getItemStyle(item.key)
                  ]"
                >
                  <div :class="['flex items-center justify-center rounded-full h-9 w-9 transition-transform duration-300', getIconStyle(item.key)]">
                    <component :is="item.icon" class="h-5 w-5" />
                  </div>
                  <span class="ml-4 font-medium text-sm">{{ item.name }}</span>
                </NuxtLink>
              </template>
            </div>
          </transition>
        </div>  

      </nav>
    </div>

    <!-- DIVIDER -->
    <div class="px-4">
      <div class="h-px bg-contrast w-full"></div>
    </div>

    <!-- USER -->
    <div class="px-4 py-6 w-full flex flex-col items-center space-y-3">

      <div
        class="w-full flex items-center space-x-3 bg-contrast rounded-2xl p-3 shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        <!-- Avatar -->
        <div class="relative h-10 w-10 shrink-0">
          <img
            v-if="user?.photo"
            :src="user.photo"
            :alt="user.fullName"
            class="h-10 w-10 rounded-full border-2 border-primary/20 object-cover"
          />
          <div
            v-else
            class="h-10 w-10 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center"
          >
            <span class="text-primary font-bold text-sm">
              {{ user?.fullName?.charAt(0) ?? '?' }}
            </span>
          </div>
          <!-- Loading shimmer -->
          <div v-if="loading" class="absolute inset-0 rounded-full bg-gray-200 animate-pulse" />
        </div>

        <div class="min-w-0">
          <p v-if="!loading" class="font-semibold text-gray-800 truncate">
            {{ user?.fullName ?? '—' }}
          </p>
          <div v-else class="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
          <p v-if="!loading" class="text-sm text-gray-500 truncate">
            {{ user?.position ?? '' }}
          </p>
          <div v-else class="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

    </div>

  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import {
  Compass,
  ShoppingBag,
  MessageSquare,
  Calendar,
  User,
  Globe,
  Newspaper,
  ClipboardList,
  Contact,
  GitBranch,
  UserCheck,
  Handshake,
  Briefcase,
  Blocks
} from 'lucide-vue-next'

const { user, loading, fetchUser } = useUser()
onMounted(fetchUser)

interface MenuItem {
  key: string
  name: string
  link: string
  icon: any
  external?: boolean
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

const hoverItem = ref('')
const hoverSection = ref('')
const activeKey = ref('explorer')

const openSection = ref('Inicio')

const toggleSection = (title: string) => {
  openSection.value = openSection.value === title ? '' : title
}

const menu: MenuSection[] = [

  {
    title: 'Inicio',
    items: [
      { key: 'explorer', name: 'Explorador', link: '/explorer', icon: Compass },
      { key: 'portfolio', name: 'Portafolio', link: '/portfolio', icon: Briefcase  },
      { key: 'marketplace', name: 'Marketplace', link: 'https://cccbr-clasificados.vercel.app/', icon: ShoppingBag, external: true }
    ]
  },

  // {
  //   title: 'Red Inmobiliaria',
  //   items: [
  //     { key: 'brokers', name: 'Brokers', link: '/', icon: UserCheck },
  //     { key: 'groups', name: 'Grupos', link: '/', icon: Users },
  //     { key: 'partners', name: 'Socios', link: '/', icon: Handshake }
  //   ]
  // },

  {
  title: 'Clientes',
    items: [
      { key: 'contacts', name: 'Contactos', link: '/explorer', icon: Contact },
      { key: 'requests', name: 'Solicitudes', link: '/explorer', icon: ClipboardList },
      { key: 'pipeline', name: 'Embudo', link: '/explorer', icon: GitBranch },
      { key: 'appointments', name: 'Citas', link: '/explorer', icon: Calendar }
    ]
  },

  {
    title: 'Comunidad',
    items: [
       { key: 'forum', name: 'Foro', link: '/forum', icon: Newspaper },
       { key: 'asociados', name: 'Asociados', link: '/asociados', icon: UserCheck },
      { key: 'chat', name: 'Chat', link: '/chats', icon: MessageSquare },
      // { key: 'groups', name: 'Grupos', link: '/explorer', icon: Users },
      { key: 'partners', name: 'Aliados', link: '/aliados', icon: Handshake }
    ]
  },

  {
    title: 'Cuenta',
    items: [
      { key: 'profile', name: 'Perfil', link: '/profile', icon: User },
      { key: 'web-site', name: 'Sitio Web', link: '/profile', icon: Globe },
      { key: 'integrations', name: 'Integraciones', link: '/profile', icon: Blocks }
    ]
  }

]

const isActive = (key: string) => activeKey.value === key

const getItemStyle = (key: string) => {

  const active = isActive(key)
  const hover = hoverItem.value === key

  if (active && hover)
    return 'bg-gradient-to-r from-secondary to-primary text-white'

  if (active)
    return 'bg-gradient-to-r from-primary to-secondary text-white'

  if (hover)
    return 'bg-gradient-to-r from-secondary to-primary text-white'

  return 'bg-contrast text-primary'

}

const getIconStyle = (key: string) => {

  const active = isActive(key)
  const hover = hoverItem.value === key

  if (active && hover)
    return 'bg-white text-secondary scale-110'

  if (active)
    return 'bg-white text-primary scale-105'

  if (hover)
    return 'bg-white text-secondary scale-105'

  return 'bg-contrast text-primary'
}

const getSectionStyle = (title: string) => {

  const hover = hoverSection.value === title
  const open = openSection.value === title

  if (hover)
    return 'text-secondary bg-contrast rounded-lg'

  if (open)
    return 'text-secondary'

  return 'text-primary'

}
</script>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  overflow: hidden;
  transition:
    max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.25s ease,
    transform 0.25s ease;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
}

.accordion-enter-to,
.accordion-leave-from {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}
</style>