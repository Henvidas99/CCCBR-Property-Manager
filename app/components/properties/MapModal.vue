<script setup lang="ts">
import type { ApiActiveAdItem, ApiActiveAdPagedResponse } from '~/types'

interface Props {
  isOpen: boolean
  location: string
  locationLabel?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: []; 'listing-click': [id: number] }>()

const config = useRuntimeConfig()
const { loadMaps, loadMarker, loadGeocoding, loadPlaces } = useGoogleMaps()
const { selectedProvince, selectedCantons, selectedDistricts } = useLocation()

const mapContainer = ref<HTMLElement | null>(null)
const sidebarListRef = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const loadingMessage = ref('Cargando mapa...')
const mapError = ref('')

const allItems = ref<ApiActiveAdItem[]>([])
const selectedItemId = ref<number | null>(null)
const sidebarVisible = ref(true)

const zoneProvince = ref('')
const zoneCantons = ref<string[]>([])
const zoneDistricts = ref<string[]>([])

const CR_CENTER = { lat: 9.93, lng: -84.08 }

const PROVINCE_COORDS: Record<string, { lat: number; lng: number }> = {
  'San José':   { lat: 9.9281,  lng: -84.0907 },
  'Alajuela':   { lat: 10.0162, lng: -84.2149 },
  'Cartago':    { lat: 9.8641,  lng: -83.9197 },
  'Heredia':    { lat: 10.0031, lng: -84.1147 },
  'Guanacaste': { lat: 10.5736, lng: -85.3996 },
  'Puntarenas': { lat: 9.9771,  lng: -84.8296 },
  'Limón':      { lat: 9.9908,  lng: -83.0453 },
}

