<script setup lang="ts">
import type { ApiMyPropertiesPagedResponse, ApiActiveAdItem } from '~/types'

const { request } = useApi()
const config = useRuntimeConfig()

// ── Pagination ────────────────────────────────────────────────────────────────

const currentPage  = ref(1)
const itemsPerPage = 10

// ── Authenticated fetch ───────────────────────────────────────────────────────

const { data: rawData, error, pending } = await useAsyncData<ApiMyPropertiesPagedResponse>(
  () => `portfolio-my-properties-${currentPage.value}`,
  () => request<ApiMyPropertiesPagedResponse>(
    `/PropertyListing/my-properties?page=${currentPage.value}&pageSize=${itemsPerPage}`
  ),
  { watch: [currentPage] }
)

// ── Derived data ──────────────────────────────────────────────────────────────

const properties  = computed<ApiActiveAdItem[]>(() => rawData.value?.data ?? [])
const totalCount  = computed(() => rawData.value?.total ?? 0)
const hasNextPage = computed(() => currentPage.value * itemsPerPage < totalCount.value)
const hasPrevPage = computed(() => currentPage.value > 1)

// ── Helpers ───────────────────────────────────────────────────────────────────

const getPhoto = (item: ApiActiveAdItem): string => {
  if (!item.photos?.length) return ''
  const p = item.photos[0]
  return typeof p === 'string' ? p : (p?.url ?? '')
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

const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })
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

// ── Pagination ────────────────────────────────────────────────────────────────

const goToPage = (page: number) => {
  if (page >= 1 && (page < currentPage.value || hasNextPage.value)) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen relative">

    <!-- Loading bar -->
    <div v-if="pending" class="fixed top-0 left-0 w-full z-50">
      <div class="h-1 bg-[#202d59] animate-pulse"></div>
    </div>

    <!-- Error state -->
    <div v-if="error" class="flex items-center justify-center min-h-[50vh]">
      <div class="text-center">
        <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Error al cargar propiedades</h3>
        <p class="text-gray-600">{{ error.message }}</p>
      </div>
    </div>

    <div v-else class="w-full px-4 sm:px-6 lg:px-8 py-6">

      <!-- Header -->
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Mi Portafolio</h1>
          <p class="text-sm text-gray-500">
            <span v-if="!pending">{{ totalCount }} propiedad{{ totalCount !== 1 ? 'es' : '' }} registrada{{ totalCount !== 1 ? 's' : '' }}</span>
            <span v-else>Cargando...</span>
          </p>
        </div>
        <NuxtLink
          to="/portfolio/new"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-[#202d59] hover:bg-[#a31e22] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva propiedad
        </NuxtLink>
      </div>

      <!-- Skeleton while loading -->
      <div v-if="pending" class="flex flex-col gap-4">
        <div
          v-for="i in itemsPerPage"
          :key="i"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse flex h-40"
        >
          <div class="w-44 shrink-0 bg-gray-200"></div>
          <div class="flex-1 p-5 space-y-3">
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            <div class="h-3 bg-gray-200 rounded w-1/3"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            <div class="h-5 bg-gray-200 rounded w-1/4 mt-auto"></div>
          </div>
        </div>
      </div>

      <!-- Property list -->
      <div v-else-if="properties.length" class="flex flex-col gap-4">
        <NuxtLink
          v-for="item in properties"
          :key="item.id_Property"
          :to="`/portfolio/${item.id_Property}`"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#202d59]/20 transition-all duration-200 overflow-hidden flex flex-col sm:flex-row group"
        >
          <!-- Photo -->
          <div class="sm:w-48 lg:w-56 shrink-0 relative overflow-hidden bg-gray-100">
            <img
              v-if="getPhoto(item)"
              :src="getPhoto(item)"
              :alt="item.title"
              class="w-full h-48 sm:h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div v-else class="w-full h-48 sm:h-full flex items-center justify-center bg-gray-100">
              <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>

            <!-- Photo count badge -->
            <div
              v-if="item.photos?.length > 1"
              class="absolute bottom-2 right-2 bg-black/50 text-white text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm"
            >
              +{{ item.photos.length - 1 }}
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 p-5 flex flex-col justify-between min-w-0">
            <div>
              <!-- Badges row -->
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#202d59]/10 text-[#202d59]">
                  {{ item.categoryName }}
                </span>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                  {{ item.modeDescription }}
                </span>
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full"
                  :class="getVisibility(item.visibility).class"
                >
                  {{ getVisibility(item.visibility).label }}
                </span>
              </div>

              <!-- Title -->
              <h2 class="text-base font-bold text-gray-900 leading-snug mb-1 truncate group-hover:text-[#202d59] transition-colors">
                {{ item.title }}
              </h2>

              <!-- Location -->
              <p class="text-sm text-gray-500 truncate flex items-center gap-1">
                <svg class="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ getLocation(item) }}
              </p>

              <!-- Dimension if available -->
              <p v-if="item.dimension" class="text-xs text-gray-400 mt-1">
                {{ item.dimension }}
              </p>
            </div>

            <!-- Footer row -->
            <div class="flex items-end justify-between mt-3 gap-4">
              <div>
                <p class="text-xl font-bold text-[#202d59]">
                  {{ formatPrice(item.price, item.currency, item.payment_Frequency) }}
                </p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs text-gray-400 leading-none mb-0.5">Publicado</p>
                <p class="text-xs font-medium text-gray-600">{{ formatDate(item.createdDate) }}</p>
                <p v-if="item.viewCount > 0" class="text-xs text-gray-400 mt-0.5 flex items-center justify-end gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {{ item.viewCount }}
                </p>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty state -->
      <div v-else-if="!pending" class="text-center py-16">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Sin propiedades aún</h3>
        <p class="text-gray-500 mb-6">Agrega tu primera propiedad para comenzar.</p>
        <NuxtLink
          to="/portfolio/new"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#202d59] hover:bg-[#a31e22] text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva propiedad
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <div v-if="hasPrevPage || hasNextPage" class="flex justify-center items-center gap-2 py-8 mt-4">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="!hasPrevPage"
          :class="['px-4 py-2 border-2 rounded-lg cursor-pointer text-sm font-medium transition-all', !hasPrevPage ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300 bg-white text-gray-700 hover:border-[#202d59] hover:text-[#202d59]']"
        >
          ← Anterior
        </button>

        <span class="px-4 py-2 text-sm font-medium text-gray-700">
          {{ currentPage }} / {{ Math.ceil(totalCount / itemsPerPage) || 1 }}
        </span>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="!hasNextPage"
          :class="['px-4 py-2 border-2 rounded-lg cursor-pointer text-sm font-medium transition-all', !hasNextPage ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300 bg-white text-gray-700 hover:border-[#202d59] hover:text-[#202d59]']"
        >
          Siguiente →
        </button>
      </div>

    </div>
  </div>
</template>
