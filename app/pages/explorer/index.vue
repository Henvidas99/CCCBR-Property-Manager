<script setup lang="ts">
import { useFilterSidebar } from '~/composables/useFilterSidebar'
import { useLocation } from '~/composables/useLocation'
import { useProperties } from '~/composables/useProperties'
import type { ApiActiveAdPagedResponse } from '~/types'

const config  = useRuntimeConfig()
const { selectedProvince, selectedCantons, selectedDistricts } = useLocation()
const { buildApiUrl, mapApiPropertyToListing } = useProperties()
const { isFilterSidebarOpen, closeFilterSidebar } = useFilterSidebar()

// ── Pagination ────────────────────────────────────────────────────────────────

const currentPage  = ref(1)
const itemsPerPage = 10

// ── API URL (reactive to location filters and page) ───────────────────────────

const apiUrl = buildApiUrl(currentPage, itemsPerPage, selectedProvince, selectedCantons, selectedDistricts)

const { data: rawData, error, status } = await useFetch<ApiActiveAdPagedResponse>(
  apiUrl,
  { key: 'property-explorer', watch: [apiUrl] }
)

// ── Derived data ──────────────────────────────────────────────────────────────

const listings   = computed(() => rawData.value?.items?.map(mapApiPropertyToListing) ?? [])
const totalCount = computed(() => rawData.value?.totalCount ?? 0)
const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage))

// Reset to page 1 whenever filters change
watch([selectedProvince, selectedCantons, selectedDistricts], () => { currentPage.value = 1 })

// ── Client-side filters ───────────────────────────────────────────────────────

const filters = reactive({
  priceMin:     0,
  priceMax:     5000000,
  propertyType: [] as string[],
  condition:    [] as string[],
  rooms:        '',
})

const parsePrice = (priceStr: string): number =>
  parseInt(priceStr.replace(/[₡$,]/g, '').trim(), 10) || 0

const filteredListings = computed(() => {
  let results = [...listings.value]

  if (filters.propertyType.length > 0) {
    const types = filters.propertyType.map(t => t.toLowerCase())
    results = results.filter(l => types.some(t => l.specs.some(s => s.toLowerCase().includes(t))))
  }

  if (filters.priceMin > 0 || filters.priceMax < 5000000) {
    results = results.filter(l => {
      const p = parsePrice(l.price)
      return p >= filters.priceMin && p <= filters.priceMax
    })
  }

  return results
})

// ── Exchange rate (USD ↔ CRC) — BCCR ─────────────────────────────────────────

const exchangeCompra      = ref<number | null>(null)
const exchangeVenta       = ref<number | null>(null)
const exchangeRateLoading = ref(false)
const exchangeRateError   = ref(false)
const exchangeRateUpdated = ref('')
const showExchangeModal   = ref(false)

const fetchExchangeRate = async () => {
  exchangeRateLoading.value = true
  exchangeRateError.value   = false
  try {
    const data = await $fetch<{ compra: number; venta: number; fecha: string }>('/api/exchange-rate')
    exchangeCompra.value      = data.compra
    exchangeVenta.value       = data.venta
    exchangeRateUpdated.value = new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })

  } catch {
    exchangeRateError.value = true
  } finally {
    exchangeRateLoading.value = false
  }
}

// Converter inside modal
const convertDir    = ref<'usd-crc' | 'crc-usd'>('usd-crc')
const convertAmount = ref('')

const convertResult = computed(() => {
  const num = parseFloat(convertAmount.value)
  if (isNaN(num) || num <= 0) return null
  if (convertDir.value === 'usd-crc') {
    if (!exchangeCompra.value) return null
    const crc = Math.round(num * exchangeCompra.value)
    return `₡ ${crc.toLocaleString('es-CR')}`
  } else {
    if (!exchangeVenta.value) return null
    const usd = (num / exchangeVenta.value).toFixed(2)
    return `$ ${parseFloat(usd).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`
  }
})

const toggleDir = () => {
  convertDir.value    = convertDir.value === 'usd-crc' ? 'crc-usd' : 'usd-crc'
  convertAmount.value = ''
}

onMounted(fetchExchangeRate)

// ── Pagination helpers ────────────────────────────────────────────────────────

