let loadPromise: Promise<void> | null = null

export const useGoogleMaps = () => {
  const config = useRuntimeConfig()

  const ensureLoaded = (): Promise<void> => {
    if (loadPromise) return loadPromise

    loadPromise = new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Cannot load Google Maps on server'))
        return
      }

      if (window.google?.maps?.importLibrary) {
        resolve()
        return
      }

      const apiKey = config.public.googleMapsApiKey as string
      if (!apiKey) {
        reject(new Error('No Google Maps API key configured'))
        return
      }

      const script = document.createElement('script')
      script.async = true
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&loading=async`
      script.onload = () => {
        setTimeout(() => resolve(), 100)
      }
      script.onerror = () => reject(new Error('Failed to load Google Maps script'))
      document.head.appendChild(script)
    })

    return loadPromise
  }

  const loadMaps = async () => {
    await ensureLoaded()
    return await google.maps.importLibrary('maps') as google.maps.MapsLibrary
  }

  const loadMarker = async () => {
    await ensureLoaded()
    return await google.maps.importLibrary('marker') as google.maps.MarkerLibrary
  }

  const loadGeocoding = async () => {
    await ensureLoaded()
    return await google.maps.importLibrary('geocoding') as google.maps.GeocodingLibrary
  }

  const loadPlaces = async () => {
    await ensureLoaded()
    return await google.maps.importLibrary('places') as google.maps.PlacesLibrary
  }

  return { loadMaps, loadMarker, loadGeocoding, loadPlaces }
}