const COUNTY_COORDS: Record<string, { lat: number; lng: number }> = {
  // San José
  'San José':            { lat: 9.9281,  lng: -84.0907 },
  'Escazú':              { lat: 9.9175,  lng: -84.1414 },
  'Desamparados':        { lat: 9.8978,  lng: -84.0692 },
  'Puriscal':            { lat: 9.8464,  lng: -84.3186 },
  'Tarrazú':             { lat: 9.6764,  lng: -84.0453 },
  'Aserrí':              { lat: 9.8558,  lng: -84.1014 },
  'Mora':                { lat: 9.9008,  lng: -84.2092 },
  'Goicoechea':          { lat: 9.9667,  lng: -84.0333 },
  'Santa Ana':           { lat: 9.9258,  lng: -84.1836 },
  'Alajuelita':          { lat: 9.8867,  lng: -84.1028 },
  'Vázquez de Coronado': { lat: 9.9808,  lng: -83.9961 },
  'Acosta':              { lat: 9.7450,  lng: -84.1750 },
  'Tibás':               { lat: 9.9667,  lng: -84.0667 },
  'Moravia':             { lat: 9.9744,  lng: -84.0394 },
  'Montes de Oca':       { lat: 9.9375,  lng: -84.0511 },
  'Turrubares':          { lat: 9.7625,  lng: -84.3958 },
  'Dota':                { lat: 9.6683,  lng: -83.9719 },
  'Curridabat':          { lat: 9.9239,  lng: -84.0336 },
  'Pérez Zeledón':       { lat: 9.3644,  lng: -83.6933 },
  'León Cortés Castro':  { lat: 9.8000,  lng: -84.0625 },
  // Alajuela
  'Alajuela':    { lat: 10.0162, lng: -84.2149 },
  'San Ramón':   { lat: 10.0889, lng: -84.4747 },
  'Grecia':      { lat: 10.0692, lng: -84.3186 },
  'San Mateo':   { lat: 9.9806,  lng: -84.5158 },
  'Atenas':      { lat: 9.9806,  lng: -84.3811 },
  'Naranjo':     { lat: 10.1028, lng: -84.3914 },
  'Palmares':    { lat: 10.0589, lng: -84.4336 },
  'Poás':        { lat: 10.1114, lng: -84.2703 },
  'Orotina':     { lat: 9.9133,  lng: -84.5219 },
  'San Carlos':  { lat: 10.3381, lng: -84.5131 },
  'Zarcero':     { lat: 10.1897, lng: -84.3900 },
  'Upala':       { lat: 10.8961, lng: -85.0133 },
  'Los Chiles':  { lat: 11.0319, lng: -84.7161 },
  'Guatuso':     { lat: 10.6847, lng: -84.8528 },
  'Río Cuarto':  { lat: 10.5594, lng: -84.2036 },
  // Cartago
  'Cartago':    { lat: 9.8641,  lng: -83.9197 },
  'Paraíso':    { lat: 9.8336,  lng: -83.8761 },
  'La Unión':   { lat: 9.9036,  lng: -83.9897 },
  'Jiménez':    { lat: 9.8125,  lng: -83.7333 },
  'Turrialba':  { lat: 9.9011,  lng: -83.6753 },
  'Alvarado':   { lat: 9.9514,  lng: -83.7950 },
  'Oreamuno':   { lat: 9.9447,  lng: -83.8875 },
  'El Guarco':  { lat: 9.8406,  lng: -83.9969 },
  // Heredia
  'Heredia':       { lat: 10.0031, lng: -84.1147 },
  'Barva':         { lat: 10.0328, lng: -84.1344 },
  'Santo Domingo': { lat: 9.9853,  lng: -84.0917 },
  'Santa Bárbara': { lat: 10.0494, lng: -84.1714 },
  'San Rafael':    { lat: 10.0139, lng: -84.1167 },
  'San Isidro':    { lat: 10.0219, lng: -84.0586 },
  'Belén':         { lat: 9.9825,  lng: -84.1897 },
  'Flores':        { lat: 10.0167, lng: -84.1625 },
  'San Pablo':     { lat: 9.9981,  lng: -84.1003 },
  'Sarapiquí':     { lat: 10.4797, lng: -83.9056 },
  // Guanacaste
  'Liberia':    { lat: 10.6319, lng: -85.4400 },
  'Nicoya':     { lat: 10.1469, lng: -85.4522 },
  'Santa Cruz': { lat: 10.2681, lng: -85.5878 },
  'Bagaces':    { lat: 10.5300, lng: -85.2531 },
  'Carrillo':   { lat: 10.4228, lng: -85.4800 },
  'Cañas':      { lat: 10.4228, lng: -85.1003 },
  'Abangares':  { lat: 10.2250, lng: -84.9833 },
  'Tilarán':    { lat: 10.4736, lng: -84.9758 },
  'Nandayure':  { lat: 10.0194, lng: -85.3464 },
  'La Cruz':    { lat: 11.0603, lng: -85.6244 },
  'Hojancha':   { lat: 10.0778, lng: -85.3986 },
  // Puntarenas
  'Puntarenas':   { lat: 9.9771,  lng: -84.8296 },
  'Esparza':      { lat: 9.9844,  lng: -84.6750 },
  'Buenos Aires': { lat: 9.1639,  lng: -83.3306 },
  'Montes de Oro':{ lat: 10.0556, lng: -84.7361 },
  'Osa':          { lat: 8.9333,  lng: -83.6500 },
  'Quepos':       { lat: 9.4311,  lng: -84.1622 },
  'Golfito':      { lat: 8.6478,  lng: -83.1817 },
  'Coto Brus':    { lat: 8.9381,  lng: -82.9597 },
  'Parrita':      { lat: 9.5200,  lng: -84.3300 },
  'Corredores':   { lat: 8.5569,  lng: -82.8694 },
  'Garabito':     { lat: 9.5758,  lng: -84.6228 },
  // Limón
  'Limón':     { lat: 9.9908,  lng: -83.0453 },
  'Pococí':    { lat: 10.4169, lng: -83.6792 },
  'Siquirres': { lat: 10.0986, lng: -83.5019 },
  'Talamanca': { lat: 9.5614,  lng: -82.8947 },
  'Matina':    { lat: 10.0681, lng: -83.2886 },
  'Guácimo':   { lat: 10.2197, lng: -83.6853 },
}

const getJitter = (id: number, axis: 'lat' | 'lng') => {
  const seed = axis === 'lat' ? id * 9871 : id * 6547
  return ((seed % 400) - 200) / 8000
}

const getPropertyCoords = (item: ApiActiveAdItem) => {
  const base = COUNTY_COORDS[item.county] ?? PROVINCE_COORDS[item.province] ?? CR_CENTER
  return {
    lat: base.lat + getJitter(item.id_Property, 'lat'),
    lng: base.lng + getJitter(item.id_Property, 'lng'),
  }
}

