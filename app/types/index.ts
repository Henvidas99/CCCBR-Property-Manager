// ============================================
// Location Types
// ============================================

export interface Canton {
  name: string
  districts?: string[]
}

export interface Province {
  name: string
  cantons: Canton[]
}

// ============================================
// PropertyAd Active Listing Types (public endpoints)
// ============================================

export interface ApiActiveAdItem {
  id: number
  propertyId: number | null
  title: string
  price: number
  currency: string
  address_Description: string
  province: string
  county: string
  district: string
  zone: string | null
  categoryName: string
  modeDescription: string
  status: string
  expirationDate: string
  viewCount: number
  daysRemaining: number
  photoUrl: string
  publishedTimeAgo: string
  publisherFullName: string
  publisherEmail: string
  publisherPhone: string
  publisherProfileImage: string | null
  dimension?: string
}

export interface ApiActiveAdPagedResponse {
  items: ApiActiveAdItem[]
  totalCount: number
  pageSize: number
  currentPage: number
}

// ============================================
// UI Listing Type (card view)
// ============================================

export interface Listing {
  id: string
  title: string
  price: string
  location: string
  image: string
  specs: string[]
  province?: string
  county?: string
  modeDescription?: string
  publisherName?: string
  publisherImage?: string
  publishedTimeAgo?: string
}
