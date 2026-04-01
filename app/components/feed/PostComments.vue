<template>
  <div class="comments-section">

    <!-- Comment list -->
    <div v-for="comment in comments" :key="comment.id" class="comment-item">
      <img
        :src="comment.author.photo || fallback(comment.author.fullName)"
        :alt="comment.author.fullName"
        class="comment-avatar"
        @error="(e) => ((e.target as HTMLImageElement).src = fallback(comment.author.fullName))"
      />
      <div class="comment-bubble">
        <span class="comment-user">{{ comment.author.fullName }}</span>
        <span class="comment-text">{{ comment.content }}</span>
        <div class="comment-actions">
          <!-- Like comment -->
          <button
            class="comment-like-btn"
            :class="{ liked: comment.likedByMe }"
            @click="emit('toggle-comment-like', comment.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24"
              :fill="comment.likedByMe ? 'currentColor' : 'none'" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            <span v-if="comment.likesCount > 0">{{ comment.likesCount }}</span>
          </button>

          <!-- Delete (author only) -->
          <button
            v-if="currentUser?.id === comment.author.id"
            class="comment-delete-btn"
            @click="emit('delete-comment', comment.id)"
          >
            Eliminar
          </button>

          <!-- Time -->
          <span class="comment-time">{{ timeAgo(comment.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Load more comments -->
    <button v-if="hasMore" class="load-more-btn" @click="emit('load-more')">
      Ver más comentarios
    </button>

    <!-- Input composer -->
    <div class="comment-composer">
      <img
        :src="currentUser?.photo || fallback(currentUser?.fullName ?? 'U')"
        :alt="currentUser?.fullName"
        class="comment-avatar"
      />
      <div class="comment-input-wrap">
        <input
          :value="newComment"
          placeholder="Escribe un comentario…"
          class="comment-input"
          @input="emit('update:new-comment', ($event.target as HTMLInputElement).value)"
          @keydown.enter.prevent="emit('submit')"
        />
        <button
          class="comment-send"
          :disabled="!newComment.trim()"
          @click="emit('submit')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { Comment } from '~/types/feed.types'
import type { UserProfile } from '~/services/user.service'

defineProps<{
  postId: number
  comments: Comment[]
  hasMore: boolean
  newComment: string
  currentUser: UserProfile | null
}>()

const emit = defineEmits<{
  (e: 'update:new-comment', v: string): void
  (e: 'submit'): void
  (e: 'load-more'): void
  (e: 'delete-comment', commentId: number): void
  (e: 'toggle-comment-like', commentId: number): void
}>()

function fallback(name: string) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=202d59`
}

function timeAgo(dateStr: string) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  if (mins < 1)   return 'ahora'
  if (mins < 60)  return `${mins} min`
  if (hours < 24) return `${hours} h`
  return `${Math.floor(diff / 86_400_000)} d`
}
</script>

<style scoped>
.comments-section {
  background: #f8f9fb;
  border-top: 1px solid #f0f2f5;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.comment-item { display: flex; align-items: flex-start; gap: 8px; }
.comment-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.comment-bubble {
  background: #fff;
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  font-size: .85rem;
  line-height: 1.5;
  flex: 1;
}
.comment-user { font-weight: 700; color: #1c1e21; font-size: .78rem; display: block; margin-bottom: 2px; }
.comment-text { color: #3e4045; }
.comment-actions { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
.comment-like-btn {
  display: flex; align-items: center; gap: 3px;
  font-size: .72rem; font-weight: 600; color: #65676b;
  background: none; border: none; cursor: pointer;
  transition: color .15s;
  font-family: inherit;
}
.comment-like-btn:hover { color: #a31e22; }
.comment-like-btn.liked { color: #a31e22; }
.comment-delete-btn {
  font-size: .72rem; font-weight: 600; color: #e02424;
  background: none; border: none; cursor: pointer;
  font-family: inherit;
  transition: opacity .15s;
}
.comment-delete-btn:hover { opacity: .7; }
.comment-time { font-size: .7rem; color: #b0b3b8; margin-left: auto; }

.load-more-btn {
  align-self: flex-start;
  font-size: .8rem; font-weight: 600; color: #202d59;
  background: none; border: none; cursor: pointer;
  padding: 4px 0;
  font-family: inherit;
  transition: opacity .15s;
}
.load-more-btn:hover { opacity: .7; }

.comment-composer { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.comment-input-wrap { flex: 1; position: relative; }
.comment-input {
  width: 100%;
  padding: 8px 40px 8px 14px;
  border-radius: 20px;
  border: 1.5px solid #e4e6ea;
  font-size: .85rem;
  outline: none;
  background: #fff;
  transition: border-color .2s;
  font-family: inherit;
}
.comment-input:focus {
  border-color: #202d59;
  box-shadow: 0 0 0 3px rgba(32,45,89,.08);
}
.comment-send {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #202d59;
  cursor: pointer; opacity: .4; transition: opacity .2s;
  display: flex; align-items: center;
}
.comment-send:not(:disabled) { opacity: 1; }
</style>