<template>
  <div class="detail-page">

    <!-- Back -->
    <button class="back-btn" @click="router.back()">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
      Volver al foro
    </button>

    <!-- Loading -->
    <div v-if="loading" class="skeleton-card">
      <div class="skeleton-header">
        <div class="skeleton-avatar" />
        <div class="skeleton-lines">
          <div class="skeleton-line skeleton-line--wide" />
          <div class="skeleton-line skeleton-line--narrow" />
        </div>
      </div>
      <div class="skeleton-body" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="load">Reintentar</button>
    </div>

    <!-- Post detail -->
    <template v-else-if="post">
      <PostCard
        :post="post"
        :current-user="user"
        @toggle-like="toggleLike"
        @toggle-comments="toggleComments"
        @share="sharePost"
        @delete="handleDelete"
        @update:new-comment="post.newComment = $event"
        @submit-comment="submitComment"
        @load-more-comments="loadMoreComments"
        @delete-comment="deleteComment"
        @toggle-comment-like="toggleCommentLike"
        @load-likers="loadLikers"
      />
    </template>

    <!-- Share toast -->
    <Transition name="toast">
      <div v-if="shareToast" class="share-toast">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        Enlace copiado al portapapeles
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { io, type Socket } from 'socket.io-client'
import { feedService } from '~/services/feed.service'
import { useUser } from '~/composables/useUser'
import PostCard from '~/components/feed/PostCard.vue'
import { FeedEvent } from '~/types/feed.types'
import type {
  FeedPost,
  Post,
  WsPostLiked,
  WsPostCommented,
  WsCommentDeleted,
  WsCommentLiked,
} from '~/types/feed.types'

const router = useRouter()
const route  = useRoute()
const postId = Number(route.params.id)

const { user, fetchUser } = useUser()

// ─── State ───────────────────────────────────────────────────────────────────
const post      = ref<FeedPost | null>(null)
const loading   = ref(false)
const error     = ref<string | null>(null)
const shareToast = ref(false)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toFeedPost(raw: any): FeedPost {
  return {
    ...raw,
    loadedComments:     raw.comments ?? [],
    loadedLikers:       [],
    totalLikers:        raw.likesCount ?? 0,
    commentsNextCursor: null,
    commentsHasMore:    (raw.commentsCount ?? 0) > (raw.comments?.length ?? 0),
    showComments:       true,
    newComment:         '',
    justLiked:          false,
  }
}

// ─── Load ─────────────────────────────────────────────────────────────────────

async function load() {
  loading.value = true
  error.value   = null
  try {
    const raw = await feedService.getPost(postId)
    post.value  = toFeedPost(raw)
    // Si el backend no devuelve comentarios embebidos, los cargamos
    if (post.value.loadedComments.length === 0 && post.value.commentsCount > 0) {
      await loadComments()
    }
  } catch (e: any) {
    error.value = e?.message ?? 'No se pudo cargar la publicación'
  } finally {
    loading.value = false
  }
}

// ─── Like ─────────────────────────────────────────────────────────────────────

async function toggleLike() {
  if (!post.value) return
  const p       = post.value
  const wasLiked = p.likedByMe

  // Optimistic
  p.likedByMe   = !wasLiked
  p.likesCount += wasLiked ? -1 : 1
  if (!wasLiked) {
    p.justLiked = true
    setTimeout(() => { if (post.value) post.value.justLiked = false }, 700)
  }

  try {
    const result  = await feedService.togglePostLike(postId)
    p.likedByMe   = result.liked
    p.likesCount  = result.likesCount
    p.totalLikers = result.likesCount
  } catch {
    // Revert
    p.likedByMe   = wasLiked
    p.likesCount += wasLiked ? 1 : -1
  }
}

// ─── Likers ───────────────────────────────────────────────────────────────────

async function loadLikers() {
  if (!post.value) return
  const page = await feedService.getPostLikers(postId)
  post.value.loadedLikers = page.items
  post.value.totalLikers  = page.total
}

// ─── Comments toggle ──────────────────────────────────────────────────────────

async function toggleComments() {
  if (!post.value) return
  post.value.showComments = !post.value.showComments
  if (post.value.showComments && post.value.loadedComments.length === 0) {
    await loadComments()
  }
}

// ─── Load comments (primera página) ──────────────────────────────────────────

async function loadComments() {
  if (!post.value) return
  const page = await feedService.getComments(postId, { limit: 20 })
  post.value.loadedComments     = page.items
  post.value.commentsNextCursor = page.nextCursor
  post.value.commentsHasMore    = page.hasMore
}

// ─── Load more comments ───────────────────────────────────────────────────────

async function loadMoreComments() {
  const p = post.value
  if (!p || !p.commentsHasMore || p.commentsNextCursor === null) return
  const page = await feedService.getComments(postId, {
    cursor: p.commentsNextCursor,
    limit: 20,
  })
  p.loadedComments.push(...page.items)
  p.commentsNextCursor = page.nextCursor
  p.commentsHasMore    = page.hasMore
}

// ─── Submit comment ───────────────────────────────────────────────────────────

async function submitComment() {
  const p = post.value
  if (!p || !p.newComment.trim()) return
  const content   = p.newComment.trim()
  p.newComment    = ''
  try {
    const comment = await feedService.createComment(postId, content)
    // Si el WS no lo agrega antes, lo añadimos nosotros
    const exists = p.loadedComments.some(c => c.id === comment.id)
    if (!exists) p.loadedComments.push(comment)
    p.commentsCount++
  } catch (e: any) {
    p.newComment = content
    error.value  = e?.message ?? 'Error al comentar'
  }
}

// ─── Delete comment ───────────────────────────────────────────────────────────

