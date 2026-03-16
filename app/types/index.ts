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
// PropertyListing Types (public endpoints)
// ============================================

export interface ApiActiveAdItem {
  id_Property: number
  code: string
  title: string
  description: string | null
  dimension: string | null
  price: number
  currency: string
  payment_Frequency: string | null
  address_Description: string
  province: string
  county: string
  district: string
  zone: string | null
  latitude: string | null
  longitude: string | null
  categoryName: string
  modeDescription: string
  userFullName: string
  userId: number
  photos: { url?: string; [key: string]: any }[]
  viewCount: number
  createdDate: string
  updatedDate: string | null
  visibility: string
  amenities: string | null
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
