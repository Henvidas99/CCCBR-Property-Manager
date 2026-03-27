export function formatLastSeenAt(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Sin actividad'
  const date = new Date(dateStr)
  const now = new Date()
  
  // Adjust to Costa Rica time (UTC-6)
  const crOffset = -6 * 60 * 60 * 1000
  const dateAdjusted = new Date(date.getTime() + crOffset)
  const nowAdjusted = new Date(now.getTime() + crOffset)
  
  const diffMs = nowAdjusted.getTime() - dateAdjusted.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora mismo'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
  return `Hace ${Math.floor(diffDays / 30)} meses`
}