async function deleteComment(commentId: number) {
  if (!post.value) return
  await feedService.deleteComment(postId, commentId)
  post.value.loadedComments = post.value.loadedComments.filter(c => c.id !== commentId)
  post.value.commentsCount  = Math.max(0, post.value.commentsCount - 1)
}

// ─── Toggle comment like ──────────────────────────────────────────────────────

async function toggleCommentLike(commentId: number) {
  const comment = post.value?.loadedComments.find(c => c.id === commentId)
  if (!comment) return

  const wasLiked     = comment.likedByMe
  comment.likedByMe  = !wasLiked
  comment.likesCount += wasLiked ? -1 : 1

  try {
    const result       = await feedService.toggleCommentLike(commentId)
    comment.likedByMe  = result.liked
    comment.likesCount = result.likesCount
  } catch {
    comment.likedByMe   = wasLiked
    comment.likesCount += wasLiked ? 1 : -1
  }
}

// ─── Share ────────────────────────────────────────────────────────────────────

async function sharePost() {
  const url = `${window.location.origin}/forum/${postId}`
  await navigator.clipboard?.writeText(url).catch(() => {})
  shareToast.value = true
  setTimeout(() => { shareToast.value = false }, 2500)
}

// ─── Delete post ──────────────────────────────────────────────────────────────

async function handleDelete() {
  await feedService.deletePost(postId)
  router.replace('/forum')
}

// ─── WebSocket ────────────────────────────────────────────────────────────────

let socket: Socket | null = null

function connectSocket() {
  const config  = useRuntimeConfig()
  const baseUrl = (config.public.apiBase as string).replace('/api', '')

  socket = io(`${baseUrl}/feed`, {
    transports: ['websocket'],
    withCredentials: true,
  })

  socket.on(FeedEvent.POST_LIKED, (payload: WsPostLiked) => {
    if (!post.value || payload.postId !== postId) return
    post.value.likesCount = payload.likesCount
    post.value.totalLikers = payload.likesCount
    if (payload.userId === user.value?.id) {
      post.value.likedByMe = payload.liked
    }
  })

  socket.on(FeedEvent.POST_COMMENTED, (payload: WsPostCommented) => {
    if (!post.value || payload.postId !== postId) return
    post.value.commentsCount++
    const exists = post.value.loadedComments.some(c => c.id === payload.comment.id)
    if (!exists) post.value.loadedComments.push(payload.comment)
  })

  socket.on(FeedEvent.COMMENT_DELETED, (payload: WsCommentDeleted) => {
    if (!post.value || payload.postId !== postId) return
    post.value.loadedComments = post.value.loadedComments.filter(c => c.id !== payload.commentId)
    post.value.commentsCount  = Math.max(0, post.value.commentsCount - 1)
  })

  socket.on(FeedEvent.COMMENT_LIKED, (payload: WsCommentLiked) => {
    const comment = post.value?.loadedComments.find(c => c.id === payload.commentId)
    if (!comment) return
    comment.likesCount = payload.likesCount
    if (payload.userId === user.value?.id) {
      comment.likedByMe = payload.liked
    }
  })

  socket.on(FeedEvent.POST_DELETED, ({ postId: deletedId }: { postId: number }) => {
    if (deletedId === postId) router.replace('/forum')
  })
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  await fetchUser()
  await load()
  connectSocket()
})

onUnmounted(() => {
  socket?.disconnect()
  socket = null
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #f0f2f5;
  padding: 16px;
  padding-bottom: 60px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: .875rem;
  font-weight: 600;
  color: #202d59;
  background: #fff;
  border: 1.5px solid rgba(32,45,89,.15);
  border-radius: 10px;
  padding: 8px 16px;
  cursor: pointer;
  width: fit-content;
  transition: all .2s;
  font-family: inherit;
}
.back-btn:hover {
  background: rgba(32,45,89,.05);
  border-color: #202d59;
}

/* Skeleton */
.skeleton-card { background: #fff; border-radius: 16px; padding: 16px; box-shadow: 0 1px 8px rgba(0,0,0,.07); }
.skeleton-header { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
.skeleton-avatar {
  width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(90deg, #f0f2f5 25%, #e4e6ea 50%, #f0f2f5 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}
.skeleton-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.skeleton-line {
  height: 12px; border-radius: 6px;
  background: linear-gradient(90deg, #f0f2f5 25%, #e4e6ea 50%, #f0f2f5 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}
.skeleton-line--wide { width: 60%; }
.skeleton-line--narrow { width: 35%; }
.skeleton-body {
  height: 200px; border-radius: 10px;
  background: linear-gradient(90deg, #f0f2f5 25%, #e4e6ea 50%, #f0f2f5 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Error */
.error-state {
  text-align: center; padding: 48px 24px;
  background: #fff; border-radius: 16px; box-shadow: 0 1px 8px rgba(0,0,0,.07);
}
.error-state p { color: #e02424; margin-bottom: 12px; font-size: .9rem; }
.error-state button {
  padding: 8px 20px; border-radius: 8px;
  background: #202d59; color: #fff; border: none; cursor: pointer; font-weight: 600;
}

/* Toast */
.share-toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  background: #1c1e21; color: #fff; padding: 10px 20px; border-radius: 20px;
  font-size: .85rem; font-weight: 600; display: flex; align-items: center; gap: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,.25); z-index: 100;
}
.toast-enter-active { animation: toastIn .3s cubic-bezier(.34,1.56,.64,1); }
.toast-leave-active { animation: toastOut .25s ease forwards; }
@keyframes toastIn  { from { opacity: 0; transform: translateX(-50%) translateY(20px); } }
@keyframes toastOut { to   { opacity: 0; transform: translateX(-50%) translateY(20px); } }
</style>