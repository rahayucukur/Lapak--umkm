export type Business = {
  is_pro: boolean
  pro_until: string | null
}

export function isActivePro(business: Business, now = new Date()): boolean {
  if (!business.is_pro || !business.pro_until) return false
  const expiry = new Date(business.pro_until)
  return Number.isFinite(expiry.getTime()) && expiry > now
}

export function getMediaLimits(business: Business) {
  const pro = isActivePro(business)
  return { isPro: pro, maxPhotos: pro ? 30 : 3, maxVideos: pro ? 5 : 0, maxProduk: pro ? 30 : 5 }
}

export function sortLapak<T extends Business & { created_at: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const byPro = Number(isActivePro(b)) - Number(isActivePro(a))
    return byPro || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}
