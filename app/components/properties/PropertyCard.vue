<script setup lang="ts">
import type { Listing } from '~/types'

interface Props {
  listing: Listing
}

const props = defineProps<Props>()

const imageError = ref(false)
const handleImageError = () => { imageError.value = true }

const isEmoji = (str: string) => {
  if (!str || str.length > 4) return false
  return /^[\p{Emoji}]+$/u.test(str)
}

const goToMarketplace = (adId: number, event: MouseEvent) => {
  event.preventDefault()
  window.open(`https://cccbr-clasificados.vercel.app/clasificados/${adId}`, '_blank', 'noopener')
}
</script>

<template>
  <NuxtLink
    :to="`/explorer/${listing.id}`"
    class="block bg-white rounded-xl overflow-hidden shadow-md transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer relative"
  >
    <!-- Image -->
    <div class="relative w-full h-56 bg-gray-200 overflow-hidden">
      <!-- Active ad badge -->
      <button
        v-if="listing.activeAdId != null"
        @click="goToMarketplace(listing.activeAdId!, $event)"
        class="absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-semibold z-10 bg-[#00cfe5] text-[#202d59] backdrop-blur-sm flex items-center gap-1 shadow hover:bg-[#00b8cc] transition-colors"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Anuncio
      </button>

      <span
        v-if="listing.publishedTimeAgo"
        class="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold z-10 bg-[#202d59]/85 text-white backdrop-blur-sm flex items-center gap-1"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ listing.publishedTimeAgo }}
      </span>

      <img
        v-if="!isEmoji(listing.image) && listing.image && !imageError"
        :src="listing.image"
        :alt="listing.title"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-[#202d59] to-[#00cfe5]"
      >
        🏠
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="text-sm font-semibold text-gray-800 mb-1.5 overflow-hidden whitespace-nowrap text-ellipsis">
        {{ listing.title }}
      </h3>
      <p class="text-xs text-gray-500 mb-3">📍 {{ listing.location }}</p>

      <div v-if="listing.specs.length > 0" class="flex flex-wrap gap-1.5 mb-3">
        <span
          v-for="(spec, i) in listing.specs"
          :key="i"
          class="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600"
        >
          {{ spec }}
        </span>
      </div>

      <!-- Publisher -->
      <div class="flex items-center gap-2 mb-3">
        <div class="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          <img
            v-if="listing.publisherImage"
            :src="listing.publisherImage"
            :alt="listing.publisherName"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-[#202d59] text-white text-xs font-bold">
            {{ listing.publisherName?.charAt(0) || 'A' }}
          </div>
        </div>
        <span class="text-xs text-[#202d59] font-medium truncate">{{ listing.publisherName || 'Agente' }}</span>
      </div>

      <!-- Price + mode -->
      <div class="flex justify-between items-center pt-3 border-t border-gray-100">
        <p class="text-base font-bold text-[#a31e22]">{{ listing.price }}</p>
        <span
          v-if="listing.modeDescription"
          class="text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white bg-[#202d59]"
        >
          {{ listing.modeDescription }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