const formatPriceShort = (item: ApiActiveAdItem) => {
  const s = item.currency === 'CRC' ? '₡' : '$'
  if (item.price >= 1_000_000) return `${s}${(item.price / 1_000_000).toFixed(1)}M`
  if (item.price >= 1_000)     return `${s}${(item.price / 1_000).toFixed(0)}K`
  return `${s}${item.price}`
}

const getModeColor = (mode: string) => {
  if (!mode) return '#6b7280'
  const m = mode.toLowerCase()
  if (m.includes('venta'))    return '#00cfe5'
  if (m.includes('alquiler')) return '#f59e0b'
  return '#6b7280'
}

// Sort: zone-matching items first
const sortedItems = computed<ApiActiveAdItem[]>(() => {
  if (!allItems.value.length) return []
  const province  = zoneProvince.value
  const cantons   = zoneCantons.value
  const districts = zoneDistricts.value
  if (!province && !cantons.length && !districts.length) return allItems.value

  const inZone: ApiActiveAdItem[] = []
  const outZone: ApiActiveAdItem[] = []
  for (const item of allItems.value) {
    let matches = false
    if (districts.length > 0)     matches = districts.includes(item.district)
    else if (cantons.length > 0)  matches = cantons.includes(item.county)
    else if (province)            matches = item.province === province
    if (matches) inZone.push(item)
    else outZone.push(item)
  }
  return [...inZone, ...outZone]
})

// Move selected marker to top
const displayedItems = computed<ApiActiveAdItem[]>(() => {
  const items = sortedItems.value
  if (selectedItemId.value === null) return items
  const idx = items.findIndex(i => i.id_Property === selectedItemId.value)
  if (idx <= 0) return items
  const copy = [...items]
  const [selected] = copy.splice(idx, 1)
  if (!selected) return items
  return [selected, ...copy]
})

let mapInstance: any = null
let geocoderInstance: any = null
let placesServiceInstance: any = null
let sessionTokenClass: any = null
let sessionToken: any = null
let searchTimeout: ReturnType<typeof setTimeout> | null = null
let activeInfoWindow: any = null
let dataLayers: any[] = []

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

const PROVINCE_NAMES = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón']

// ── Map header search (Google Places Autocomplete) ────────────────────────────

const internalLocation   = ref(props.location || '')
const showMapSuggestions = ref(false)
const mapSuggestions     = ref<any[]>([])

const onMapLocationInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  const q = internalLocation.value.trim()
  if (!q || q.length < 2) {
    mapSuggestions.value = []
    showMapSuggestions.value = false
    return
  }
  searchTimeout = setTimeout(() => {
    if (!placesServiceInstance) return
    placesServiceInstance.getPlacePredictions(
      { input: q, componentRestrictions: { country: 'cr' }, sessionToken },
      (predictions: any[], status: string) => {
        if (status === 'OK' && predictions?.length) {
          mapSuggestions.value = predictions
          showMapSuggestions.value = true
        } else {
          mapSuggestions.value = []
          showMapSuggestions.value = false
        }
      },
    )
  }, 220)
}

const selectPlacePrediction = async (prediction: any) => {
  internalLocation.value   = prediction.description
  showMapSuggestions.value = false
  mapSuggestions.value     = []

  if (!mapInstance || !geocoderInstance) return

  try {
    const res = await geocoderInstance.geocode({ placeId: prediction.place_id })
    if (res.results?.length > 0) {
      const result = res.results[0]
      const loc    = result.geometry.location
      mapInstance.panTo({ lat: loc.lat(), lng: loc.lng() })

      const types = result.types ?? []
      let zoom = 15
      if      (types.includes('country'))                                          zoom = 7
      else if (types.includes('administrative_area_level_1'))                      zoom = 9
      else if (types.includes('administrative_area_level_2'))                      zoom = 11
      else if (types.includes('administrative_area_level_3'))                      zoom = 12
      else if (types.includes('locality'))                                         zoom = 13
      else if (types.includes('sublocality') || types.includes('neighborhood'))    zoom = 14
      mapInstance.setZoom(zoom)

      let newProvince = ''
      const newCantons: string[] = []
      for (const comp of result.address_components ?? []) {
        if (comp.types.includes('administrative_area_level_1')) newProvince = matchProvince(comp.long_name)
        if (comp.types.includes('administrative_area_level_2')) newCantons.push(comp.long_name)
      }
      zoneProvince.value  = newProvince
      zoneCantons.value   = newCantons
      zoneDistricts.value = []

      dataLayers.forEach(l => l.setMap(null))
      dataLayers = []
      if (newProvince || newCantons.length) drawZoneBoundaries(mapInstance)
    }
  } catch { /* ignore */ }

  if (sessionTokenClass) sessionToken = new sessionTokenClass()
}

