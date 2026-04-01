// ─── Enums ────────────────────────────────────────────────────────────────────

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export enum FeedEvent {
  POST_NEW        = 'post:new',
  POST_DELETED    = 'post:deleted',
  POST_LIKED      = 'post:liked',
  POST_COMMENTED  = 'post:commented',
  COMMENT_DELETED = 'post:comment:deleted',
  COMMENT_LIKED   = 'comment:liked',
}

// ─── DTOs / Response shapes ───────────────────────────────────────────────────

export interface AuthorSnapshot {
  id: number
  fullName: string
  photo: string
  position: string | null
}

export interface PostMedia {
  id: number
  url: string
  mediaType: MediaType
  mimeType: string | null
  sortOrder: number
}

export interface Post {
  id: number
  content: string | null
  author: AuthorSnapshot
  media: PostMedia[]
  likesCount: number
  commentsCount: number
  likedByMe: boolean
  createdAt: string
  updatedAt: string
}

export interface FeedPage {
  items: Post[]
  nextCursor: number | null
  hasMore: boolean
}

export interface Comment {
  id: number
  content: string
  author: AuthorSnapshot
  likesCount: number
  likedByMe: boolean
  createdAt: string
  updatedAt: string
}

export interface CommentsPage {
  items: Comment[]
  nextCursor: number | null
  hasMore: boolean
  total: number
}

export interface LikersPage {
  items: AuthorSnapshot[]
  total: number
}

export interface ToggleLikeResponse {
  liked: boolean
  likesCount: number
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface FeedQuery {
  cursor?: number
  limit?: number
}

export interface CommentsQuery {
  cursor?: number
  limit?: number
}

// ─── Socket payloads ──────────────────────────────────────────────────────────

export interface WsPostLiked {
  postId: number
  userId: number
  liked: boolean
  likesCount: number
}

export interface WsPostCommented {
  postId: number
  comment: Comment
}

export interface WsCommentDeleted {
  postId: number
  commentId: number
}

export interface WsCommentLiked {
  commentId: number
  userId: number
  liked: boolean
  likesCount: number
}

// ─── UI-extended Post (adds local state for the feed composable) ──────────────

export interface FeedPost extends Post {
  /** comentarios cargados localmente */
  loadedComments: Comment[]
  loadedLikers: AuthorSnapshot[]
  totalLikers: number
  commentsNextCursor: number | null
  commentsHasMore: boolean
  showComments: boolean
  newComment: string
  /** animación de like */
  justLiked: boolean
}