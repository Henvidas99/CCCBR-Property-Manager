import type { ApiActiveAdItem, Listing } from '~/types'

// ── Price formatter ───────────────────────────────────────────────────────────

const formatPrice = (price: number, currency?: string): string => {
  const curr = currency || 'USD'
  const locale = curr === 'USD' ? 'en-US' : 'es-CR'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr === 'CRC' ? 'CRC' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// ── API item → UI Listing ─────────────────────────────────────────────────────

export const mapApiPropertyToListing = (ad: ApiActiveAdItem): Listing => {
  const locationParts = [ad.county, ad.district].filter(Boolean)
  const location = locationParts.length > 0 ? locationParts.join(', ') : 'Costa Rica'

  const specs: string[] = []
  if (ad.categoryName) specs.push(ad.categoryName)
  if (ad.modeDescription) specs.push(ad.modeDescription)

  return {
    id: String(ad.id),
    title: ad.title,
    price: formatPrice(ad.price, ad.currency),
    location,
    image: ad.photoUrl || '',
    specs,
    province: ad.province,
    county: ad.county,
    modeDescription: ad.modeDescription,
    publisherName: ad.publisherFullName || 'Agente',
    publisherImage: ad.publisherProfileImage || undefined,
    publishedTimeAgo: ad.publishedTimeAgo,
  }
}

// ── Composable ────────────────────────────────────────────────────────────────

export const useProperties = () => {
  const config = useRuntimeConfig()

  // NOTE: Update `apiBase` path here when the endpoint changes
  const apiBase = config.public.apiBase

  // Build the reactive API URL based on location filters and pagination
  const buildApiUrl = (
    page: Ref<number>,
    pageSize: number,
    province: { readonly value: string },
    cantons: { readonly value: readonly string[] },
    districts: { readonly value: readonly string[] },
  ) => computed(() => {
    const p = province.value
    const c = cantons.value
    const d = districts.value
    const pg = page.value

    // Filter by districts (most specific)
    if (d.length > 0) {
      const params = d.map(v => `districts=${encodeURIComponent(v)}`).join('&')
      return `${apiBase}/PropertyAd/active/by-district/${pg}/${pageSize}?${params}`
    }
    // Filter by cantons
    if (c.length > 0) {
      const params = c.map(v => `counties=${encodeURIComponent(v)}`).join('&')
      return `${apiBase}/PropertyAd/active/by-county/${pg}/${pageSize}?${params}`
    }
    // Filter by province
    if (p) {
      return `${apiBase}/PropertyAd/active/by-province/${encodeURIComponent(p)}/${pg}/${pageSize}`
    }
    // No filter — get all
    return `${apiBase}/PropertyAd/active/${pg}/${pageSize}`
  })

  return { buildApiUrl, mapApiPropertyToListing }
}
