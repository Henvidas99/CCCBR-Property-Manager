<template>
  <div class="foro-page">

    <!-- ── Top sticky composer ───────────────────────────────── -->
    <div class="composer-wrap">
      <div class="composer-card">
        <div class="composer-top">
          <div class="avatar-ring">
            <img src="/avatar.png" alt="Tu foto" class="avatar-img"
              @error="(e) => (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/initials/svg?seed=BR&backgroundColor=202d59'" />
          </div>
          <div class="composer-input-area" @click="expandComposer = true">
            <textarea
              v-model="newPost.text"
              ref="textareaRef"
              :rows="expandComposer ? 4 : 2"
              placeholder="¿Qué propiedad quieres compartir hoy?"
              class="composer-textarea"
              @focus="expandComposer = true"
            />
            <!-- Emoji picker -->
            <Transition name="fade">
              <div v-if="showEmojiPicker" class="emoji-picker-wrap" @click.stop>
                <emoji-picker @emoji-click="onEmojiClick" />
              </div>
            </Transition>
          </div>
        </div>

        <Transition name="slide-down">
          <div v-if="expandComposer" class="composer-actions">
            <div class="composer-tools">
              <button class="tool-btn" @click.stop="showEmojiPicker = !showEmojiPicker" :class="{ active: showEmojiPicker }">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Emoji</span>
              </button>
              <button class="tool-btn" @click="triggerImageUpload">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Fotos</span>
              </button>
              <input ref="fileInput" type="file" multiple accept="image/*" class="hidden" @change="onImagesSelected" />
            </div>

            <!-- Image preview strip -->
            <div v-if="newPost.images.length" class="preview-strip">
              <div v-for="(img, i) in newPost.images" :key="i" class="preview-thumb">
                <img :src="img.url" class="thumb-img" />
                <button class="thumb-remove" @click="removeImage(i)">×</button>
              </div>
            </div>

            <button class="btn-publish" :disabled="!newPost.text && !newPost.images.length" @click="publish">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Publicar
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- ── Feed ──────────────────────────────────────────────── -->
    <div class="feed">
      <TransitionGroup name="post-list" tag="div" class="feed-inner">
        <article v-for="post in posts" :key="post.id" class="post-card">

          <!-- Post header -->
          <div class="post-header">
            <div class="post-avatar-ring">
              <img :src="post.user.avatar" :alt="post.user.name" class="post-avatar" />
            </div>
            <div class="post-meta">
              <div class="post-user-name">{{ post.user.name }}</div>
              <div class="post-user-info">
                <span class="broker-badge">Broker #{{ post.user.brokerNumber }}</span>
                <span class="post-time">· {{ post.timeAgo }}</span>
              </div>
            </div>
            <button class="post-menu-btn">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/>
              </svg>
            </button>
          </div>

          <!-- Post text -->
          <p v-if="post.text" class="post-text">{{ post.text }}</p>

          <!-- Property images grid -->
          <div v-if="post.images?.length" :class="['images-grid', `grid-${Math.min(post.images.length, 4)}`]">
            <div
              v-for="(img, i) in post.images.slice(0, 4)" :key="i"
              class="img-cell"
              :class="{ 'last-overflow': i === 3 && post.images.length > 4 }"
            >
              <img :src="img" :alt="`Propiedad ${i+1}`" class="property-img" />
              <div v-if="i === 3 && post.images.length > 4" class="overflow-overlay">
                +{{ post.images.length - 4 }}
              </div>
            </div>
          </div>

          <!-- Property tag -->
          <div v-if="post.propertyTag" class="property-tag">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {{ post.propertyTag }}
          </div>

          <!-- Stats row -->
          <div class="stats-row">
            <span v-if="post.likes > 0" class="stat-likes">
              <span class="heart-icon-small">❤</span> {{ post.likes }}
            </span>
            <span v-if="post.comments.length > 0" class="stat-text">
              {{ post.comments.length }} comentario{{ post.comments.length !== 1 ? 's' : '' }}
            </span>
          </div>

          <!-- Action bar -->
          <div class="action-bar">
            <button class="action-btn" :class="{ liked: post.liked }" @click="toggleLike(post)">
              <span class="heart-wrap">
                <svg class="heart-icon" :class="{ 'heart-pop': post.justLiked }" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24" :fill="post.liked ? 'currentColor' : 'none'" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <!-- Burst particles -->
                <span v-if="post.justLiked" class="burst">
                  <span v-for="n in 6" :key="n" class="burst-dot" :style="`--i:${n}`" />
                </span>
              </span>
              Me gusta
            </button>

            <button class="action-btn" @click="toggleComments(post)">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Comentar
            </button>

            <button class="action-btn" @click="sharePost(post)">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Compartir
            </button>
          </div>

          <!-- Comments section -->
          <Transition name="slide-down">
            <div v-if="post.showComments" class="comments-section">
              <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                <img :src="comment.user.avatar" class="comment-avatar" />
                <div class="comment-bubble">
                  <span class="comment-user">{{ comment.user.name }}</span>
                  <span class="comment-text">{{ comment.text }}</span>
                </div>
              </div>
              <div class="comment-composer">
                <img src="https://api.dicebear.com/7.x/initials/svg?seed=BR&backgroundColor=202d59" class="comment-avatar" />
                <div class="comment-input-wrap">
                  <input
                    v-model="post.newComment"
                    placeholder="Escribe un comentario…"
                    class="comment-input"
                    @keydown.enter="addComment(post)"
                  />
                  <button class="comment-send" @click="addComment(post)" :disabled="!post.newComment">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </Transition>

        </article>
      </TransitionGroup>
    </div>

    <!-- Share toast -->
    <Transition name="toast">
      <div v-if="shareToast" class="share-toast">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Enlace copiado al portapapeles
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Load emoji-picker-element
onMounted(() => {
  if (!customElements.get('emoji-picker')) {
    import('emoji-picker-element')
  }
  document.addEventListener('click', closePickerOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', closePickerOutside)
})

function closePickerOutside() {
  showEmojiPicker.value = false
}

// ── Composer ──────────────────────────────────────────────
const expandComposer = ref(false)
const showEmojiPicker = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const newPost = ref({
  text: '',
  images: [] as { url: string; file: File }[],
})

function onEmojiClick(e: CustomEvent) {
  newPost.value.text += e.detail.unicode
  showEmojiPicker.value = false
  textareaRef.value?.focus()
}

function triggerImageUpload() {
  fileInput.value?.click()
}

function onImagesSelected(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  Array.from(files).forEach(file => {
    const url = URL.createObjectURL(file)
    newPost.value.images.push({ url, file })
  })
}

function removeImage(i: number) {
  newPost.value.images.splice(i, 1)
}

let postIdCounter = 100

function publish() {
  if (!newPost.value.text && !newPost.value.images.length) return
  const post: Post = {
    id: postIdCounter++,
    user: {
      name: 'Tu nombre',
      brokerNumber: '100001',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BR&backgroundColor=202d59',
    },
    text: newPost.value.text,
    images: newPost.value.images.map(i => i.url),
    propertyTag: newPost.value.images.length ? 'Propiedad en venta' : undefined,
    timeAgo: 'ahora mismo',
    likes: 0,
    liked: false,
    justLiked: false,
    comments: [],
    showComments: false,
    newComment: '',
  }
  posts.value.unshift(post)
  newPost.value = { text: '', images: [] }
  expandComposer.value = false
}

// ── Posts ─────────────────────────────────────────────────
interface Post {
  id: number
  user: { name: string; brokerNumber: string; avatar: string }
  text: string
  images?: string[]
  propertyTag?: string
  timeAgo: string
  likes: number
  liked: boolean
  justLiked: boolean
  comments: { id: number; user: { name: string; avatar: string }; text: string }[]
  showComments: boolean
  newComment: string
}

const posts = ref<Post[]>([
  {
    id: 1,
    user: {
      name: 'María Fernández',
      brokerNumber: '100234',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Maria&backgroundColor=ffd5dc',
    },
    text: '🏡 Hermosa casa en Santa Ana, 3 habitaciones, 2 baños, jardín amplio. Ideal para familia. Precio negociable. ¡No te la pierdas!',
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    ],
    propertyTag: 'Casa en Venta · Santa Ana',
    timeAgo: 'hace 12 min',
    likes: 24,
    liked: false,
    justLiked: false,
    comments: [
      { id: 1, user: { name: 'Carlos R.', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CR&backgroundColor=c7d2fe' }, text: '¿Cuál es el precio de lista?' },
    ],
    showComments: false,
    newComment: '',
  },
  {
    id: 2,
    user: {
      name: 'Roberto Jiménez',
      brokerNumber: '100187',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Roberto&backgroundColor=d1fae5',
    },
    text: '📍 Apartamento moderno en Escazú, piso 8, vista a la montaña. Completamente amueblado. Disponible para arrendamiento inmediato.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    ],
    propertyTag: 'Apartamento en Alquiler · Escazú',
    timeAgo: 'hace 1 h',
    likes: 41,
    liked: false,
    justLiked: false,
    comments: [
      { id: 1, user: { name: 'Ana G.', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AG&backgroundColor=fde68a' }, text: '¡Espectacular la vista! 😍' },
      { id: 2, user: { name: 'Luis M.', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=LM&backgroundColor=bbf7d0' }, text: '¿Incluye parqueo?' },
    ],
    showComments: false,
    newComment: '',
  },
  {
    id: 3,
    user: {
      name: 'Sofía Mora',
      brokerNumber: '100312',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sofia&backgroundColor=e0e7ff',
    },
    text: '🌟 Exclusivo lote en Guanacaste, 500m² frente al mar. Una oportunidad única para invertir en el paraíso. Contacto directo.',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    ],
    propertyTag: 'Lote en Venta · Guanacaste',
    timeAgo: 'hace 3 h',
    likes: 87,
    liked: true,
    justLiked: false,
    comments: [],
    showComments: false,
    newComment: '',
  },
])

// ── Interactions ──────────────────────────────────────────
function toggleLike(post: Post) {
  post.liked = !post.liked
  post.likes += post.liked ? 1 : -1
  if (post.liked) {
    post.justLiked = true
    setTimeout(() => { post.justLiked = false }, 700)
  }
}

function toggleComments(post: Post) {
  post.showComments = !post.showComments
}

let commentId = 200
function addComment(post: Post) {
  if (!post.newComment.trim()) return
  post.comments.push({
    id: commentId++,
    user: {
      name: 'Tu nombre',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BR&backgroundColor=202d59',
    },
    text: post.newComment.trim(),
  })
  post.newComment = ''
}

const shareToast = ref(false)
function sharePost(post: Post) {
  navigator.clipboard?.writeText(`${window.location.origin}/foro/${post.id}`).catch(() => {})
  shareToast.value = true
  setTimeout(() => { shareToast.value = false }, 2500)
}
</script>

<style scoped>

/* ── Base ──────────────────────────────────────────── */
.foro-page {
  min-height: 100vh;
  width: 100%;
  background: #f0f2f5;
  background-image:
    radial-gradient(ellipse at 20% 0%, rgba(32,45,89,0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 100%, rgba(163,30,34,0.05) 0%, transparent 60%);
  padding-bottom: 60px;
}

/* ── Composer ──────────────────────────────────────── */
.composer-wrap {
  top: 0;
  z-index: 30;
  padding: 16px 16px 8px;
  background: linear-gradient(to bottom, #f0f2f5 80%, transparent);
}
.composer-card {;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 16px;
  border: 1px solid rgba(32,45,89,0.08);
}
.composer-top {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
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
.composer-input-area {
  flex: 1;
  position: relative;
}
.composer-textarea {
  width: 100%;
  resize: none;
  border: 1.5px solid #e4e6ea;
  border-radius: 12px;
  padding: 10px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.925rem;
  color: #1c1e21;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #f8f9fb;
  line-height: 1.5;
}
.composer-textarea::placeholder { color: #b0b3b8; }
.composer-textarea:focus {
  border-color: #202d59;
  box-shadow: 0 0 0 3px rgba(32,45,89,0.1);
  background: #fff;
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
.composer-tools {
  display: flex;
  gap: 4px;
  flex: 1;
}
.tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #65676b;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.tool-btn:hover, .tool-btn.active {
  background: rgba(32,45,89,0.07);
  color: #202d59;
}

.preview-strip {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 4px;
}
.preview-thumb {
  position: relative;
  width: 64px; height: 64px;
  border-radius: 8px;
  overflow: hidden;
}
.thumb-img { width: 100%; height: 100%; object-fit: cover; }
.thumb-remove {
  position: absolute;
  top: 2px; right: 2px;
  width: 18px; height: 18px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.btn-publish {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 22px;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 0.875rem;
  color: #fff;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #202d59 0%, #a31e22 100%);
  transition: all 0.25s;
  margin-left: auto;
}
.btn-publish:hover {
  background: linear-gradient(135deg, #a31e22 0%, #202d59 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(163,30,34,0.3);
}
.btn-publish:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

/* ── Emoji picker ──────────────────────────────────── */
.emoji-picker-wrap {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  z-index: 50;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  border-radius: 12px;
  overflow: hidden;
}

/* ── Feed ──────────────────────────────────────────── */
.feed {
  padding: 8px 16px;
}
.feed-inner {
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Post Card ─────────────────────────────────────── */
.post-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 8px rgba(0,0,0,0.07);
  border: 1px solid rgba(0,0,0,0.05);
  transition: box-shadow 0.2s;
}
.post-card:hover {
  box-shadow: 0 4px 20px rgba(32,45,89,0.1);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 10px;
}
.post-avatar-ring {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #202d59, #a31e22);
  padding: 2px;
  flex-shrink: 0;
}
.post-avatar {
  width: 100%; height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
}
.post-meta { flex: 1; }
.post-user-name {
  font-weight: 700;
  font-size: 0.925rem;
  color: #1c1e21;
  font-family: 'Syne', sans-serif;
}
.post-user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}
.broker-badge {
  font-size: 0.7rem;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(32,45,89,0.1), rgba(163,30,34,0.1));
  color: #202d59;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid rgba(32,45,89,0.15);
}
.post-time {
  font-size: 0.72rem;
  color: #b0b3b8;
}
.post-menu-btn {
  color: #b0b3b8;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;
}
.post-menu-btn:hover { background: #f0f2f5; color: #65676b; }

.post-text {
  padding: 0 16px 12px;
  font-size: 0.925rem;
  color: #1c1e21;
  line-height: 1.6;
}

/* ── Images grid ───────────────────────────────────── */
.images-grid {
  display: grid;
  gap: 2px;
  max-height: 420px;
}
.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.grid-3 { grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; }
.grid-3 .img-cell:first-child { grid-column: 1 / -1; }
.grid-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }

.img-cell {
  position: relative;
  overflow: hidden;
  background: #f0f2f5;
  min-height: 180px;
}
.property-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s;
}
.img-cell:hover .property-img { transform: scale(1.03); }

.overflow-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
  font-family: 'Syne', sans-serif;
}

/* ── Property tag ──────────────────────────────────── */
.property-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 10px 16px 4px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #202d59;
  background: rgba(32,45,89,0.07);
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid rgba(32,45,89,0.12);
}

/* ── Stats row ─────────────────────────────────────── */
.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  font-size: 0.8rem;
  color: #65676b;
}
.stat-likes { display: flex; align-items: center; gap: 4px; }
.heart-icon-small { color: #a31e22; font-size: 0.85rem; }
.stat-text { color: #65676b; cursor: pointer; }
.stat-text:hover { text-decoration: underline; }

/* ── Action bar ────────────────────────────────────── */
.action-bar {
  display: flex;
  align-items: center;
  border-top: 1px solid #f0f2f5;
  padding: 2px 8px;
}
.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #65676b;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}
.action-btn:hover { background: #f0f2f5; color: #202d59; }
.action-btn.liked { color: #a31e22; }

/* ── Heart like animation ──────────────────────────── */
.heart-wrap { position: relative; display: inline-flex; align-items: center; }
.heart-icon { width: 20px; height: 20px; transition: transform 0.15s, color 0.2s; }
.liked .heart-icon { color: #a31e22; }
.heart-pop {
  animation: heartPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes heartPop {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.5); }
  60%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.burst {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.burst-dot {
  position: absolute;
  top: 50%; left: 50%;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #a31e22;
  animation: burst 0.6s ease forwards;
  transform-origin: 0 0;
  --angle: calc(var(--i) * 60deg);
  transform: rotate(var(--angle)) translateY(-14px) scale(0);
}
@keyframes burst {
  0%   { transform: rotate(var(--angle)) translateY(0) scale(0); opacity: 1; }
  50%  { transform: rotate(var(--angle)) translateY(-16px) scale(1); opacity: 1; }
  100% { transform: rotate(var(--angle)) translateY(-22px) scale(0); opacity: 0; }
}

/* ── Comments ──────────────────────────────────────── */
.comments-section {
  background: #f8f9fb;
  border-top: 1px solid #f0f2f5;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.comment-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.comment-bubble {
  background: #fff;
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  font-size: 0.85rem;
  line-height: 1.5;
}
.comment-user {
  font-weight: 700;
  color: #1c1e21;
  font-size: 0.78rem;
  display: block;
  margin-bottom: 2px;
}
.comment-text { color: #3e4045; }

.comment-composer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.comment-input-wrap {
  flex: 1;
  position: relative;
}
.comment-input {
  width: 100%;
  padding: 8px 40px 8px 14px;
  border-radius: 20px;
  border: 1.5px solid #e4e6ea;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  outline: none;
  background: #fff;
  transition: border-color 0.2s;
}
.comment-input:focus {
  border-color: #202d59;
  box-shadow: 0 0 0 3px rgba(32,45,89,0.08);
}
.comment-send {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #202d59;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  display: flex; align-items: center;
}
.comment-send:not(:disabled) { opacity: 1; }

/* ── Share toast ───────────────────────────────────── */
.share-toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: #1c1e21;
  color: #fff;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  z-index: 100;
}
.toast-enter-active { animation: toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.toast-leave-active { animation: toastOut 0.25s ease forwards; }
@keyframes toastIn  { from { opacity: 0; transform: translateX(-50%) translateY(20px); } }
@keyframes toastOut { to   { opacity: 0; transform: translateX(-50%) translateY(20px); } }

/* ── Transitions ───────────────────────────────────── */
.slide-down-enter-active { animation: slideDown 0.3s ease; }
.slide-down-leave-active { animation: slideDown 0.2s ease reverse; }
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.post-list-enter-active {
  animation: postIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes postIn {
  from { opacity: 0; transform: translateY(-20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
</style>