const onMapLocationBlur = () => { setTimeout(() => { showMapSuggestions.value = false }, 150) }
const handleMapLocationKey = (e: KeyboardEvent) => { if (e.key === 'Escape') showMapSuggestions.value = false }

// ── Boundary helpers ──────────────────────────────────────────────────────────

const matchProvince = (raw: string): string => {
  const cleaned = raw.replace(/^Provincia\s+de\s+/i, '').trim()
  const norm = normalize(cleaned)
  return PROVINCE_NAMES.find(p => normalize(p) === norm) ?? cleaned
}

const pickBoundary = (results: any[]): any | null => {
  if (!results?.length) return null
  return (
    results.find(r => r.class === 'boundary' && r.type === 'administrative' &&
      (r.geojson?.type === 'Polygon' || r.geojson?.type === 'MultiPolygon')) ??
    results.find(r => r.geojson?.type === 'Polygon' || r.geojson?.type === 'MultiPolygon') ??
    null
  )
}

const drawZoneBoundaries = async (map: any) => {
  const MapsData = (window as any).google?.maps?.Data
  if (!MapsData) return

  const province = zoneProvince.value
  const cantons  = zoneCantons.value

  if (province) {
    try {
      const params = new URLSearchParams({ state: province, country: 'Costa Rica', polygon_geojson: '1', format: 'json', limit: '5', addressdetails: '0' })
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)
      const results: any[] = await resp.json()
      const boundary = pickBoundary(results)
      if (boundary?.geojson) {
        const layer = new MapsData()
        layer.addGeoJson({ type: 'Feature', geometry: boundary.geojson, properties: {} })
        layer.setStyle({ strokeColor: '#202d59', strokeWeight: 2.5, strokeOpacity: 0.85, fillColor: '#202d59', fillOpacity: 0.04, zIndex: 1 })
        layer.setMap(map)
        dataLayers.push(layer)
      }
    } catch { /* ignore */ }
  }

  for (const canton of cantons) {
    try {
      const params = new URLSearchParams({ county: canton, country: 'Costa Rica', polygon_geojson: '1', format: 'json', limit: '5', addressdetails: '0', ...(province ? { state: province } : {}) })
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)
      const results: any[] = await resp.json()
      const boundary = pickBoundary(results)
      if (boundary?.geojson) {
        const layer = new MapsData()
        layer.addGeoJson({ type: 'Feature', geometry: boundary.geojson, properties: {} })
        layer.setStyle({ strokeColor: '#950201', strokeWeight: 2, strokeOpacity: 0.9, fillColor: '#950201', fillOpacity: 0.07, zIndex: 2 })
        layer.setMap(map)
        dataLayers.push(layer)
      }
    } catch { /* ignore */ }
  }
}

// ── Map init ──────────────────────────────────────────────────────────────────

