export type Business = {
  is_pro: boolean
  pro_until: string | null
}

export function isActivePro(b: Business): boolean {
  if (!b.is_pro) return false
  if (!b.pro_until) return false
  return new Date(b.pro_until) > new Date()
}

export function getMediaLimits(b: Business) {
  const pro = isActivePro(b)
  return {
    isPro: pro,
    maxPhotos: pro ? 30 : 3,
    maxVideos: pro ? 5 : 0,
    maxProduk: pro ? 30 : 5
  }
}

export function sortLapak<T extends { is_pro: boolean; pro_until: string | null; created_at: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const aPro = a.is_pro && a.pro_until && new Date(a.pro_until) > new Date() ? 1 : 0
    const bPro = b.is_pro && b.pro_until && new Date(b.pro_until) > new Date() ? 1 : 0
    if (bPro !== aPro) return bPro - aPro
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}
