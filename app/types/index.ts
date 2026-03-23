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
  details: string | null
  dimension: string | null
  services: string | null
  amenities: string | null
  id_Mode: number
  modeDescription: string
  id_Category: number
  categoryName: string
  price: number
  currency: string
  payment_Frequency: string | null
  commission: number | null
  commisionType: string | null
  address_Description: string
  province: string
  county: string
  district: string
  zone: string | null
  latitude: string | null
  longitude: string | null
  google_Maps: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  visibility: string
  moduleStateId: number | null
  userId: number
  userFullName: string
  photos: { url?: string; [key: string]: any }[]
  createdDate: string
  updatedDate: string | null
  score: number | null
  viewCount: number
}

export interface ApiActiveAdPagedResponse {
  items: ApiActiveAdItem[]
  totalCount: number
  pageSize: number
  currentPage: number
}

export interface ApiCategory {
  id_Category: number
  name: string
}

export interface ApiMyPropertiesPagedResponse {
  data: ApiActiveAdItem[]
  total: number
  page: number
  pageSize: number
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