const initMap = async () => {
  isLoading.value = true
  mapError.value  = ''
  allItems.value  = []
  selectedItemId.value = null

  try {
    loadingMessage.value = 'Conectando con Google Maps...'
    const [mapsLib, markerLib, geocodingLib, placesLib] = await Promise.all([
      loadMaps(), loadMarker(), loadGeocoding(), loadPlaces(),
    ])

    if (!mapContainer.value) return

    const { Map, InfoWindow } = mapsLib as any
    const { AdvancedMarkerElement } = markerLib as any
    geocoderInstance      = new (geocodingLib as any).Geocoder()
    placesServiceInstance = new (placesLib as any).AutocompleteService()
    sessionTokenClass     = (placesLib as any).AutocompleteSessionToken
    sessionToken          = new sessionTokenClass()

    let center = CR_CENTER
    let zoom   = 8
    let geocodedProvince = ''
    let geocodedCantons: string[] = []

    if (props.location.trim()) {
      loadingMessage.value = `Buscando "${props.location}"...`
      try {
        const res = await geocoderInstance.geocode({ address: `${props.location}, Costa Rica` })
        if (res.results?.length > 0) {
          const result = res.results[0]
          const loc    = result.geometry.location
          center = { lat: loc.lat(), lng: loc.lng() }

          const resTypes = result.types ?? []
          if      (resTypes.includes('country'))                                          zoom = 7
          else if (resTypes.includes('administrative_area_level_1'))                      zoom = 9
          else if (resTypes.includes('administrative_area_level_2'))                      zoom = 11
          else if (resTypes.includes('administrative_area_level_3'))                      zoom = 12
          else if (resTypes.includes('locality'))                                         zoom = 13
          else if (resTypes.includes('sublocality') || resTypes.includes('neighborhood')) zoom = 14
          else                                                                             zoom = 15

          for (const comp of result.address_components ?? []) {
            if (comp.types.includes('administrative_area_level_1')) geocodedProvince = matchProvince(comp.long_name)
            if (comp.types.includes('administrative_area_level_2')) geocodedCantons.push(comp.long_name)
          }
        }
      } catch { /* fallback to CR center */ }
    }

    const map = new Map(mapContainer.value, {
      center, zoom,
      mapId: 'property-manager-map',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'greedy',
    })
    mapInstance = map

    zoneDistricts.value = selectedDistricts.value.length > 0 ? [...selectedDistricts.value] : []
    zoneCantons.value   = selectedCantons.value.length  > 0 ? [...selectedCantons.value]  : geocodedCantons
    zoneProvince.value  = selectedProvince.value || geocodedProvince

    // NOTE: Update this endpoint when the API changes
    loadingMessage.value = 'Cargando propiedades...'
    const response = await $fetch<ApiActiveAdItem[] | ApiActiveAdPagedResponse>(
      `${config.public.apiBase}/PropertyListing/get-all-properties`
    )
    const items: ApiActiveAdItem[] = Array.isArray(response)
      ? response
      : (response as ApiActiveAdPagedResponse)?.items ?? []

    allItems.value = items

    items.forEach((item: ApiActiveAdItem) => {
      const coords = getPropertyCoords(item)

      const pill = document.createElement('div')
      pill.style.cssText = `
        background: #a31e22; color: white; padding: 5px 10px; border-radius: 20px;
        font-size: 12px; font-weight: 700; cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35); white-space: nowrap;
        border: 2px solid rgba(255,255,255,0.3); transition: transform 0.15s; user-select: none;
      `
      pill.textContent = formatPriceShort(item)
      pill.addEventListener('mouseenter', () => { pill.style.transform = 'scale(1.1)' })
      pill.addEventListener('mouseleave', () => { pill.style.transform = 'scale(1)' })

      const marker = new AdvancedMarkerElement({ map, position: coords, content: pill, title: item.title })

      const photoUrl   = item.photos?.[0]?.url ?? ''
      const imgHtml    = photoUrl ? `<img src="${photoUrl}" style="width:100%;height:100px;object-fit:cover;display:block;" />` : ''
      const modeColor  = getModeColor(item.modeDescription)
      const areaHtml   = item.dimension ? `<p style="margin:0 0 3px;font-size:11px;color:#555;">📐 ${item.dimension} m<sup style="font-size:8px;vertical-align:super;">2</sup></p>` : ''

      const infoContent = `
        <div style="width:220px;font-family:sans-serif;overflow:hidden;cursor:pointer;"
             onclick="window.__mapNavigate(${item.id_Property})">
          ${imgHtml}
          <div style="padding:8px 10px 10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <p style="margin:0;font-size:11px;color:#888;">${item.province}${item.county ? ', ' + item.county : ''}</p>
              ${item.modeDescription ? `<span style="background:${modeColor};color:white;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;flex-shrink:0;margin-left:6px;">${item.modeDescription}</span>` : ''}
            </div>
            <p style="margin:0 0 3px;font-weight:700;font-size:15px;color:#a31e22;">${formatPriceShort(item)}</p>
            ${areaHtml}
            <p style="margin:0 0 6px;font-size:12px;color:#333;line-height:1.35;">
              ${item.title.length > 50 ? item.title.substring(0, 50) + '...' : item.title}
            </p>
            <span style="font-size:11px;color:#202d59;font-weight:600;">Ver propiedad →</span>
          </div>
        </div>
      `

      const logoHeader = document.createElement('img')
      logoHeader.src = '/cccbrlogo.png'
      logoHeader.alt = 'CCCBR'
      logoHeader.style.cssText = 'height:20px;width:auto;object-fit:contain;display:block;'

      const infoWindow = new InfoWindow({ content: infoContent, headerContent: logoHeader, disableAutoPan: false })

      marker.addListener('click', () => {
        if (activeInfoWindow) activeInfoWindow.close()
        infoWindow.open({ anchor: marker, map })
        activeInfoWindow = infoWindow
        selectedItemId.value = item.id_Property
        sidebarVisible.value = true
        nextTick(() => { sidebarListRef.value?.scrollTo({ top: 0, behavior: 'smooth' }) })
      })
    })

    map.addListener('click', () => { if (activeInfoWindow) activeInfoWindow.close() })

    if (zoneProvince.value || zoneCantons.value.length) drawZoneBoundaries(map)

    isLoading.value = false
  } catch (e) {
    console.error('Map init error:', e)
    mapError.value  = 'No se pudo cargar el mapa. Verifica tu conexión.'
    isLoading.value = false
  }
}

