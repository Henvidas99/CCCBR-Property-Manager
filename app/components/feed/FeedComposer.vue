<template>
  <div class="composer-wrap">
    <div class="composer-card">

      <div class="composer-top">
        <!-- Avatar -->
        <div class="avatar-ring">
          <img
            :src="user?.photo || avatarFallback"
            :alt="user?.fullName"
            class="avatar-img"
            @error="(e) => ((e.target as HTMLImageElement).src = avatarFallback)"
          />
        </div>

        <!-- Textarea -->
        <div class="flex-1 relative" @click="emit('expand')">
          <textarea
            v-model="text"
            ref="textareaRef"
            :rows="expanded ? 4 : 2"
            placeholder="¿Qué propiedad quieres compartir hoy?"
            class="composer-textarea"
            @focus="emit('expand')"
            @input="emit('update:text', ($event.target as HTMLTextAreaElement).value)"
          />

          <!-- Emoji picker -->
          <Transition name="fade">
            <div v-if="showEmoji" class="emoji-picker-wrap" @click.stop>
              <emoji-picker @emoji-click="onEmojiClick" />
            </div>
          </Transition>
        </div>
      </div>

      <!-- Expanded actions -->
      <Transition name="slide-down">
        <div v-if="expanded" class="composer-actions">
          <div class="composer-tools">
            <button
              class="tool-btn"
              :class="{ active: showEmoji }"
              @click.stop="showEmoji = !showEmoji"
            >
              <IconEmoji class="w-5 h-5" />
              <span>Emoji</span>
            </button>
            <button class="tool-btn" @click="fileInputRef?.click()">
              <IconPhoto class="w-5 h-5" />
              <span>Fotos</span>
            </button>
            <input
              ref="fileInputRef"
              type="file"
              multiple
              accept="image/*,video/*"
              class="hidden"
              @change="onFilesSelected"
            />
          </div>

          <!-- Preview strip -->
          <div v-if="previews.length" class="preview-strip">
            <div v-for="(url, i) in previews" :key="i" class="preview-thumb">
              <img :src="url" class="thumb-img" />
              <button class="thumb-remove" @click="emit('remove-file', i)">×</button>
            </div>
          </div>

          <div class="flex gap-2 ml-auto">
            <button class="btn-cancel" @click="emit('cancel')">Cancelar</button>
            <button
              class="btn-publish"
              :disabled="!canPublish || publishing"
              @click="emit('publish')"
            >
              <IconSend class="w-4 h-4" />
              {{ publishing ? 'Publicando…' : 'Publicar' }}
            </button>
          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { UserProfile } from '~/services/user.service'

// ─── Inline icon components (no deps) ────────────────────────────────────────
const IconEmoji = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>`,
}
const IconPhoto = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>`,
}
const IconSend = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
  </svg>`,
}

// ─── Props / emits ────────────────────────────────────────────────────────────
const props = defineProps<{
  user: UserProfile | null
  text: string
  previews: string[]
  canPublish: boolean
  publishing: boolean
  expanded: boolean
}>()

const emit = defineEmits<{
  (e: 'update:text', v: string): void
  (e: 'add-files', files: File[]): void
  (e: 'remove-file', index: number): void
  (e: 'publish'): void
  (e: 'cancel'): void
  (e: 'expand'): void
}>()

// ─── Local ────────────────────────────────────────────────────────────────────
const text         = computed({
  get: () => props.text,
  set: (v) => emit('update:text', v),
})
const textareaRef  = ref<HTMLTextAreaElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const showEmoji    = ref(false)

const avatarFallback = computed(() =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${props.user?.fullName ?? 'U'}&backgroundColor=202d59`,
)

function onEmojiClick(e: CustomEvent) {
  emit('update:text', props.text + e.detail.unicode)
  showEmoji.value = false
  textareaRef.value?.focus()
}

function onFilesSelected(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) emit('add-files', Array.from(files))
}

function closeEmoji() { showEmoji.value = false }

onMounted(() => {
  if (!customElements.get('emoji-picker')) import('emoji-picker-element')
  document.addEventListener('click', closeEmoji)
})
onUnmounted(() => document.removeEventListener('click', closeEmoji))
</script>

<script lang="ts">
import { computed } from 'vue'
</script>

<style scoped>
.composer-wrap {
  z-index: 30;
  padding: 16px 16px 8px;
  background: linear-gradient(to bottom, #f0f2f5 80%, transparent);
}
.composer-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 16px;
  border: 1px solid rgba(32,45,89,0.08);
}
.composer-top { display: flex; gap: 12px; align-items: flex-start; }
.avatar-ring {
  flex-shrink: 0;
  width: 42px; height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #202d59, #a31e22);
  padding: 2px;
}
.avatar-img {
  width: 100%; height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
}
.composer-textarea {
  width: 100%;
  resize: none;
  border: 1.5px solid #e4e6ea;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.925rem;
  color: #1c1e21;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
  background: #f8f9fb;
  line-height: 1.5;
  font-family: inherit;
}
.composer-textarea::placeholder { color: #b0b3b8; }
.composer-textarea:focus {
  border-color: #202d59;
  box-shadow: 0 0 0 3px rgba(32,45,89,.1);
  background: #fff;
}
.emoji-picker-wrap {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  z-index: 50;
  box-shadow: 0 8px 30px rgba(0,0,0,.15);
  border-radius: 12px;
  overflow: hidden;
}
.composer-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f2f5;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.composer-tools { display: flex; gap: 4px; flex: 1; }
.tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: .8rem;
  font-weight: 600;
  color: #65676b;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all .2s;
}
.tool-btn:hover, .tool-btn.active { background: rgba(32,45,89,.07); color: #202d59; }
.preview-strip { display: flex; gap: 8px; flex-wrap: wrap; width: 100%; margin-top: 4px; }
.preview-thumb { position: relative; width: 64px; height: 64px; border-radius: 8px; overflow: hidden; }
.thumb-img { width: 100%; height: 100%; object-fit: cover; }
.thumb-remove {
  position: absolute;
  top: 2px; right: 2px;
  width: 18px; height: 18px;
  background: rgba(0,0,0,.6);
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 13px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.btn-cancel {
  padding: 9px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: .875rem;
  color: #65676b;
  border: 1.5px solid #e4e6ea;
  background: transparent;
  cursor: pointer;
  transition: all .2s;
}
.btn-cancel:hover { background: #f0f2f5; }
.btn-publish {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 22px;
  border-radius: 10px;
  font-weight: 700;
  font-size: .875rem;
  color: #fff;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #202d59 0%, #a31e22 100%);
  transition: all .25s;
}
.btn-publish:hover {
  background: linear-gradient(135deg, #a31e22 0%, #202d59 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(163,30,34,.3);
}
.btn-publish:disabled { opacity: .4; cursor: not-allowed; transform: none; }

/* Transitions */
.slide-down-enter-active { animation: slideDown .3s ease; }
.slide-down-leave-active { animation: slideDown .2s ease reverse; }
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>