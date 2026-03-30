<!-- components/brokers/AllianceModal.vue -->
<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-5" :style="{ background: colorsPalette.button }">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/40">
            <img v-if="broker.photo" :src="broker.photo" :alt="broker.fullName" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-white font-bold bg-white/20 text-lg">
              {{ initials }}
            </div>
          </div>
          <div>
            <h2 class="text-white font-bold text-lg">Solicitar Alianza</h2>
            <p class="text-blue-200 text-sm">{{ broker.fullName }}</p>
          </div>
        </div>
      </div>

      <div class="p-6 flex flex-col gap-4">
        <!-- Error -->
        <div v-if="error" class="px-4 py-3 rounded-xl text-sm font-medium"
          :style="{ background: '#fef2f2', color: colorsPalette.error }">
          {{ error }}
        </div>

        <!-- Success -->
        <div v-if="success" class="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
          :style="{ background: '#f0fdf4', color: colorsPalette.success }">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          ¡Solicitud enviada exitosamente!
        </div>

        <p v-if="!success" class="text-gray-600 text-sm">
          Envía una solicitud de alianza a <strong>{{ broker.fullName }}</strong>.
          Incluye un mensaje opcional para presentarte.
        </p>

        <textarea
          v-if="!success"
          v-model="message"
          rows="3"
          placeholder="Escribe un mensaje de presentación (opcional)..."
          :disabled="isSending"
          class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 transition disabled:opacity-50"
          :style="{ '--tw-ring-color': colorsPalette.primaryB }"
        />

        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
          >
            {{ success ? 'Cerrar' : 'Cancelar' }}
          </button>
          <button
            v-if="!success"
            @click="sendAlliance"
            :disabled="isSending"
            class="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            :style="{ background: colorsPalette.button }"
          >
            <svg v-if="isSending" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {{ isSending ? 'Enviando...' : 'Enviar Solicitud' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BrokerDto, BrokerDetailDto } from '~/services/user.service'
import { useAllyService } from '~/services/ally.service'
import { colorsPalette } from '~/helpers/colorsPalette'

const props = defineProps<{ broker: BrokerDto | BrokerDetailDto }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'sent', brokerId: number): void
}>()

const service = useAllyService()
const message = ref('')
const isSending = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const initials = computed(() =>
  props.broker.fullName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase(),
)

async function sendAlliance() {
  isSending.value = true
  error.value = null
  try {
    await service.sendRequest(props.broker.id, message.value || undefined)
    success.value = true
    emit('sent', props.broker.id)
  } catch (e: any) {
    const msg = e?.data?.message
    error.value = Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al enviar la solicitud.')
  } finally {
    isSending.value = false
  }
}
</script>