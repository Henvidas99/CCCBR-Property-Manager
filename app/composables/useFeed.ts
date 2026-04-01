import { ref, computed, onMounted, onUnmounted } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { feedService } from '~/services/feed.service'
import { useUser } from '~/composables/useUser'
import { FeedEvent } from '~/types/feed.types'
import type {
  FeedPost,
  Post,
  Comment,
  WsPostLiked,
  WsPostCommented,
  WsCommentDeleted,
  WsCommentLiked,
  FeedQuery,
} from '~/types/feed.types'

// ─── Helper: convierte Post → FeedPost ───────────────────────────────────────
function toFeedPost(post: Post): FeedPost {
  return {
    ...post,
    loadedComments: [],
    totalLikers: post.likesCount,
    loadedLikers: [],
    commentsNextCursor: null,
    commentsHasMore: true,
    showComments: false,
    newComment: '',
    justLiked: false,
  }
}

export function useFeed() {
  const { user, fetchUser } = useUser()

  // ─── State ──────────────────────────────────────────────────────────────
  const posts        = ref<FeedPost[]>([])
  const loading      = ref(false)
  const loadingMore  = ref(false)
  const publishing   = ref(false)
  const nextCursor   = ref<number | null>(null)
  const hasMore      = ref(true)
  const error        = ref<string | null>(null)

  // Composer
  const composerText   = ref('')
  const composerFiles  = ref<File[]>([])
  const composerPreviews = ref<string[]>([])
  const expandComposer = ref(false)

  // Share toast
  const shareToast = ref(false)

  // Socket
  let socket: Socket | null = null

  // ─── Computed ───────────────────────────────────────────────────────────
  const canPublish = computed(
    () => composerText.value.trim().length > 0 || composerFiles.value.length > 0,
  )

  // ─── Feed HTTP ──────────────────────────────────────────────────────────

  async function loadFeed(query: FeedQuery = {}) {
    loading.value = true
    error.value   = null
    try {
      const page = await feedService.getFeed({ limit: 20, ...query })
      posts.value  = page.items.map(toFeedPost)
      nextCursor.value = page.nextCursor
      hasMore.value    = page.hasMore
    } catch (e: any) {
      error.value = e?.message ?? 'Error cargando el feed'
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || loadingMore.value || nextCursor.value === null) return
    loadingMore.value = true
    try {
      const page = await feedService.getFeed({ cursor: nextCursor.value, limit: 20 })
      posts.value.push(...page.items.map(toFeedPost))
      nextCursor.value = page.nextCursor
      hasMore.value    = page.hasMore
    } finally {
      loadingMore.value = false
    }
  }

  // ─── Composer ───────────────────────────────────────────────────────────

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files)
    arr.forEach(f => {
      composerFiles.value.push(f)
      composerPreviews.value.push(URL.createObjectURL(f))
    })
  }

  function removeFile(index: number) {
    const url = composerPreviews.value[index]
    if (url) URL.revokeObjectURL(url)
    composerFiles.value.splice(index, 1)
    composerPreviews.value.splice(index, 1)
  }

  function resetComposer() {
    composerPreviews.value.forEach(url => URL.revokeObjectURL(url))
    composerText.value     = ''
    composerFiles.value    = []
    composerPreviews.value = []
    expandComposer.value   = false
  }

  async function publish() {
    if (!canPublish.value || publishing.value) return
    publishing.value = true
    try {
      const post = await feedService.createPost(
        composerText.value.trim(),
        composerFiles.value,
      )
      const exists = posts.value.some(p => p.id === post.id)
      if (!exists) posts.value.unshift(toFeedPost(post))
      resetComposer()
    } catch (e: any) {
      error.value = e?.message ?? 'Error publicando'
    } finally {
      publishing.value = false
    }
  }

  // ─── Post actions ────────────────────────────────────────────────────────

  async function deletePost(postId: number) {
    await feedService.deletePost(postId)
    posts.value = posts.value.filter(p => p.id !== postId)
  }

  async function toggleLike(postId: number) {
    const post = posts.value.find(p => p.id === postId)
    if (!post) return

    const wasLiked    = post.likedByMe
    post.likedByMe    = !wasLiked
    post.likesCount  += wasLiked ? -1 : 1
    if (!wasLiked) {
      post.justLiked = true
      setTimeout(() => { post.justLiked = false }, 700)
    }

    try {
      const result = await feedService.togglePostLike(postId)
      // Sync con la respuesta real
      post.likedByMe  = result.liked
      post.likesCount = result.likesCount
    } catch {
      // Revert on error
      post.likedByMe   = wasLiked
      post.likesCount += wasLiked ? 1 : -1
    }
  }

  // ─── Comments ────────────────────────────────────────────────────────────

  async function toggleComments(postId: number) {
    const post = posts.value.find(p => p.id === postId)
    if (!post) return
    post.showComments = !post.showComments
    if (post.showComments && post.loadedComments.length === 0) {
      await loadComments(postId)
    }
  }

  async function loadComments(postId: number) {
    const post = posts.value.find(p => p.id === postId)
    if (!post) return
    const page = await feedService.getComments(postId, { limit: 20 })
    post.loadedComments      = page.items
    post.commentsNextCursor  = page.nextCursor
    post.commentsHasMore     = page.hasMore
  }

  async function loadLikers(postId: number) {
    const post = posts.value.find(p => p.id === postId)
    if (!post) return
    const page = await feedService.getPostLikers(postId)
    post.loadedLikers = page.items
    post.totalLikers  = page.total
  }

  async function loadMoreComments(postId: number) {
    const post = posts.value.find(p => p.id === postId)
    if (!post || !post.commentsHasMore || post.commentsNextCursor === null) return
    const page = await feedService.getComments(postId, {
      cursor: post.commentsNextCursor,
      limit: 20,
    })
    post.loadedComments.push(...page.items)
    post.commentsNextCursor = page.nextCursor
    post.commentsHasMore    = page.hasMore
  }

  async function submitComment(postId: number) {
    const post = posts.value.find(p => p.id === postId)
    if (!post || !post.newComment.trim()) return
    const content = post.newComment.trim()
    post.newComment = ''
    try {
      await feedService.createComment(postId, content)
      post.commentsCount++
    } catch (e: any) {
      post.newComment = content 
      error.value = e?.message ?? 'Error al comentar'
    }
  }

  async function deleteComment(postId: number, commentId: number) {
    const post = posts.value.find(p => p.id === postId)
    if (!post) return
    await feedService.deleteComment(postId, commentId)
    post.loadedComments = post.loadedComments.filter(c => c.id !== commentId)
    post.commentsCount  = Math.max(0, post.commentsCount - 1)
  }

  async function toggleCommentLike(postId: number, commentId: number) {
    const post    = posts.value.find(p => p.id === postId)
    const comment = post?.loadedComments.find(c => c.id === commentId)
    if (!comment) return

    const wasLiked     = comment.likedByMe
    comment.likedByMe  = !wasLiked
    comment.likesCount += wasLiked ? -1 : 1

    try {
      const result = await feedService.toggleCommentLike(commentId)
      comment.likedByMe  = result.liked
      comment.likesCount = result.likesCount
    } catch {
      comment.likedByMe   = wasLiked
      comment.likesCount += wasLiked ? 1 : -1
    }
  }

  // ─── Share ────────────────────────────────────────────────────────────────

  async function sharePost(postId: number) {
    const url = `${window.location.origin}/forum/${postId}`
    await navigator.clipboard?.writeText(url).catch(() => {})
    shareToast.value = true
    setTimeout(() => { shareToast.value = false }, 2500)
  }

  // ─── WebSocket ───────────────────────────────────────────────────────────

  function connectSocket() {
    const config = useRuntimeConfig()
    const baseUrl = (config.public.apiBase as string).replace('/api', '')

    socket = io(`${baseUrl}/feed`, {
      transports: ['websocket'],
      withCredentials: true,
    })

      socket.on('connect', () => {
      console.log('[Feed WS] Conectado')
    })

    socket.on(FeedEvent.POST_NEW, (post: Post) => {
      const exists = posts.value.some(p => p.id === post.id)
      if (!exists) posts.value.unshift(toFeedPost(post))
    })

    socket.on(FeedEvent.POST_DELETED, ({ postId }: { postId: number }) => {
      posts.value = posts.value.filter(p => p.id !== postId)
    })

    socket.on(FeedEvent.POST_LIKED, (payload: WsPostLiked) => {
      const post = posts.value.find(p => p.id === payload.postId)
      if (!post) return
      post.likesCount = payload.likesCount
      if (payload.userId === user.value?.id) {
        post.likedByMe = payload.liked
      }
    })

    socket.on(FeedEvent.POST_COMMENTED, (payload: WsPostCommented) => {
      const post = posts.value.find(p => p.id === payload.postId)
      if (!post) return
      post.commentsCount++
      if (post.showComments) {
        const exists = post.loadedComments.some(c => c.id === payload.comment.id)
        if (!exists) post.loadedComments.push(payload.comment)
      }
    })

    socket.on(FeedEvent.COMMENT_DELETED, (payload: WsCommentDeleted) => {
      const post = posts.value.find(p => p.id === payload.postId)
      if (!post) return
      post.loadedComments = post.loadedComments.filter(c => c.id !== payload.commentId)
      post.commentsCount  = Math.max(0, post.commentsCount - 1)
    })

    socket.on(FeedEvent.COMMENT_LIKED, (payload: WsCommentLiked) => {
      posts.value.forEach(post => {
        const comment = post.loadedComments.find(c => c.id === payload.commentId)
        if (!comment) return
        comment.likesCount = payload.likesCount
        if (payload.userId === user.value?.id) {
          comment.likedByMe = payload.liked
        }
      })
    })
  }

  function disconnectSocket() {
    socket?.disconnect()
    socket = null
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  onMounted(async () => {
    await fetchUser()
    await loadFeed()
    connectSocket()
  })

  onUnmounted(() => {
    disconnectSocket()
    composerPreviews.value.forEach(url => URL.revokeObjectURL(url))
  })

  return {
    // State
    posts,
    loading,
    loadingMore,
    publishing,
    hasMore,
    error,
    // Composer
    composerText,
    composerFiles,
    composerPreviews,
    expandComposer,
    canPublish,
    shareToast,
    // Feed
    loadFeed,
    loadMore,
    // Composer actions
    addFiles,
    removeFile,
    resetComposer,
    publish,
    // Post actions
    deletePost,
    toggleLike,
    sharePost,
    // Comment actions
    toggleComments,
    loadMoreComments,
    submitComment,
    deleteComment,
    toggleCommentLike,
  }
}