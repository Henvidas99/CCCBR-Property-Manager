<script setup lang="ts">
import type { ApiActiveAdItem } from '~/types'

const route = useRoute()
const id = route.params.id as string
const { request } = useApi()

const { data: property, error, pending } = await useAsyncData<ApiActiveAdItem>(
  `explorer-property-${id}`,
  () => request<ApiActiveAdItem>(`/PropertyListing/get-property/${id}`)
)

// ── Helpers ───────────────────────────────────────────────────────────────────

const getPhotos = (item: ApiActiveAdItem): string[] => {
  if (!item.photos?.length) return []
  return item.photos.map(p => typeof p === 'string' ? p : (p?.url ?? '')).filter(Boolean)
}

const formatPrice = (price: number, currency: string, frequency: string | null): string => {
  const curr = currency === 'CRC' ? 'CRC' : 'USD'
  const locale = curr === 'CRC' ? 'es-CR' : 'en-US'
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
  return frequency ? `${formatted} / ${frequency}` : formatted
}

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' })
}

const getLocation = (item: ApiActiveAdItem): string => {
  const parts = [item.district, item.county, item.province].filter(Boolean)
  return parts.length ? parts.join(', ') : item.address_Description || 'Costa Rica'
}

const visibilityLabel: Record<string, { label: string; class: string }> = {
  public:   { label: 'Publicado',  class: 'bg-green-100 text-green-700'  },
  private:  { label: 'Privado',    class: 'bg-gray-100 text-gray-600'    },
  inactive: { label: 'Inactivo',   class: 'bg-red-100 text-red-600'      },
}
const getVisibility = (v: string) =>
  visibilityLabel[v?.toLowerCase()] ?? { label: v ?? '—', class: 'bg-gray-100 text-gray-500' }

// ── Photo carousel ────────────────────────────────────────────────────────────

const photos = computed(() => property.value ? getPhotos(property.value) : [])
const activePhoto = ref(0)
watch(photos, () => { activePhoto.value = 0 })
</script>

