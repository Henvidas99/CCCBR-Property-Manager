<script setup lang="ts">
import { getProvinceNames, getCantonsByProvince } from '~/constants/costaRicaLocations'
import { getDistrictsByCantons } from '~/constants/costaRicaDistricts'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'apply', filters: { priceRange: number[]; propertyTypes: string[]; rooms: string; conditions: string[] }): void
  (e: 'clear'): void
}

const props = defineProps<Props>()
const emit  = defineEmits<Emits>()

const { setLocation } = useLocation()
const { closeFilterSidebar } = useFilterSidebar()

const PROPERTY_TYPES = ['Casa', 'Apartamento', 'Local', 'Oficina', 'Terreno', 'Bodega']
const CONDITIONS     = ['Nuevo', 'Usado', 'Remodelado', 'En construccion']
const ROOMS          = ['1+', '2+', '3+', '4+', '5+']

const priceRange           = ref([0, 500000])
const selectedCondition    = ref<string[]>([])
const selectedPropertyTypes = ref<string[]>([])
const selectedRooms        = ref<string>('')

// ── Location state ────────────────────────────────────────────────────────────
const locationStep   = ref<'province' | 'canton' | 'district'>('province')
const filterProvince = ref('')
const filterCantons  = ref<string[]>([])
const filterDistricts = ref<string[]>([])

const availableCantons = computed(() => filterProvince.value ? getCantonsByProvince(filterProvince.value) : [])

const availableDistrictGroups = computed(() => {
  if (!filterProvince.value || filterCantons.value.length === 0) return []
  return getDistrictsByCantons(filterProvince.value, filterCantons.value)
})

const locationSummary = computed(() => {
  if (filterDistricts.value.length > 0) {
    return filterDistricts.value.length === 1 ? filterDistricts.value[0] : `${filterDistricts.value.length} distritos`
  }
  if (filterCantons.value.length > 0) {
    return filterCantons.value.length === 1 ? filterCantons.value[0] : `${filterCantons.value.length} cantones`
  }
  return filterProvince.value || ''
})

const handleSelectProvince = (province: string) => {
  filterProvince.value  = province
  filterCantons.value   = []
  filterDistricts.value = []
  locationStep.value    = 'canton'
}

const handleToggleFilterCanton = (canton: string) => {
  if (filterCantons.value.includes(canton)) {
    filterCantons.value = filterCantons.value.filter(c => c !== canton)
    const validDistricts = getDistrictsByCantons(filterProvince.value, filterCantons.value).flatMap(g => g.districts)
    filterDistricts.value = filterDistricts.value.filter(d => validDistricts.includes(d))
  } else {
    filterCantons.value = [...filterCantons.value, canton]
  }
}

const handleToggleDistrict = (district: string) => {
  if (filterDistricts.value.includes(district)) {
    filterDistricts.value = filterDistricts.value.filter(d => d !== district)
  } else {
    filterDistricts.value = [...filterDistricts.value, district]
  }
}

const handleConfirmCantons = () => { locationStep.value = 'district' }

const handleApplyLocation = () => {
  setLocation(filterProvince.value, filterCantons.value, filterDistricts.value)
  closeFilterSidebar()
}

const handleClearLocation = () => {
  filterProvince.value  = ''
  filterCantons.value   = []
  filterDistricts.value = []
  locationStep.value    = 'province'
  setLocation('')
}

const handleLocationBack = () => {
  if (locationStep.value === 'district') {
    filterDistricts.value = []
    locationStep.value    = 'canton'
  } else if (locationStep.value === 'canton') {
    filterCantons.value   = []
    filterDistricts.value = []
    locationStep.value    = 'province'
  }
}

const handleConditionChange = (condition: string) => {
  if (selectedCondition.value.includes(condition)) {
    selectedCondition.value = selectedCondition.value.filter(c => c !== condition)
  } else {
    selectedCondition.value = [...selectedCondition.value, condition]
  }
}

const handlePropertyTypeChange = (type: string) => {
  if (selectedPropertyTypes.value.includes(type)) {
    selectedPropertyTypes.value = selectedPropertyTypes.value.filter(t => t !== type)
  } else {
    selectedPropertyTypes.value = [...selectedPropertyTypes.value, type]
  }
}