// Trigger resize after sidebar animation
watch(sidebarVisible, () => {
  setTimeout(() => {
    if (mapInstance) (window as any).google?.maps?.event?.trigger(mapInstance, 'resize')
  }, 320)
})

// window.__mapNavigate emits an event; the parent handles navigation
if (import.meta.client) {
  (window as any).__mapNavigate = (id: number) => {
    emit('listing-click', id)
    emit('close')
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    internalLocation.value = props.location || ''
    nextTick(() => initMap())
  } else {
    if (searchTimeout) clearTimeout(searchTimeout)
    dataLayers.forEach(l => l.setMap(null))
    dataLayers = []
    mapInstance = geocoderInstance = placesServiceInstance = sessionToken = activeInfoWindow = null
    allItems.value = []
    selectedItemId.value = null
    zoneProvince.value = ''
    zoneCantons.value  = []
    zoneDistricts.value = []
  }
})

const closeModal = () => emit('close')
const handleKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (import.meta.client) delete (window as any).__mapNavigate
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex flex-col bg-black/60"
        @click.self="closeModal"
      >
        <div class="flex flex-col w-full h-full bg-white">
          <!-- Modal header -->
          <div class="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#202d59] to-[#a31e22] flex-shrink-0">
            <svg class="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>

            <!-- Zone search -->
            <div class="relative flex-1 min-w-0">
              <div class="relative flex items-center">
                <svg class="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  v-model="internalLocation"
                  type="text"
                  autocomplete="off"
                  class="w-full py-1.5 pl-9 pr-3 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white shadow-md placeholder:text-gray-400"
                  placeholder="Buscar zona (Ej: Escazú, San José...)"
                  @input="onMapLocationInput"
                  @keydown="handleMapLocationKey"
                  @focus="showMapSuggestions = mapSuggestions.length > 0"
                  @blur="onMapLocationBlur"
                />
              </div>
              <Transition name="suggestions-fade">
                <ul
                  v-if="showMapSuggestions && mapSuggestions.length"
                  class="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden max-h-56 overflow-y-auto"
                >
                  <li
                    v-for="p in mapSuggestions"
                    :key="p.place_id"
                    @mousedown.prevent="selectPlacePrediction(p)"
                    class="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <span class="flex-shrink-0">
                      <svg v-if="p.types?.includes('administrative_area_level_1')" class="w-4 h-4 text-[#202d59]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93V18c0-.55.45-1 1-1s1 .45 1 1v1.93C9.06 19.48 6.52 16.94 6.07 14H8c.55 0 1-.45 1-1s-.45-1-1-1H6.07C6.52 8.06 9.06 5.52 12 5.07V7c0 .55.45 1 1 1s1-.45 1-1V5.07C16.94 5.52 19.48 8.06 19.93 11H18c-.55 0-1 .45-1 1s.45 1 1 1h1.93c-.45 2.94-2.99 5.48-5.93 5.93z"/>
                      </svg>
                      <svg v-else class="w-4 h-4 text-[#950201]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-gray-800 truncate">{{ p.structured_formatting?.main_text ?? p.description }}</p>
                      <p class="text-xs text-gray-400 truncate">{{ p.structured_formatting?.secondary_text ?? '' }}</p>
                    </div>
                  </li>
                </ul>
              </Transition>
            </div>

            <button @click="closeModal" class="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 flex-shrink-0" aria-label="Cerrar mapa">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Map + sidebar -->
          <div class="flex-1 flex overflow-hidden">

            <!-- Map area -->
            <div class="flex-1 relative">
              <button
                v-if="!sidebarVisible"
                @click="sidebarVisible = true"
                class="absolute top-4 right-3 z-20 bg-[#202d59] text-white px-3 py-2 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-[#202d59]/90 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Ver lista
              </button>

              <div v-if="isLoading" class="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center gap-3">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#202d59]"></div>
                <p class="text-gray-600 text-sm">{{ loadingMessage }}</p>
              </div>

              <div v-if="mapError && !isLoading" class="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center gap-3 px-8 text-center">
                <svg class="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-gray-700">{{ mapError }}</p>
                <button @click="initMap" class="px-4 py-2 bg-[#202d59] text-white rounded-lg text-sm">Reintentar</button>
              </div>

              <div ref="mapContainer" class="w-full h-full" />
            </div>

            <!-- Sidebar -->
            <div
              class="flex flex-col border-l border-gray-200 bg-white flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out"
              :class="sidebarVisible ? 'w-64 md:w-72' : 'w-0'"
            >
              <div class="px-3 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0 min-w-0">
                <button @click="sidebarVisible = false" class="mr-2 flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
                <div class="min-w-0 text-right">
                  <p class="text-sm font-bold text-[#202d59] whitespace-nowrap">Propiedades</p>
                  <p class="text-xs text-gray-500 whitespace-nowrap">{{ displayedItems.length }} resultados</p>
                </div>
              </div>

              <div ref="sidebarListRef" class="flex-1 overflow-y-auto">
                <div v-if="isLoading" class="p-3 space-y-3">
                  <div v-for="n in 5" :key="n" class="animate-pulse rounded-lg overflow-hidden border border-gray-100">
                    <div class="h-28 bg-gray-200" />
                    <div class="p-3 space-y-2">
                      <div class="h-3 bg-gray-200 rounded w-full" />
                      <div class="h-3 bg-gray-200 rounded w-3/4" />
                      <div class="h-4 bg-gray-200 rounded w-1/2 mt-1" />
                    </div>
                  </div>
                </div>

                <div v-else-if="displayedItems.length === 0" class="p-6 text-center text-gray-400 flex flex-col items-center gap-2">
                  <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <p class="text-sm">No hay propiedades en esta zona</p>
                </div>

                <div
                  v-for="item in displayedItems"
                  :key="item.id_Property"
                  @click="emit('listing-click', item.id_Property); emit('close')"
                  class="border-b border-gray-100 cursor-pointer transition-all duration-150 border-r-4"
                  :class="selectedItemId === item.id_Property ? 'bg-red-50 border-r-[#a31e22]' : 'hover:bg-gray-50 border-r-transparent'"
                >
                  <div class="relative w-full h-28 overflow-hidden">
                    <img v-if="item.photos?.[0]?.url" :src="item.photos[0].url" :alt="item.title" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full bg-gradient-to-br from-[#202d59] to-[#00cfe5] flex items-center justify-center text-4xl">🏠</div>

                    <span v-if="item.createdDate" class="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-semibold bg-[#202d59]/85 text-white backdrop-blur-sm flex items-center gap-1">
                      <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ new Date(item.createdDate).toLocaleDateString('es-CR') }}
                    </span>

                    <div v-if="selectedItemId === item.id_Property" class="absolute top-2 right-2 w-6 h-6 bg-[#a31e22] rounded-full flex items-center justify-center shadow-md">
                      <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                  </div>

                  <div class="p-3">
                    <p class="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">{{ item.title }}</p>
                    <p class="text-xs text-gray-500 mb-2 truncate">📍 {{ item.province }}{{ item.county ? ', ' + item.county : '' }}</p>
                    <div class="flex items-center justify-between">
                      <p class="text-base font-bold text-[#a31e22]">{{ formatPriceShort(item) }}</p>
                      <span v-if="item.modeDescription" class="text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white" :style="{ background: getModeColor(item.modeDescription) }">
                        {{ item.modeDescription }}
                      </span>
                    </div>
                    <p v-if="item.dimension" class="text-xs text-gray-500 mt-1">📐 {{ item.dimension }} m<sup class="text-[8px]">2</sup></p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.suggestions-fade-enter-active,
.suggestions-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.suggestions-fade-enter-from,
.suggestions-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
