<script setup lang="ts">
import { COSTA_RICA_PROVINCES, getCantonsByProvince, getDistrictsByProvinceCanton } from '~/constants/costaRicaLocations'

const { request } = useApi()
const router = useRouter()

// ── Categories ─────────────────────────────────────────────────────────────

const { categories, loading: loadingCategories, fetchCategories } = useCategories()
const sortedCategories = computed(() => [...categories.value].sort((a, b) => a.name.localeCompare(b.name, 'es')))

onMounted(() => fetchCategories())

// ── Location cascades ──────────────────────────────────────────────────────

const province = ref('')
const canton   = ref('')
const district = ref('')

const cantons   = computed(() => province.value ? getCantonsByProvince(province.value) : [])
const districts = computed(() => (province.value && canton.value) ? getDistrictsByProvinceCanton(province.value, canton.value) : [])

const handleProvinceChange = (val: string) => { province.value = val; canton.value = ''; district.value = '' }
const handleCantonChange   = (val: string) => { canton.value = val; district.value = '' }

// ── Form state ─────────────────────────────────────────────────────────────

const selectedCategoryId = ref<number | null>(null)
const idMode             = ref<1 | 2>(1)

const form = reactive({
  title:              '',
  description:        '',
  details:            '',
  constructionArea:   '' as number | '',   // → sent as dimension
  terrainArea:        '' as number | '',   // optional, appended to dimension
  services:           '',
  amenities:          [] as string[],
  price:              '' as number | '',
  currency:           'USD',
  paymentFrequency:   '',
  addressDescription: '',
  googleMaps:         '',
  latitude:           '',
  longitude:          '',
  zone:               '',
  visibility:         'public' as 'public' | 'private',
})

// ── Google Maps auto-extract lat/lng ───────────────────────────────────────

const extractCoords = (url: string): { lat: string; lng: string } | null => {
  // @lat,lng (most common)
  const at = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (at) return { lat: at[1]!, lng: at[2]! }
  // ?q=lat,lng
  const q = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (q) return { lat: q[1]!, lng: q[2]! }
  // ll=lat,lng
  const ll = url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (ll) return { lat: ll[1]!, lng: ll[2]! }
  return null
}

watch(() => form.googleMaps, (url) => {
  const coords = extractCoords(url)
  if (coords) {
    form.latitude  = coords.lat
    form.longitude = coords.lng
  }
})

// ── Amenities ──────────────────────────────────────────────────────────────

const AMENITIES_LIST = [
  'Piscina', 'Gimnasio', 'Área de juegos', 'Seguridad 24/7', 'Ascensor',
  'Jardín', 'Terraza', 'Balcón', 'Cocina equipada', 'Aire acondicionado',
  'Calentador de agua', 'Lavandería', 'Garaje', 'Bodega',
]

const toggleAmenity = (a: string) => {
  const idx = form.amenities.indexOf(a)
  idx === -1 ? form.amenities.push(a) : form.amenities.splice(idx, 1)
}

// ── Photos ─────────────────────────────────────────────────────────────────

const MAX_PHOTOS    = 20
const photoFiles    = ref<File[]>([])
const photoPreviews = ref<string[]>([])
const fileInput     = ref<HTMLInputElement | null>(null)
const draggedIndex  = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const onFilesSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  const available = MAX_PHOTOS - photoFiles.value.length
  Array.from(input.files).slice(0, available).forEach(file => {
    photoFiles.value.push(file)
    const reader = new FileReader()
    reader.onload = e => photoPreviews.value.push(e.target?.result as string)
    reader.readAsDataURL(file)
  })
  input.value = ''
}

const removePhoto = (i: number) => { photoFiles.value.splice(i, 1); photoPreviews.value.splice(i, 1) }