const displayedPages = computed(() => {
  const pages: number[] = []
  const total   = totalPages.value
  const current = currentPage.value
  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else if (current <= 3) {
    pages.push(1, 2, 3, 4, 5)
  } else if (current >= total - 2) {
    pages.push(total - 4, total - 3, total - 2, total - 1, total)
  } else {
    pages.push(current - 2, current - 1, current, current + 1, current + 2)
  }
  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// ── Page title ────────────────────────────────────────────────────────────────

const pageTitle = computed(() => {
  if (selectedDistricts.value.length > 1)   return `Propiedades en ${selectedDistricts.value.length} distritos, ${selectedProvince.value}`
  if (selectedDistricts.value.length === 1) return `Propiedades en ${selectedDistricts.value[0]}, ${selectedProvince.value}`
  if (selectedCantons.value.length > 1)     return `Propiedades en ${selectedCantons.value.length} cantones, ${selectedProvince.value}`
  if (selectedCantons.value.length === 1)   return `Propiedades en ${selectedCantons.value[0]}, ${selectedProvince.value}`
  if (selectedProvince.value)               return `Propiedades en ${selectedProvince.value}`
  return 'Propiedades en Costa Rica'
})

// ── Filter sidebar handlers ───────────────────────────────────────────────────

const applyFilters = (newFilters: { priceRange: number[]; propertyTypes: string[]; rooms: string; conditions: string[] }) => {
  filters.priceMin     = newFilters.priceRange[0] ?? 0
  filters.priceMax     = newFilters.priceRange[1] ?? 5000000
  filters.propertyType = newFilters.propertyTypes
  filters.condition    = newFilters.conditions
  filters.rooms        = newFilters.rooms
  closeFilterSidebar()
}

const clearFilters = () => {
  filters.priceMin     = 0
  filters.priceMax     = 5000000
  filters.propertyType = []
  filters.condition    = []
  filters.rooms        = ''
}

// ── Map modal ─────────────────────────────────────────────────────────────────

const showMapModal = ref(false)

const mapCenterLocation = computed(() => {
  if (selectedDistricts.value.length === 1) return `${selectedDistricts.value[0]}, ${selectedProvince.value}`
  if (selectedCantons.value.length === 1)   return `${selectedCantons.value[0]}, ${selectedProvince.value}`
  if (selectedCantons.value.length > 1)     return selectedProvince.value
  return selectedProvince.value
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen relative">

    <!-- Loading bar -->
    <div v-if="status === 'pending'" class="fixed top-0 left-0 w-full z-50">
      <div class="h-1 bg-[#202d59] animate-pulse"></div>
    </div>

    <!-- Error state (only when no data at all) -->
    <div v-if="error && !rawData" class="flex items-center justify-center min-h-[50vh]">
      <div class="text-center">
        <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Error al cargar propiedades</h3>
        <p class="text-gray-600">{{ error.message }}</p>
      </div>
    </div>

    <template v-else>
      <!-- Filter sidebar drawer -->
      <PropertiesFilterSidebar
        :is-open="isFilterSidebarOpen"
        @close="closeFilterSidebar"
        @apply="applyFilters"
        @clear="clearFilters"
      />

      <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
        <!-- Header -->
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{{ pageTitle }}</h1>
            <p class="text-sm text-gray-500">{{ totalCount }} propiedades disponibles</p>
          </div>

          <!-- Compact exchange rate pill -->
          <button
            @click="showExchangeModal = true"
            class="group flex flex-col bg-white border-2 border-gray-200 hover:border-[#202d59] rounded-xl px-4 pt-2.5 pb-2 shadow-sm transition-all duration-200 cursor-pointer self-start sm:self-auto"
          >
            <!-- Label -->
            <p class="text-xs text-gray-400 font-medium mb-2 text-left">
              Tipo de cambio <span class="text-[#202d59] font-semibold">(BCCR)</span>
            </p>

            <!-- Skeleton while loading -->
            <div v-if="exchangeRateLoading" class="flex items-center gap-3 animate-pulse">
              <div class="text-center">
                <div class="h-3 w-10 bg-gray-200 rounded mb-1"></div>
                <div class="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
              <div class="w-px h-7 bg-gray-200"></div>
              <div class="text-center">
                <div class="h-3 w-10 bg-gray-200 rounded mb-1"></div>
                <div class="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>

            <!-- Error -->
            <p v-else-if="exchangeRateError" class="text-xs text-red-400 font-medium">
              Sin conexion con BCCR
            </p>

            <!-- Rates -->
            <div v-else-if="exchangeCompra && exchangeVenta" class="flex items-center gap-3">
              <div class="text-center">
                <p class="text-xs text-gray-400 font-medium leading-none mb-1">Compra</p>
                <p class="text-sm font-bold text-[#202d59] group-hover:text-[#a31e22] transition-colors leading-none">
                  ₡ {{ exchangeCompra.toLocaleString('es-CR') }}
                </p>
              </div>
              <div class="w-px h-7 bg-gray-200"></div>
              <div class="text-center">
                <p class="text-xs text-gray-400 font-medium leading-none mb-1">Venta</p>
                <p class="text-sm font-bold text-[#202d59] group-hover:text-[#a31e22] transition-colors leading-none">
                  ₡ {{ exchangeVenta.toLocaleString('es-CR') }}
                </p>
              </div>
              <svg class="w-3.5 h-3.5 text-gray-300 group-hover:text-[#202d59] transition-colors ml-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <!-- Property grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <PropertiesPropertyCard
            v-for="listing in filteredListings"
            :key="listing.id"
            :listing="listing"
          />
        </div>

        <!-- Empty state -->
        <div v-if="filteredListings.length === 0 && status !== 'pending'" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No se encontraron propiedades</h3>
          <p class="text-gray-600">Intenta ajustar los filtros de busqueda</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 py-8 mt-8">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            :class="['px-4 py-2 border-2 rounded-lg cursor-pointer text-sm font-medium transition-all', currentPage === 1 ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300 bg-white text-gray-700 hover:border-[#202d59] hover:text-[#202d59]']"
          >
            ← Anterior
          </button>

          <button
            v-for="page in displayedPages"
            :key="page"
            @click="goToPage(page)"
            :class="['px-4 py-2 border-2 rounded-lg cursor-pointer text-sm font-medium transition-all', currentPage === page ? 'bg-[#202d59] border-[#202d59] text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-[#202d59] hover:text-[#202d59]']"
          >
            {{ page }}
          </button>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            :class="['px-4 py-2 border-2 rounded-lg cursor-pointer text-sm font-medium transition-all', currentPage === totalPages ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300 bg-white text-gray-700 hover:border-[#202d59] hover:text-[#202d59]']"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </template>

    <!-- Floating map button -->
    <button
      @click="showMapModal = true"
      class="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-[#202d59] hover:bg-[#a31e22] text-white font-semibold rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(163,30,34,0.4)]"
      title="Ver propiedades en el mapa"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    </button>

    <!-- Map modal -->
    <PropertiesMapModal
      :is-open="showMapModal"
      :location="mapCenterLocation"
      :location-label="pageTitle"
      @close="showMapModal = false"
    />

    <!-- Exchange rate modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showExchangeModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          @click.self="showExchangeModal = false"
        >
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div v-if="showExchangeModal" class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

              <!-- Modal header -->
              <div class="bg-[#202d59] px-6 py-5 flex items-center justify-between">
                <div>
                  <h2 class="text-white font-bold text-lg leading-none">Tipo de Cambio</h2>
                  <p class="text-blue-200 text-xs mt-1">Dólar · Colón costarricense</p>
                </div>
                <button
                  @click="showExchangeModal = false"
                  class="text-blue-200 hover:text-white transition-colors cursor-pointer p-1"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="px-6 py-5 space-y-5">

                <!-- Compra / Venta cards -->
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-center">
                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Compra</p>
                    <p class="text-xl font-bold text-[#202d59]">
                      <span v-if="exchangeCompra">₡ {{ exchangeCompra.toLocaleString('es-CR') }}</span>
                      <span v-else class="text-gray-300">—</span>
                    </p>
                    <p class="text-xs text-gray-400 mt-1">por dólar</p>
                  </div>
                  <div class="bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-center">
                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Venta</p>
                    <p class="text-xl font-bold text-[#202d59]">
                      <span v-if="exchangeVenta">₡ {{ exchangeVenta.toLocaleString('es-CR') }}</span>
                      <span v-else class="text-gray-300">—</span>
                    </p>
                    <p class="text-xs text-gray-400 mt-1">por dólar</p>
                  </div>
                </div>

                <!-- Divider -->
                <div class="border-t border-gray-100"></div>

                <!-- Converter -->
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <p class="text-sm font-semibold text-gray-700">Convertidor</p>
                    <button
                      @click="toggleDir"
                      class="flex items-center gap-1.5 text-xs font-medium text-[#202d59] hover:text-[#a31e22] transition-colors cursor-pointer"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      {{ convertDir === 'usd-crc' ? 'Dólares → Colones' : 'Colones → Dólares' }}
                    </button>
                  </div>

                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 select-none">
                      {{ convertDir === 'usd-crc' ? '$' : '₡' }}
                    </span>
                    <input
                      v-model="convertAmount"
                      type="number"
                      min="0"
                      :placeholder="convertDir === 'usd-crc' ? '0.00' : '0'"
                      class="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#202d59] transition-colors"
                    />
                  </div>

                  <!-- Result -->
                  <div
                    class="mt-3 rounded-xl px-4 py-3 text-center transition-all"
                    :class="convertResult ? 'bg-[#202d59]' : 'bg-gray-50'"
                  >
                    <p v-if="convertResult" class="text-xl font-bold text-white">{{ convertResult }}</p>
                    <p v-else class="text-sm text-gray-400">Ingresa un monto para convertir</p>
                  </div>

                  <p v-if="convertResult" class="text-xs text-gray-400 text-center mt-2">
                    Usando tasa de {{ convertDir === 'usd-crc' ? 'compra' : 'venta' }} referencial
                  </p>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between pt-1">
                  <p class="text-xs text-gray-400">
                    <span v-if="exchangeRateUpdated">Act. {{ exchangeRateUpdated }}</span>
                  </p>
                  <button
                    @click="fetchExchangeRate"
                    :disabled="exchangeRateLoading"
                    class="flex items-center gap-1 text-xs text-gray-400 hover:text-[#202d59] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <svg
                      class="w-3 h-3"
                      :class="{ 'animate-spin': exchangeRateLoading }"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualizar
                  </button>
                </div>

              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>
