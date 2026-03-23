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
    id: String(ad.id_Property),
    title: ad.title,
    price: formatPrice(ad.price, ad.currency),
    location,
    image: (typeof ad.photos?.[0] === 'string' ? ad.photos[0] : (ad.photos?.[0] as any)?.url) ?? '',
    specs,
    province: ad.province,
    county: ad.county,
    modeDescription: ad.modeDescription,
    publisherName: ad.userFullName || 'Agente',
    publisherImage: undefined,
    publishedTimeAgo: undefined,
  }
}

// ── Composable ────────────────────────────────────────────────────────────────

export const useProperties = () => {
  const config = useRuntimeConfig()

  // NOTE: Update `apiBase` path here when the endpoint changes
  const apiBase = config.public.apiBase

  // Build the reactive API URL based on pagination
  const buildApiUrl = (
    page: Ref<number>,
    pageSize: number,
  ) => computed(() => `${apiBase}/PropertyListing/get-all-properties?page=${page.value}&pageSize=${pageSize}`)

  return { buildApiUrl, mapApiPropertyToListing }
}