const handleDragStart = (i: number) => { draggedIndex.value = i }
const handleDragOver  = (i: number, e: DragEvent) => { e.preventDefault(); dragOverIndex.value = i }
const handleDrop      = (to: number) => {
  const from = draggedIndex.value
  if (from === null || from === to) { handleDragEnd(); return }
  const [img] = photoFiles.value.splice(from, 1);    photoFiles.value.splice(to, 0, img!)
  const [prv] = photoPreviews.value.splice(from, 1); photoPreviews.value.splice(to, 0, prv!)
  handleDragEnd()
}
const handleDragEnd = () => { draggedIndex.value = null; dragOverIndex.value = null }

// ── Submit ─────────────────────────────────────────────────────────────────

const submitting  = ref(false)
const submitError = ref<string | null>(null)

const isValid = computed(() =>
  !!form.title && form.price !== '' && selectedCategoryId.value !== null
)

const buildDimension = (): string => {
  const parts: string[] = []
  if (form.constructionArea !== '') parts.push(`Construcción: ${form.constructionArea} m²`)
  if (form.terrainArea !== '')      parts.push(`Terreno: ${form.terrainArea} m²`)
  return parts.join(' / ')
}

const handleSubmit = async () => {
  if (!isValid.value || submitting.value) return
  submitting.value = true
  submitError.value = null

  try {
    const fd = new FormData()
    fd.append('title',              form.title)
    fd.append('description',        form.description)
    fd.append('details',            form.details)
    fd.append('dimension',          buildDimension())
    fd.append('services',           form.services)
    fd.append('amenities',          form.amenities.join(', '))
    fd.append('idMode',             String(idMode.value))
    fd.append('idCategory',         String(selectedCategoryId.value))
    fd.append('price',              String(form.price))
    fd.append('currency',           form.currency)
    if (idMode.value === 2) fd.append('paymentFrequency', form.paymentFrequency)
    fd.append('addressDescription', form.addressDescription)
    if (form.googleMaps)  fd.append('googleMaps', form.googleMaps)
    if (form.latitude)    fd.append('latitude',   form.latitude)
    if (form.longitude)   fd.append('longitude',  form.longitude)
    fd.append('county',    canton.value)
    fd.append('district',  district.value)
    fd.append('zone',      form.zone)
    fd.append('province',  province.value)
    fd.append('visibility', form.visibility)
    photoFiles.value.forEach(file => fd.append('photos', file))

    await request('/PropertyListing/create-property', { method: 'POST', body: fd })
    router.push('/portfolio')
  } catch (err: any) {
    submitError.value = err?.data?.message ?? err?.message ?? 'Error al crear la propiedad.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">

      <!-- Header banner -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="bg-gradient-to-r from-[#202d59] to-[#a31e22] px-8 py-6">
          <NuxtLink
            to="/portfolio"
            class="text-white/80 hover:text-white mb-4 flex items-center gap-2 transition-colors w-fit"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al portafolio
          </NuxtLink>
          <h1 class="text-3xl font-bold text-white">Nueva propiedad</h1>
          <p class="mt-2 text-white/80">Completa la información para publicar tu propiedad</p>
        </div>
      </div>

      <!-- Error -->
      <div v-if="submitError" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <svg class="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-700 text-sm">{{ submitError }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">

        <!-- ── Tipo de propiedad ────────────────────────────────────────── -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-2">Tipo de propiedad <span class="text-red-500">*</span></h2>

          <div v-if="loadingCategories" class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#202d59]"></div>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
            <button
              v-for="cat in sortedCategories"
              :key="cat.id_Category"
              type="button"
              @click="selectedCategoryId = cat.id_Category"
              :class="[
                'bg-white rounded-xl p-4 border-2 transition-all duration-200 group',
                selectedCategoryId === cat.id_Category
                  ? 'border-[#202d59] bg-gradient-to-br from-blue-50 to-red-50 ring-2 ring-[#202d59] ring-offset-2 scale-105'
                  : 'border-gray-200 hover:border-[#202d59] shadow-sm hover:shadow-md'
              ]"
            >
              <div class="flex flex-col items-center text-center gap-2">
                <div :class="[
                  'p-2 rounded-full transition-all duration-200',
                  selectedCategoryId === cat.id_Category
                    ? 'bg-gradient-to-r from-[#202d59] to-[#a31e22] text-white'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-[#202d59]/10 group-hover:text-[#202d59]'
                ]">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span class="text-xs font-semibold text-gray-800 leading-tight">{{ cat.name }}</span>
                <svg v-if="selectedCategoryId === cat.id_Category" class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>

          <!-- Mode -->
          <div>
            <p class="text-sm font-bold text-gray-900 mb-3">Tipo de operación</p>
            <div class="grid grid-cols-2 gap-4 max-w-xs">
              <button type="button" @click="idMode = 1" :class="['p-3 rounded-lg border-2 font-semibold transition-all text-sm', idMode === 1 ? 'border-[#202d59] bg-blue-50 text-[#202d59]' : 'border-gray-300 text-gray-600 hover:border-[#202d59]']">
                En Venta
              </button>
              <button type="button" @click="idMode = 2" :class="['p-3 rounded-lg border-2 font-semibold transition-all text-sm', idMode === 2 ? 'border-[#202d59] bg-blue-50 text-[#202d59]' : 'border-gray-300 text-gray-600 hover:border-[#202d59]']">
                En Alquiler
              </button>
            </div>
          </div>
        </div>

        <!-- ── Información básica ───────────────────────────────────────── -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Información básica</h2>
          <div class="space-y-5">

            <!-- Title -->
            <div>
              <label class="block text-sm font-bold text-gray-900 mb-2">
                Título del anuncio <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                maxlength="120"
                placeholder="Ej. Hermosa casa con jardín en zona residencial"
                class="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:border-transparent transition-all"
              />
              <p class="mt-1 text-xs text-right" :class="form.title.length >= 100 ? 'text-red-500 font-semibold' : 'text-gray-400'">
                {{ form.title.length }}/120
              </p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-bold text-gray-900 mb-2">Descripción</label>
              <textarea
                v-model="form.description"
                rows="4"
                maxlength="1000"
                placeholder="Describe tu propiedad: características, ventajas, estado, etc."
                class="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:border-transparent transition-all resize-none"
              />
              <p class="mt-1 text-xs text-right" :class="form.description.length >= 900 ? 'text-red-500 font-semibold' : 'text-gray-400'">
                {{ form.description.length }}/1000
              </p>
            </div>

            <!-- Details -->
            <div>
              <label class="block text-sm font-bold text-gray-900 mb-2">Detalles adicionales</label>
              <textarea
                v-model="form.details"
                rows="3"
                placeholder="Techo nuevo, cocina remodelada..."
                class="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:border-transparent transition-all resize-none"
              />
            </div>

            <!-- Areas -->
            <div class="grid sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-bold text-gray-900 mb-2">Área de construcción (m²)</label>
                <div class="relative">
                  <input
                    v-model.number="form.constructionArea"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ej. 200"
                    class="block w-full pr-14 pl-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:border-transparent transition-all"
                  />
                  <span class="absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-gray-400 pointer-events-none">m²</span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-900 mb-2">
                  Área del terreno (m²)
                  <span class="text-xs font-normal text-gray-400 ml-1">(opcional)</span>
                </label>
                <div class="relative">
                  <input
                    v-model.number="form.terrainArea"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ej. 500"
                    class="block w-full pr-14 pl-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:border-transparent transition-all"
                  />
                  <span class="absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-gray-400 pointer-events-none">m²</span>
                </div>
              </div>
            </div>

            <!-- Services -->
            <div>
              <label class="block text-sm font-bold text-gray-900 mb-2">Servicios</label>
              <input
                v-model="form.services"
                type="text"
                placeholder="Agua, Luz, Internet..."
                class="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        <!-- ── Amenidades ───────────────────────────────────────────────── -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Amenidades</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              v-for="amenity in AMENITIES_LIST"
              :key="amenity"
              type="button"
              @click="toggleAmenity(amenity)"
              :class="[
                'p-3 rounded-lg border-2 text-sm font-medium transition-all text-left',
                form.amenities.includes(amenity)
                  ? 'border-[#202d59] bg-blue-50 text-[#202d59]'
                  : 'border-gray-300 text-gray-600 hover:border-[#202d59]'
              ]"
            >
              <span class="flex items-center gap-2">
                <svg :class="['w-4 h-4 shrink-0 transition-all', form.amenities.includes(amenity) ? 'text-[#202d59]' : 'text-gray-300']" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ amenity }}
              </span>
            </button>
          </div>
        </div>

        <!-- ── Precio ───────────────────────────────────────────────────── -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Precio</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <!-- Currency -->
            <div>
              <label class="block text-sm font-bold text-gray-900 mb-2">Moneda</label>
              <select
                v-model="form.currency"
                class="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:border-transparent bg-white"
              >
                <option value="USD">USD ($)</option>
                <option value="CRC">CRC (₡)</option>
              </select>
            </div>

            <!-- Price -->
            <div>
              <label class="block text-sm font-bold text-gray-900 mb-2">
                Precio{{ idMode === 2 ? '/mes' : '' }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-400 text-sm">{{ form.currency === 'USD' ? '$' : '₡' }}</span>
                </div>
                <input
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="block w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <!-- Payment frequency — solo si es alquiler -->
            <div v-if="idMode === 2" class="sm:col-span-2">
              <label class="block text-sm font-bold text-gray-900 mb-2">Frecuencia de pago</label>
              <input
                v-model="form.paymentFrequency"
                type="text"
                placeholder="Ej. Mensual, Quincenal, Anual..."
                class="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        <!-- ── Ubicación ────────────────────────────────────────────────── -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Ubicación</h2>
          <div class="space-y-5">

            <!-- Province / Canton / District -->
            <div class="grid sm:grid-cols-3 gap-5">
              <div>
                <label class="block text-sm font-bold text-gray-900 mb-2">Provincia</label>
                <div class="relative">
                  <select
                    :value="province"
                    @change="handleProvinceChange(($event.target as HTMLSelectElement).value)"
                    class="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:border-transparent appearance-none bg-white transition-all"
                  >
                    <option value="">Seleccionar</option>
                    <option v-for="p in COSTA_RICA_PROVINCES" :key="p.name" :value="p.name">{{ p.name }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-900 mb-2">Cantón</label>
                <div class="relative">
                  <select
                    :value="canton"
                    @change="handleCantonChange(($event.target as HTMLSelectElement).value)"
                    :disabled="!province"
                    class="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:border-transparent appearance-none bg-white transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleccionar</option>
                    <option v-for="c in cantons" :key="c" :value="c">{{ c }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-900 mb-2">Distrito</label>
                <div class="relative">
                  <select
                    :value="district"
                    @change="district = ($event.target as HTMLSelectElement).value"
                    :disabled="!canton"
                    class="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:border-transparent appearance-none bg-white transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleccionar</option>
                    <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Address + Zone -->
            <div class="grid sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-bold text-gray-900 mb-2">Dirección exacta</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  </div>
                  <input
                    v-model="form.addressDescription"
                    type="text"
                    placeholder="150m norte del parque central"
                    class="block w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-900 mb-2">Zona</label>
                <input
                  v-model="form.zone"
                  type="text"
                  placeholder="Ej. Centro"
                  class="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <!-- Google Maps (optional) -->
            <div>
              <label class="block text-sm font-bold text-gray-900 mb-1">
                Link Google Maps
                <span class="text-xs font-normal text-gray-400 ml-1">(opcional)</span>
              </label>
              <p class="text-xs text-gray-400 mb-2">Las coordenadas se detectarán automáticamente del link.</p>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                </div>
                <input
                  v-model="form.googleMaps"
                  type="url"
                  placeholder="https://maps.google.com/..."
                  class="block w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:border-transparent transition-all"
                />
                <!-- Coords detected indicator -->
                <div v-if="form.latitude && form.longitude" class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span class="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                    Coords detectadas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Fotografías ──────────────────────────────────────────────── -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-1">Fotografías</h2>
          <p class="text-sm text-gray-500 mb-6">La primera imagen será la principal. Arrastra para reordenar.</p>

          <div
            :class="[
              'border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-4',
              photoFiles.length >= MAX_PHOTOS ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-[#202d59]/50 cursor-pointer'
            ]"
            @click="photoFiles.length < MAX_PHOTOS && fileInput?.click()"
          >
            <input ref="fileInput" type="file" accept="image/*" multiple :disabled="photoFiles.length >= MAX_PHOTOS" class="hidden" @change="onFilesSelected" />
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-600 font-medium mb-1">{{ photoFiles.length >= MAX_PHOTOS ? 'Límite alcanzado' : 'Haz clic para agregar fotos' }}</p>
            <p class="text-sm" :class="photoFiles.length >= MAX_PHOTOS ? 'text-red-400 font-semibold' : 'text-gray-400'">
              {{ photoFiles.length }}/{{ MAX_PHOTOS }} · JPG, PNG, WEBP
            </p>
          </div>

          <div v-if="photoPreviews.length" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            <div
              v-for="(preview, i) in photoPreviews"
              :key="i"
              draggable="true"
              @dragstart="handleDragStart(i)"
              @dragover="handleDragOver(i, $event)"
              @drop="handleDrop(i)"
              @dragend="handleDragEnd"
              :class="[
                'relative group rounded-xl overflow-hidden transition-all duration-200 cursor-grab active:cursor-grabbing select-none',
                draggedIndex === i ? 'opacity-40 scale-95' : 'shadow-md',
                dragOverIndex === i && draggedIndex !== i ? 'ring-2 ring-offset-2 ring-amber-400 scale-105' : i === 0 ? 'ring-2 ring-offset-2 ring-[#202d59]' : ''
              ]"
            >
              <img :src="preview" :alt="`Foto ${i + 1}`" :class="['w-full object-cover rounded-xl', i === 0 ? 'h-40' : 'h-28']" draggable="false" />

              <div v-if="i === 0" class="absolute top-2 left-2 flex items-center gap-1 bg-gradient-to-r from-[#202d59] to-[#a31e22] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
                <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                Principal
              </div>
              <div v-else class="absolute top-2 left-2 w-6 h-6 flex items-center justify-center bg-black/50 text-white text-xs font-bold rounded-full">{{ i + 1 }}</div>

              <div class="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-4 h-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
                </svg>
              </div>

              <button type="button" @click="removePhoto(i)" class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- ── Visibilidad ──────────────────────────────────────────────── -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-2">Visibilidad de la publicación</h2>
          <p class="text-sm text-gray-500 mb-6">Define si la propiedad será visible públicamente.</p>

          <div class="flex items-center gap-4">
            <!-- Toggle pill -->
            <button
              type="button"
              @click="form.visibility = form.visibility === 'public' ? 'private' : 'public'"
              :class="[
                'relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#202d59] focus:ring-offset-2',
                form.visibility === 'public' ? 'bg-[#202d59]' : 'bg-gray-200'
              ]"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                  form.visibility === 'public' ? 'translate-x-8' : 'translate-x-0'
                ]"
              />
            </button>

            <div>
              <p :class="['text-base font-semibold transition-colors', form.visibility === 'public' ? 'text-[#202d59]' : 'text-gray-500']">
                {{ form.visibility === 'public' ? 'Pública' : 'Privada' }}
              </p>
              <p class="text-xs text-gray-400">
                {{ form.visibility === 'public' ? 'Visible para todos los usuarios del portal.' : 'Solo visible para ti y tu equipo.' }}
              </p>
            </div>
          </div>
        </div>

        <!-- ── Action buttons ───────────────────────────────────────────── -->
        <div class="flex justify-between items-center bg-white rounded-xl shadow-md p-6">
          <NuxtLink to="/portfolio" class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all">
            Cancelar
          </NuxtLink>
          <button
            type="submit"
            :disabled="!isValid || submitting"
            :class="[
              'px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2',
              isValid && !submitting
                ? 'bg-gradient-to-r from-[#202d59] to-[#a31e22] text-white hover:from-[#a31e22] hover:to-[#202d59] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            <svg v-if="submitting" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ submitting ? 'Publicando...' : 'Publicar propiedad' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>
