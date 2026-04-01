<template>
  <article class="post-card" @click="emit('click-post', post.id)">

    <!-- Header -->
    <div class="post-header">
      <div class="post-avatar-ring" style="cursor:pointer" @click.stop="emit('click-author', post.author.id)">
        <img
          :src="post.author.photo || authorFallback"
          :alt="post.author.fullName"
          class="post-avatar"
          @error="(e) => ((e.target as HTMLImageElement).src = authorFallback)"
        />
      </div>
      <div class="post-meta">
        <div class="post-user-name" style="cursor:pointer" @click.stop="emit('click-author', post.author.id)">{{ post.author.fullName }}</div>
        <div class="post-user-info">
          <span v-if="post.author.position" class="broker-badge">{{ post.author.position }}</span>
          <span class="post-time">· {{ timeAgo }}</span>
        </div>
      </div>

      <!-- Menu (solo autor) -->
      <div v-if="isAuthor" class="relative" ref="menuRef">
        <button class="post-menu-btn" @click.stop="showMenu = !showMenu">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/>
          </svg>
        </button>
        <Transition name="fade">
          <div v-if="showMenu" class="post-menu-dropdown">
            <button class="menu-item menu-item--danger" @click="handleDelete">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Eliminar publicación
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Content -->
    <p v-if="post.content" class="post-text post-text--clickable" @click="emit('click-post', post.id)">{{ post.content }}</p>

    <!-- Media grid -->
    <div
      v-if="post.media?.length"
      :class="['images-grid', `grid-${Math.min(post.media.length, 4)}`]"
    >
      <div
        v-for="(m, i) in post.media.slice(0, 4)"
        :key="m.id"
        class="img-cell"
        :class="{ 'last-overflow': i === 3 && post.media.length > 4 }"
      >
        <template v-if="isImage(m)">
          <img :src="m.url" :alt="`Media ${i + 1}`" class="property-img" loading="lazy" />
        </template>
        <template v-else>
          <video :src="m.url" class="property-img" controls preload="metadata" />
        </template>
        <div v-if="i === 3 && post.media.length > 4" class="overflow-overlay">
          +{{ post.media.length - 4 }}
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <span v-if="post.likesCount > 0" class="stat-likes">
        <span class="heart-icon-small">❤</span> {{ post.likesCount }}
      </span>
      <span
        v-if="post.commentsCount > 0"
        class="stat-text"
        @click="emit('toggle-comments')"
      >
        {{ post.commentsCount }} comentario{{ post.commentsCount !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Action bar -->
    <div class="action-bar">
      <button
        class="action-btn"
        :class="{ liked: post.likedByMe }"
        @click.stop="emit('toggle-like')"
      >
        <span class="heart-wrap">
          <svg
            class="heart-icon"
            :class="{ 'heart-pop': post.justLiked }"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            :fill="post.likedByMe ? 'currentColor' : 'none'"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          <span v-if="post.justLiked" class="burst">
            <span v-for="n in 6" :key="n" class="burst-dot" :style="`--i:${n}`" />
          </span>
        </span>
        Me gusta
      </button>

      <button class="action-btn" @click.stop="emit('toggle-comments')">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        Comentar
      </button>

      <button class="action-btn" @click.stop="emit('share')">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
        Compartir
      </button>
    </div>

    <!-- Comments section -->
    <Transition name="slide-down">
      <PostComments
        v-if="post.showComments"
        :post-id="post.id"
        :comments="post.loadedComments"
        :has-more="post.commentsHasMore"
        :new-comment="post.newComment"
        :current-user="currentUser"
        @update:new-comment="emit('update:new-comment', $event)"
        @submit="emit('submit-comment')"
        @load-more="emit('load-more-comments')"
        @delete-comment="emit('delete-comment', $event)"
        @toggle-comment-like="emit('toggle-comment-like', $event)"
      />
    </Transition>

  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { FeedPost } from '~/types/feed.types'
import type { UserProfile } from '~/services/user.service'
import PostComments from './PostComments.vue'

const props = defineProps<{
  post: FeedPost
  currentUser: UserProfile | null
}>()

const emit = defineEmits<{
  (e: 'toggle-like'): void
  (e: 'toggle-comments'): void
  (e: 'share'): void
  (e: 'delete'): void
  (e: 'update:new-comment', v: string): void
  (e: 'submit-comment'): void
  (e: 'load-more-comments'): void
  (e: 'delete-comment', commentId: number): void
  (e: 'toggle-comment-like', commentId: number): void
  (e: 'click-author', userId: number): void
  (e: 'click-post', postId: number): void
}>()

const showMenu = ref(false)
const menuRef  = ref<HTMLElement | null>(null)

const isAuthor = computed(() => props.currentUser?.id === props.post.author.id)

const authorFallback = computed(() =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${props.post.author.fullName}&backgroundColor=202d59`,
)

const timeAgo = computed(() => {
  const diff = Date.now() - new Date(props.post.createdAt).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)   return 'ahora mismo'
  if (mins < 60)  return `hace ${mins} min`
  if (hours < 24) return `hace ${hours} h`
  return `hace ${days} d`
})

// Normaliza el mediaType sin importar si llega como 'IMAGE', 'image', 0, etc.
function isImage(m: { mediaType: any; url?: string }): boolean {
  const t = String(m.mediaType).toUpperCase()
  if (t === 'IMAGE' || t === '0') return true
  // Fallback: inferir por extensión de URL si el tipo es ambiguo
  if (t === 'VIDEO' || t === '1') return false
  const url = m.url ?? ''
  return /\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i.test(url)
}

function handleDelete() {
  showMenu.value = false
  emit('delete')
}

function closeMenu(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    showMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', closeMenu))
onUnmounted(() => document.removeEventListener('click', closeMenu))
</script>

<style scoped>
.post-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 8px rgba(0,0,0,.07);
  border: 1px solid rgba(0,0,0,.05);
  transition: box-shadow .2s;
}
.post-card:hover { box-shadow: 0 4px 20px rgba(32,45,89,.1); }

.post-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px 10px; }
.post-avatar-ring {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #202d59, #a31e22);
  padding: 2px;
  flex-shrink: 0;
}
.post-avatar { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid #fff; }
.post-meta { flex: 1; }
.post-user-name { font-weight: 700; font-size: .925rem; color: #1c1e21; }
.post-user-info { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
.broker-badge {
  font-size: .7rem;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(32,45,89,.1), rgba(163,30,34,.1));
  color: #202d59;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid rgba(32,45,89,.15);
}
.post-time { font-size: .72rem; color: #b0b3b8; }
.post-menu-btn {
  color: #b0b3b8; background: none; border: none;
  cursor: pointer; padding: 6px; border-radius: 50%;
  transition: background .2s, color .2s;
}
.post-menu-btn:hover { background: #f0f2f5; color: #65676b; }
.post-menu-dropdown {
  position: absolute;
  right: 0; top: calc(100% + 4px);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,.12);
  border: 1px solid rgba(0,0,0,.08);
  min-width: 200px;
  z-index: 20;
  overflow: hidden;
}
.menu-item {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 12px 16px;
  font-size: .875rem; font-weight: 600;
  border: none; background: none; cursor: pointer;
  transition: background .15s;
}
.menu-item:hover { background: #f8f9fb; }
.menu-item--danger { color: #e02424; }
.menu-item--danger:hover { background: #fef2f2; }

.post-text { padding: 0 16px 12px; font-size: .925rem; color: #1c1e21; line-height: 1.6; }

/* Media grid */
.images-grid { display: grid; gap: 2px; max-height: 420px; }
.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.grid-3 { grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; }
.grid-3 .img-cell:first-child { grid-column: 1 / -1; }
.grid-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
.img-cell { position: relative; overflow: hidden; background: #f0f2f5; min-height: 180px; }
.property-img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.img-cell:hover .property-img { transform: scale(1.03); }
.overflow-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.55);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem; font-weight: 800; color: #fff;
}

/* Stats */
.stats-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px; font-size: .8rem; color: #65676b;
}
.stat-likes { display: flex; align-items: center; gap: 4px; }
.heart-icon-small { color: #a31e22; font-size: .85rem; }
.stat-text { cursor: pointer; }
.stat-text:hover { text-decoration: underline; }

/* Action bar */
.action-bar {
  display: flex; align-items: center;
  border-top: 1px solid #f0f2f5;
  padding: 2px 8px;
}
.action-btn {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 10px 8px;
  font-size: .85rem; font-weight: 600; color: #65676b;
  background: none; border: none; cursor: pointer;
  border-radius: 8px; transition: background .2s, color .2s;
  font-family: inherit;
}
.action-btn:hover { background: #f0f2f5; color: #202d59; }
.action-btn.liked { color: #a31e22; }

/* Heart animation */
.heart-wrap { position: relative; display: inline-flex; align-items: center; }
.heart-icon { width: 20px; height: 20px; transition: transform .15s, color .2s; }
.liked .heart-icon { color: #a31e22; }
.heart-pop { animation: heartPop .6s cubic-bezier(.34,1.56,.64,1) forwards; }
@keyframes heartPop {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.5); }
  60%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}
.burst { position: absolute; inset: 0; pointer-events: none; }
.burst-dot {
  position: absolute; top: 50%; left: 50%;
  width: 5px; height: 5px; border-radius: 50%;
  background: #a31e22;
  animation: burst .6s ease forwards;
  --angle: calc(var(--i) * 60deg);
  transform: rotate(var(--angle)) translateY(-14px) scale(0);
}
@keyframes burst {
  0%   { transform: rotate(var(--angle)) translateY(0) scale(0); opacity: 1; }
  50%  { transform: rotate(var(--angle)) translateY(-16px) scale(1); opacity: 1; }
  100% { transform: rotate(var(--angle)) translateY(-22px) scale(0); opacity: 0; }
}

.post-text--clickable { cursor: pointer; }
.post-text--clickable:hover { color: #202d59; }

/* Transitions */
.slide-down-enter-active { animation: slideDown .3s ease; }
.slide-down-leave-active { animation: slideDown .2s ease reverse; }
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-enter-active, .fade-leave-active { transition: opacity .15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>