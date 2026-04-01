import { useApi } from '~/composables/useApi'
import type {
  FeedPage,
  FeedQuery,
  Post,
  CommentsPage,
  CommentsQuery,
  Comment,
  LikersPage,
  ToggleLikeResponse,
} from '~/types/feed.types'

export const feedService = {
  // ─── Posts ────────────────────────────────────────────────────────────────

  async getFeed(query: FeedQuery = {}): Promise<FeedPage> {
    const { request } = useApi()
    const params = new URLSearchParams()
    if (query.cursor) params.set('cursor', String(query.cursor))
    if (query.limit)  params.set('limit',  String(query.limit))
    const qs = params.toString()
    return request<FeedPage>(`/feed/posts${qs ? `?${qs}` : ''}`)
  },

  async getPost(postId: number): Promise<Post> {
    const { request } = useApi()
    return request<Post>(`/feed/posts/${postId}`)
  },

  async createPost(content: string, files: File[]): Promise<Post> {
    const { request } = useApi()
    const formData = new FormData()
    if (content) formData.append('content', content)
    files.forEach(f => formData.append('files', f))
    return request<Post>('/feed/posts', {
      method: 'POST',
      body: formData,
      // No seteamos Content-Type: el browser lo hace con el boundary correcto
    })
  },

  async deletePost(postId: number): Promise<{ message: string }> {
    const { request } = useApi()
    return request<{ message: string }>(`/feed/posts/${postId}`, { method: 'DELETE' })
  },

  // ─── Likes – Posts ────────────────────────────────────────────────────────

  async togglePostLike(postId: number): Promise<ToggleLikeResponse> {
    const { request } = useApi()
    return request<ToggleLikeResponse>(`/feed/posts/${postId}/like`, { method: 'POST' })
  },

  async getPostLikers(postId: number): Promise<LikersPage> {
    const { request } = useApi()
    return request<LikersPage>(`/feed/posts/${postId}/likes`)
  },

  // ─── Comments ─────────────────────────────────────────────────────────────

  async getComments(postId: number, query: CommentsQuery = {}): Promise<CommentsPage> {
    const { request } = useApi()
    const params = new URLSearchParams()
    if (query.cursor) params.set('cursor', String(query.cursor))
    if (query.limit)  params.set('limit',  String(query.limit))
    const qs = params.toString()
    return request<CommentsPage>(`/feed/posts/${postId}/comments${qs ? `?${qs}` : ''}`)
  },

  async createComment(postId: number, content: string): Promise<Comment> {
    const { request } = useApi()
    return request<Comment>(`/feed/posts/${postId}/comments`, {
      method: 'POST',
      body: { content },
    })
  },

  async deleteComment(postId: number, commentId: number): Promise<{ message: string }> {
    const { request } = useApi()
    return request<{ message: string }>(`/feed/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    })
  },

  // ─── Likes – Comments ─────────────────────────────────────────────────────

  async toggleCommentLike(commentId: number): Promise<ToggleLikeResponse> {
    const { request } = useApi()
    return request<ToggleLikeResponse>(`/feed/comments/${commentId}/like`, { method: 'POST' })
  },
}