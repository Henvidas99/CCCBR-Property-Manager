<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center min-h-[60vh]">
      <div class="flex flex-col items-center gap-3">
        <div class="w-10 h-10 rounded-full border-4 border-[#202d59] border-t-transparent animate-spin" />
        <p class="text-gray-500 text-sm">Cargando perfil...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p class="text-red-500">{{ error }}</p>
      <NuxtLink to="/asociados" class="text-sm text-[#202d59] underline">← Volver a asociados</NuxtLink>
    </div>

    <template v-else-if="broker">
      <!-- Cover Photo -->
      <div class="relative h-52 md:h-72 bg-[#202d59] overflow-hidden">
        <img v-if="broker.photo" :src="broker.photo" alt="Foto de portada"
          class="w-full h-full object-cover opacity-20 blur-sm scale-110" />
        <div class="absolute inset-0" style="background: linear-gradient(135deg, #202d59ee 0%, #a31e22aa 100%)" />
        <!-- Decorative shapes -->
        <div class="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-[#a31e22] opacity-10" />
        <div class="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-[#00cfe5] opacity-10" />
        <!-- Back button -->
        <div class="absolute top-4 left-4">
          <NuxtLink to="/asociados" class="flex items-center gap-2 text-white/80 hover:text-white text-sm transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Asociados
          </NuxtLink>
        </div>
        <div class="absolute top-4 right-4">
          <span class="text-white/40 text-xs italic">Foto de portada — próximamente</span>
        </div>
      </div>

      <!-- Profile Header Card -->
      <div class="max-w-5xl mx-auto px-4">
        <div class="relative bg-white rounded-2xl shadow-md -mt-16 z-10 px-6 pt-6 pb-5">
          <div class="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
            <!-- Avatar -->
            <div class="relative -mt-16 sm:-mt-20 flex-shrink-0">
              <div class="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl">
                <img v-if="broker.photo" :src="broker.photo" :alt="broker.fullName"
                  class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
                  style="background: linear-gradient(135deg, #202d59 0%, #a31e22 100%)">
                  {{ initials }}
                </div>
              </div>
            </div>

            <!-- Name + code + actions -->
            <div class="flex-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <span class="px-3 py-0.5 rounded-full text-xs font-bold tracking-widest uppercase text-white"
                    style="background: #202d59">
                    {{ broker.roleCodeName }}
                  </span>
                </div>
                <h1 class="text-2xl font-bold text-gray-900" style="font-family: Georgia, serif;">
                  {{ broker.fullName }}
                </h1>
                <p class="text-gray-500 text-sm mt-0.5">{{ broker.position || 'Corredor de Bienes Raíces' }}</p>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-2">
                <button @click="callBroker"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Llamar
                </button>
                <button @click="whatsappContact"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </button>
                <button @click="shareProfile"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Compartir
                </button>
                <button @click="copyLink"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {{ copySuccess ? '¡Copiado!' : 'Copiar enlace' }}
                </button>
                <button @click="showAllianceModal = true"
                  class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition"
                  style="background: linear-gradient(45deg, #a31e22 0%, #202d59 100%)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Enviar Alianza
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">

        <!-- LEFT COLUMN: Info + Contact -->
        <div class="lg:col-span-1 flex flex-col gap-5">

          <!-- Info Card -->
          <div class="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-[#202d59]">
            <h2 class="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <span class="w-1 h-4 rounded-full bg-[#202d59] inline-block" />
              Información
            </h2>
            <ul class="flex flex-col gap-3 text-sm">
              <li class="flex justify-between gap-2">
                <span class="text-gray-400">Correo</span>
                <span class="text-gray-700 font-medium text-right break-all">{{ broker.email }}</span>
              </li>
              <li class="flex justify-between gap-2">
                <span class="text-gray-400">Teléfono</span>
                <span class="text-gray-700 font-medium">{{ broker.phoneNumber || '—' }}</span>
              </li>
              <li class="flex justify-between gap-2">
                <span class="text-gray-400">Cédula</span>
                <span class="text-gray-700 font-medium">{{ broker.idNumber || '—' }}</span>
              </li>
              <li class="flex justify-between gap-2">
                <span class="text-gray-400">Género</span>
                <span class="text-gray-700 font-medium">{{ genderLabel }}</span>
              </li>
              <li class="flex justify-between gap-2">
                <span class="text-gray-400">Fecha de nacimiento</span>
                <span class="text-gray-700 font-medium">{{ formatDate(broker.dateOfBirth) }}</span>
              </li>
              <li class="flex justify-between gap-2">
                <span class="text-gray-400">Miembro desde</span>
                <span class="text-gray-700 font-medium">{{ formatDate(broker.createdDate) }}</span>
              </li>
              <li v-if="broker.lastSeenAt" class="flex justify-between gap-2">
                <span class="text-gray-400">Última actividad</span>
                <span class="text-gray-700 font-medium">{{ broker.lastSeenAt }}</span>
              </li>
            </ul>
          </div>

          <!-- Aliados Section -->
          <div class="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-[#00cfe5]">
            <h2 class="font-bold text-gray-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1 h-4 rounded-full bg-[#00cfe5] inline-block" />
              Aliados
              <span class="ml-1 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-[#00cfe5]">
                {{ alliesByUserId.length }}
              </span>
            </h2>

            <!-- Loading -->
            <div v-if="alliesLoading" class="flex justify-center py-4">
              <div class="w-6 h-6 rounded-full border-2 border-[#00cfe5] border-t-transparent animate-spin" />
            </div>

            <!-- Empty -->
            <div v-else-if="alliesByUserId.length === 0" class="py-6 text-center text-gray-400 text-xs">
              Este asociado no tiene aliados registrados.
            </div>

            <!-- List -->
            <ul v-else class="flex flex-col gap-2">
              <li v-for="ally in alliesByUserId" :key="ally.id"
                class="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                @click="router.push(`/asociados/perfil?id=${ally.id}`)">
                <!-- Avatar -->
                <div class="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow">
                  <img v-if="ally.photo" :src="ally.photo" :alt="ally.fullName" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                    style="background: linear-gradient(135deg, #202d59 0%, #a31e22 100%)">
                    {{ ally.fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() }}
                    </div>
                </div>

                <!-- Info -->
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-gray-700 truncate">{{ ally.fullName }}</p>
                  <p class="text-xs text-gray-400 truncate">{{ ally.roleCodeName }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- RIGHT COLUMN: Properties -->
        <div class="lg:col-span-2 flex flex-col gap-5">
          <div class="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-[#a31e22]">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-bold text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <span class="w-1 h-4 rounded-full bg-[#a31e22] inline-block" />
                Propiedades
                <span class="ml-1 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-[#a31e22]">
                  {{ broker.properties?.length || 0 }}
                </span>
              </h2>
            </div>

            <!-- No properties -->
            <div v-if="!broker.properties || broker.properties.length === 0"
              class="py-10 text-center text-gray-400 text-sm">
              Este asociado no tiene propiedades registradas.
            </div>

            <!-- Properties Grid -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="prop in broker.properties" @click="goToPropertyDetail(prop.id_Property)"
                :key="prop.id_Property"
                class="group rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer">
                <!-- Property Image -->
                <div class="relative h-36 bg-gray-100 overflow-hidden">
                  <img v-if="prop.photos && prop.photos.length > 0" :src="prop.photos[0]" :alt="prop.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <!-- Mode badge -->
                  <div class="absolute top-2 left-2">
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                      style="background: rgba(32,45,89,0.85)">
                      {{ prop.modeDescription }}
                    </span>
                  </div>
                </div>

                <!-- Property Info -->
                <div class="p-3">
                  <p class="font-semibold text-gray-800 text-sm truncate group-hover:text-[#202d59] transition">{{
                    prop.title }}</p>
                  <p class="text-xs text-gray-400 mt-0.5 truncate">
                    {{ [prop.district, prop.county, prop.province].filter(Boolean).join(', ') }}
                  </p>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-[#a31e22] font-bold text-sm">
                      {{ prop.currency }} {{ formatPrice(prop.price) }}
                    </span>
                    <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {{ prop.categoryName }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Alliance Modal -->
    <AllianceModal v-if="showAllianceModal && broker" :broker="broker" @close="showAllianceModal = false" />

    <!-- Copy toast -->
    <Transition name="toast">
      <div v-if="copySuccess"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50">
        ✓ Enlace copiado al portapapeles
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AllianceModal from '~/components/brokers/AllianceModal.vue'
import { useBrokerDetail } from '~/composables/useBrokers'
import { formatLastSeenAt } from '~/helpers/global.helpers'
import { useAllies } from '~/composables/useAllies'

const route = useRoute()
const router = useRouter()
const { broker, isLoading, error, fetchBroker } = useBrokerDetail()
const { fetchAlliesByUserId, alliesByUserId, alliesLoading } = useAllies()
const showAllianceModal = ref(false)
const copySuccess = ref(false)

const mockAllies = [
  { name: 'Carlos Mendoza', code: 'COR-042', initials: 'CM' },
  { name: 'Valeria Arias', code: 'COR-017', initials: 'VA' },
  { name: 'Roberto Lima', code: 'COR-089', initials: 'RL' },
]

const initials = computed(() =>
  broker.value?.fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? ''
)

const genderLabel = computed(() => {
  const g = broker.value?.gender?.toLowerCase()
  if (g === 'm' || g === 'male' || g === 'masculino') return 'Hombre'
  if (g === 'f' || g === 'female' || g === 'femenino') return 'Mujer'
  return broker.value?.gender || '—'
})

function formatDate(val: Date | string | undefined | null): string {
  if (!val) return '—'
  const d = new Date(val)
  return d.toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatPrice(price: number): string {
  return price.toLocaleString('es-CR')
}

function callBroker() {
  if (broker.value?.phoneNumber) {
    window.location.href = `tel:${broker.value.phoneNumber}`
  }
}

function whatsappContact() {
  if (broker.value?.phoneNumber) {
    const phone = broker.value.phoneNumber.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=Hola ${broker.value.fullName}, te contacto a través del directorio de asociados.`, '_blank')
  }
}

function shareProfile() {
  if (broker.value?.phoneNumber) {
    const url = window.location.href
    const text = `Mira el perfil de ${broker.value.fullName} (${broker.value.roleCodeName}): ${url}`
    const phone = broker.value.phoneNumber.replace(/\D/g, '')
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copySuccess.value = true
    setTimeout(() => { copySuccess.value = false }, 2500)
  } catch {
    // fallback
  }
}

function goToPropertyDetail(propId: number) {
  router.push(`/explorer/${propId}`)
}

onMounted(() => {
  const id = Number(route.query.id)
  if (id) fetchBroker(id)
})

onMounted(async () => {
  const id = Number(route.query.id)
  if (id) {
    await fetchBroker(id)
    await fetchAlliesByUserId(id)
  }
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>