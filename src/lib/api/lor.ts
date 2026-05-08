const DATA_DRAGON_BASE = 'https://dd.b.pvp.net/latest'

export interface LorCard {
  cardCode: string
  name: string
  description: string
  descriptionRaw: string
  type: string
  supertype: string
  subtypes: string[]
  rarity: string
  collectible: boolean
  cost: number
  attack: number
  health: number
  regionRefs: string[]
  keywords: string[]
  assets: Array<{ gameAbsolutePath: string; fullAbsolutePath: string }>
  associatedCardRefs: string[]
  set: string
}

export interface LorCardBundle {
  [cardCode: string]: LorCard
}

let lorCardsCache: LorCard[] | null = null

export async function getLorCards(): Promise<LorCard[]> {
  if (lorCardsCache) return lorCardsCache

  const setsRes = await fetch(`${DATA_DRAGON_BASE}/core/en_us/data/set-bundles.json`, {
    next: { revalidate: 86400 },
  })

  if (!setsRes.ok) {
    const fallbackRes = await fetch(`${DATA_DRAGON_BASE}/set1/en_us/data/set1-en_us.json`, {
      next: { revalidate: 86400 },
    })
    if (!fallbackRes.ok) throw new Error('LoR data fetch failed')
    lorCardsCache = await fallbackRes.json()
    return lorCardsCache!
  }

  lorCardsCache = await setsRes.json()
  return lorCardsCache!
}

export async function searchLorCards(query: string): Promise<LorCard[]> {
  const cards = await getLorCards()
  const q = query.toLowerCase()
  return cards.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.descriptionRaw.toLowerCase().includes(q)
  )
}

export async function getLorCard(cardCode: string): Promise<LorCard | undefined> {
  const cards = await getLorCards()
  return cards.find((c) => c.cardCode === cardCode)
}

export function getLorCardImage(card: LorCard): string {
  return card.assets[0]?.gameAbsolutePath ?? ''
}
