<template>
  <div class="foro-page">

    <div class="foro-layout">

      <!-- ── Feed ───────────────────────────────────────────── -->
      <div class="feed-col">

        <FeedComposer
          :user="user"
          :text="composerText"
          :previews="composerPreviews"
          :can-publish="canPublish"
          :publishing="publishing"
          :expanded="expandComposer"
          @update:text="composerText = $event"
          @add-files="addFiles($event)"
          @remove-file="removeFile($event)"
          @publish="publish"
          @cancel="resetComposer"
          @expand="expandComposer = true"
        />

        <!-- Skeleton -->
        <div v-if="loading" class="feed-inner">
          <div v-for="n in 3" :key="n" class="skeleton-card">
            <div class="skeleton-header">
              <div class="skeleton-avatar" />
              <div class="skeleton-lines">
                <div class="skeleton-line skeleton-line--wide" />
                <div class="skeleton-line skeleton-line--narrow" />
              </div>
            </div>
            <div class="skeleton-body" />
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="loadFeed()">Reintentar</button>
        </div>

        <!-- Empty -->
        <div v-else-if="!posts.length" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
          </svg>
          <p>Aún no hay publicaciones</p>
          <p class="empty-sub">¡Sé el primero en compartir algo!</p>
        </div>

        <!-- Posts -->
        <TransitionGroup v-else name="post-list" tag="div" class="feed-inner">
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :current-user="user"
            @toggle-like="toggleLike(post.id)"
            @toggle-comments="toggleComments(post.id)"
            @share="sharePost(post.id)"
            @delete="deletePost(post.id)"
            @update:new-comment="post.newComment = $event"
            @submit-comment="submitComment(post.id)"
            @load-more-comments="loadMoreComments(post.id)"
            @delete-comment="deleteComment(post.id, $event)"
            @toggle-comment-like="toggleCommentLike(post.id, $event)"
            @click-author="goToProfile($event)"
            @click-post="goToPost($event)"
          />
        </TransitionGroup>

        <!-- Load more -->
        <div v-if="hasMore && !loading" class="load-more-wrap">
          <button class="load-more-btn" :disabled="loadingMore" @click="loadMore">
            <svg v-if="loadingMore" class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ loadingMore ? 'Cargando…' : 'Cargar más' }}
          </button>
        </div>

      </div>

      <!-- ── Sidebar ─────────────────────────────────────────── -->
      <UsersOnlineSidebar class="sidebar-col" />

    </div>

    <!-- Toast -->
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
import { useRouter } from 'vue-router'
import { useFeed } from '~/composables/useFeed'
import { useUser } from '~/composables/useUser'
import FeedComposer from '~/components/feed/FeedComposer.vue'
import PostCard from '~/components/feed/PostCard.vue'
import UsersOnlineSidebar from '~/components/feed/UsersOnlineSidebar.vue'

const router = useRouter()
const { user } = useUser()

const {
  posts, loading, loadingMore, publishing, hasMore, error,
  composerText, composerPreviews, expandComposer, canPublish, shareToast,
  loadFeed, loadMore, addFiles, removeFile, resetComposer, publish,
  deletePost, toggleLike, sharePost, toggleComments,
  loadMoreComments, submitComment, deleteComment, toggleCommentLike,
} = useFeed()

function goToPost(postId: number) {
  router.push(`/forum/${postId}`)
}

function goToProfile(userId: number) {
  router.push(`/asociados/${userId}?id=${userId}`)
}
</script>

<style scoped>
.foro-page {
  min-height: 100vh;
  background: #f0f2f5;
  background-image:
    radial-gradient(ellipse at 20% 0%, rgba(32,45,89,.06) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 100%, rgba(163,30,34,.05) 0%, transparent 60%);
  padding-bottom: 60px;
}

.foro-layout {
  display: flex;
  gap: 16px;
  padding: 16px;
  align-items: flex-start;
  max-width: 1200px;
  margin: 0 auto;
}

.feed-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sidebar-col { display: none; }
@media (min-width: 900px) { .sidebar-col { display: flex; } }

.feed-inner { display: flex; flex-direction: column; gap: 14px; }

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
  height: 120px; border-radius: 10px;
  background: linear-gradient(90deg, #f0f2f5 25%, #e4e6ea 50%, #f0f2f5 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Empty / Error */
.empty-state, .error-state {
  text-align: center; padding: 48px 24px;
  background: #fff; border-radius: 16px; box-shadow: 0 1px 8px rgba(0,0,0,.07);
}
.empty-state svg { color: #d1d5db; margin: 0 auto 12px; display: block; width: 48px; height: 48px; }
.empty-state p { color: #9ca3af; font-size: .9rem; font-weight: 500; }
.empty-sub { font-size: .8rem !important; margin-top: 4px; }
.error-state p { color: #e02424; margin-bottom: 12px; font-size: .9rem; }
.error-state button {
  padding: 8px 20px; border-radius: 8px;
  background: #202d59; color: #fff; border: none; cursor: pointer; font-weight: 600;
}

/* Load more */
.load-more-wrap { display: flex; justify-content: center; padding: 8px 0; }
.load-more-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 28px; border-radius: 20px;
  font-weight: 600; font-size: .875rem; color: #202d59;
  border: 2px solid rgba(32,45,89,.2); background: #fff;
  cursor: pointer; transition: all .2s; font-family: inherit;
}
.load-more-btn:hover:not(:disabled) { border-color: #202d59; background: rgba(32,45,89,.04); }
.load-more-btn:disabled { opacity: .5; cursor: not-allowed; }
.spinner { width: 16px; height: 16px; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

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

.post-list-enter-active { animation: postIn .4s cubic-bezier(.34,1.56,.64,1); }
@keyframes postIn {
  from { opacity: 0; transform: translateY(-20px) scale(.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
</style>