const handleApplyFilters = () => {
  emit('apply', {
    priceRange: priceRange.value,
    propertyTypes: selectedPropertyTypes.value,
    rooms: selectedRooms.value,
    conditions: selectedCondition.value,
  })
}

const handleClearFilters = () => {
  priceRange.value            = [0, 500000]
  selectedCondition.value     = []
  selectedPropertyTypes.value = []
  selectedRooms.value         = ''
  handleClearLocation()
  emit('clear')
}

watch(() => props.isOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : 'unset'
})

onUnmounted(() => { document.body.style.overflow = 'unset' })
</script>

<template>
  <!-- Overlay -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-40" @click="emit('close')" />

  <!-- Drawer -->
  <aside
    :class="[
      'fixed top-0 left-0 h-full w-full sm:w-96 md:w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <div class="p-5 sm:p-6 md:p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 class="text-xl font-bold text-gray-900">Filtros</h2>
        <button @click="emit('close')" class="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Cerrar filtros">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Location Filter -->
      <div class="mb-6 pb-6 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-gray-800">Ubicacion</h3>
          <button v-if="filterProvince" @click="handleClearLocation" class="text-xs text-red-500 hover:text-red-700 font-medium">
            Limpiar
          </button>
        </div>

        <div v-if="locationSummary" class="mb-3 flex items-center gap-2 text-sm bg-[#202d59]/10 text-[#202d59] rounded-lg px-3 py-2 font-medium">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="truncate">{{ filterProvince }} &rsaquo; {{ locationSummary }}</span>
        </div>

        <button v-if="locationStep !== 'province'" @click="handleLocationBack" class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <!-- Step 1: Province -->
        <div v-if="locationStep === 'province'">
          <label class="text-xs text-gray-500 mb-2 block">Provincia</label>
          <div class="flex flex-col gap-1 max-h-60 overflow-y-auto">
            <button
              v-for="province in getProvinceNames()"
              :key="province"
              @click="handleSelectProvince(province)"
              :class="['w-full text-left px-3 py-2 text-sm rounded-lg transition-colors', filterProvince === province ? 'bg-[#202d59] text-white' : 'text-gray-700 hover:bg-gray-100']"
            >
              {{ province }}
            </button>
          </div>
        </div>

        <!-- Step 2: Cantons -->
        <div v-if="locationStep === 'canton'">
          <label class="text-xs text-gray-500 mb-2 block">Cantones de {{ filterProvince }}</label>
          <div class="flex flex-col gap-1 max-h-60 overflow-y-auto">
            <label
              v-for="canton in availableCantons"
              :key="canton"
              :class="['flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors', filterCantons.includes(canton) ? 'bg-[#00cfe5]/15 text-[#202d59] font-semibold' : 'text-gray-700 hover:bg-gray-100']"
            >
              <input type="checkbox" :checked="filterCantons.includes(canton)" @change="handleToggleFilterCanton(canton)" class="w-4 h-4 rounded border-gray-300 text-[#202d59] focus:ring-[#202d59] cursor-pointer" />
              {{ canton }}
            </label>
          </div>
          <button v-if="filterCantons.length > 0" @click="handleConfirmCantons" class="w-full mt-3 py-2 bg-[#202d59] text-white rounded-lg text-sm font-medium hover:bg-[#1a2447] transition-colors">
            Seleccionar distritos ({{ filterCantons.length }})
          </button>
          <button v-if="filterCantons.length > 0" @click="handleApplyLocation" class="w-full mt-2 py-2 border-2 border-[#202d59] text-[#202d59] rounded-lg text-sm font-medium hover:bg-[#202d59]/5 transition-colors">
            Aplicar solo cantones
          </button>
        </div>

        <!-- Step 3: Districts -->
        <div v-if="locationStep === 'district'">
          <label class="text-xs text-gray-500 mb-2 block">Distritos</label>
          <div class="flex flex-col gap-2 max-h-72 overflow-y-auto">
            <div v-for="group in availableDistrictGroups" :key="group.canton">
              <p class="text-xs font-bold text-gray-500 uppercase px-3 pt-2 pb-1">{{ group.canton }}</p>
              <label
                v-for="district in group.districts"
                :key="district"
                :class="['flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg cursor-pointer transition-colors', filterDistricts.includes(district) ? 'bg-[#00cfe5]/15 text-[#202d59] font-semibold' : 'text-gray-700 hover:bg-gray-100']"
              >
                <input type="checkbox" :checked="filterDistricts.includes(district)" @change="handleToggleDistrict(district)" class="w-4 h-4 rounded border-gray-300 text-[#202d59] focus:ring-[#202d59] cursor-pointer" />
                {{ district }}
              </label>
            </div>
          </div>
          <button
            @click="handleApplyLocation"
            :disabled="filterDistricts.length === 0"
            :class="['w-full mt-3 py-2 rounded-lg text-sm font-medium transition-colors', filterDistricts.length > 0 ? 'bg-[#202d59] text-white hover:bg-[#1a2447]' : 'bg-gray-200 text-gray-400 cursor-not-allowed']"
          >
            Aplicar distritos ({{ filterDistricts.length }})
          </button>
        </div>
      </div>

      <!-- Property Type -->
      <div class="mb-6 pb-6 border-b border-gray-200">
        <h3 class="text-base font-bold text-gray-800 mb-4">Tipo de Propiedad</h3>
        <div class="flex flex-col gap-3">
          <label v-for="type in PROPERTY_TYPES" :key="type" class="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" :checked="selectedPropertyTypes.includes(type)" @change="handlePropertyTypeChange(type)" class="w-4 h-4 cursor-pointer accent-[#202d59]" />
            <span>{{ type }}</span>
          </label>
        </div>
      </div>

      <!-- Price Range -->
      <div class="mb-6 pb-6 border-b border-gray-200">
        <h3 class="text-base font-bold text-gray-800 mb-4">Rango de Precio</h3>
        <div class="space-y-3">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2">
            <div class="flex-1">
              <label class="text-xs text-gray-500 mb-1 block sm:hidden">Minimo</label>
              <input type="number" placeholder="Minimo" :value="priceRange[0]" @input="priceRange[0] = Number(($event.target as HTMLInputElement).value)" class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#202d59]" />
            </div>
            <span class="text-gray-600 font-semibold hidden sm:block">-</span>
            <div class="flex-1">
              <label class="text-xs text-gray-500 mb-1 block sm:hidden">Maximo</label>
              <input type="number" placeholder="Maximo" :value="priceRange[1]" @input="priceRange[1] = Number(($event.target as HTMLInputElement).value)" class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#202d59]" />
            </div>
          </div>
          <div class="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 text-center">
            ${{ (priceRange[0] ?? 0).toLocaleString() }} - ${{ (priceRange[1] ?? 0).toLocaleString() }}
          </div>
        </div>
      </div>

      <!-- Rooms -->
      <div class="mb-6 pb-6 border-b border-gray-200">
        <h3 class="text-base font-bold text-gray-800 mb-4">Habitaciones</h3>
        <div class="grid grid-cols-5 gap-2">
          <button
            v-for="room in ROOMS"
            :key="room"
            @click="selectedRooms = room === selectedRooms ? '' : room"
            :class="['py-3 px-2 text-sm font-semibold rounded-lg border-2 transition-all', selectedRooms === room ? 'bg-[#202d59] text-white border-[#202d59]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#202d59]']"
          >
            {{ room }}
          </button>
        </div>
      </div>

      <!-- Condition -->
      <div class="mb-6 pb-6 border-b border-gray-200">
        <h3 class="text-base font-bold text-gray-800 mb-4">Condicion</h3>
        <div class="flex flex-col gap-3">
          <label v-for="condition in CONDITIONS" :key="condition" class="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" :checked="selectedCondition.includes(condition)" @change="handleConditionChange(condition)" class="w-4 h-4 cursor-pointer accent-[#202d59]" />
            <span>{{ condition }}</span>
          </label>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3 sticky bottom-0 bg-white pt-4 pb-2">
        <button @click="handleApplyFilters" class="w-full py-3.5 bg-[#202d59] text-white rounded-lg text-base font-semibold transition-colors hover:bg-[#a31e22] shadow-md">
          Aplicar Filtros
        </button>
        <button @click="handleClearFilters" class="w-full py-3.5 bg-gray-100 text-gray-700 rounded-lg text-base font-semibold transition-colors hover:bg-gray-200">
          Limpiar Filtros
        </button>
      </div>
    </div>
  </aside>
</template>