<template>
  <div class="bg-gray-50 min-h-screen">

    <!-- Loading bar -->
    <div v-if="pending" class="fixed top-0 left-0 w-full z-50">
      <div class="h-1 bg-[#202d59] animate-pulse"></div>
    </div>

    <!-- Error -->
    <div v-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No se pudo cargar la propiedad</h3>
        <p class="text-gray-500 mb-4">{{ error.message }}</p>
        <NuxtLink to="/explorer" class="text-[#202d59] hover:underline text-sm font-medium">← Volver al explorador</NuxtLink>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-else-if="pending" class="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
      <div class="animate-pulse space-y-4">
        <div class="h-5 bg-gray-200 rounded w-32"></div>
        <div class="h-72 bg-gray-200 rounded-2xl"></div>
        <div class="h-6 bg-gray-200 rounded w-2/3"></div>
        <div class="h-4 bg-gray-200 rounded w-1/3"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="property" class="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">

      <!-- Back link -->
      <NuxtLink to="/explorer" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#202d59] transition-colors mb-4">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Volver al explorador
      </NuxtLink>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <!-- Photo carousel -->
        <div class="relative bg-gray-100">
          <div v-if="photos.length" class="relative h-72 sm:h-96 overflow-hidden">
            <img
              :src="photos[activePhoto]"
              :alt="property.title"
              class="w-full h-full object-cover"
            />
            <!-- Arrows -->
            <button
              v-if="photos.length > 1"
              @click="activePhoto = (activePhoto - 1 + photos.length) % photos.length"
              class="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              v-if="photos.length > 1"
              @click="activePhoto = (activePhoto + 1) % photos.length"
              class="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <!-- Counter -->
            <div v-if="photos.length > 1" class="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
              {{ activePhoto + 1 }} / {{ photos.length }}
            </div>
          </div>
          <!-- No photo placeholder -->
          <div v-else class="h-56 flex items-center justify-center">
            <svg class="w-14 h-14 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>

          <!-- Thumbnail strip -->
          <div v-if="photos.length > 1" class="flex gap-2 overflow-x-auto px-4 py-3 bg-white border-t border-gray-100">
            <button
              v-for="(photo, i) in photos"
              :key="i"
              @click="activePhoto = i"
              :class="['shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all', i === activePhoto ? 'border-[#202d59]' : 'border-transparent opacity-60 hover:opacity-100']"
            >
              <img :src="photo" :alt="`Foto ${i + 1}`" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Detail body -->
        <div class="p-6 space-y-6">

          <!-- Badges + title + price -->
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#202d59]/10 text-[#202d59]">{{ property.categoryName }}</span>
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">{{ property.modeDescription }}</span>
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full" :class="getVisibility(property.visibility).class">
                {{ getVisibility(property.visibility).label }}
              </span>
              <span v-if="property.code" class="text-xs font-mono text-gray-400 ml-auto">{{ property.code }}</span>
            </div>

            <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ property.title }}</h1>

            <p class="text-sm text-gray-500 flex items-center gap-1 mb-3">
              <svg class="w-4 h-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ getLocation(property) }}
            </p>

            <p class="text-3xl font-bold text-[#202d59]">
              {{ formatPrice(property.price, property.currency, property.payment_Frequency) }}
            </p>
          </div>

          <hr class="border-gray-100" />

          <!-- Info grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div v-if="property.dimension">
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Dimensión</p>
              <p class="text-gray-800 font-medium">{{ property.dimension }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Publicado</p>
              <p class="text-gray-800 font-medium">{{ formatDate(property.createdDate) }}</p>
            </div>
            <div v-if="property.updatedDate">
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Actualizado</p>
              <p class="text-gray-800 font-medium">{{ formatDate(property.updatedDate) }}</p>
            </div>
            <div v-if="property.zone">
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Zona</p>
              <p class="text-gray-800 font-medium">{{ property.zone }}</p>
            </div>
            <div v-if="property.commission">
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Comisión</p>
              <p class="text-gray-800 font-medium">{{ property.commission }}{{ property.commisionType ? ` ${property.commisionType}` : '' }}</p>
            </div>
            <div v-if="property.score != null">
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Puntaje</p>
              <p class="text-gray-800 font-medium">{{ property.score }}</p>
            </div>
          </div>

          <!-- Description -->
          <div v-if="property.description">
            <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Descripción</h2>
            <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ property.description }}</p>
          </div>

          <!-- Details -->
          <div v-if="property.details">
            <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Detalles</h2>
            <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ property.details }}</p>
          </div>

          <!-- Services / Amenities -->
          <div v-if="property.services || property.amenities" class="grid sm:grid-cols-2 gap-4">
            <div v-if="property.services">
              <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Servicios</h2>
              <p class="text-sm text-gray-600 whitespace-pre-line">{{ property.services }}</p>
            </div>
            <div v-if="property.amenities">
              <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Amenidades</h2>
              <p class="text-sm text-gray-600 whitespace-pre-line">{{ property.amenities }}</p>
            </div>
          </div>

          <!-- Broker -->
          <div class="flex items-center gap-3 pt-2 border-t border-gray-100">
            <div class="w-9 h-9 rounded-full bg-[#202d59]/10 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-[#202d59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-400">Agente responsable</p>
              <p class="text-sm font-semibold text-gray-800">{{ property.userFullName || '—' }}</p>
            </div>
            <!-- Social links -->
            <div class="ml-auto flex items-center gap-2">
              <a v-if="property.google_Maps" :href="property.google_Maps" target="_blank" rel="noopener" class="text-xs flex items-center gap-1 text-[#202d59] hover:underline">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Maps
              </a>
              <a v-if="property.facebookUrl" :href="property.facebookUrl" target="_blank" rel="noopener" class="text-xs text-blue-600 hover:underline">Facebook</a>
              <a v-if="property.instagramUrl" :href="property.instagramUrl" target="_blank" rel="noopener" class="text-xs text-pink-600 hover:underline">Instagram</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
