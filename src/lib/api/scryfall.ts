const BASE = 'https://api.scryfall.com'

export interface ScryfallCard {
  id: string
  name: string
  set: string
  set_name: string
  collector_number: string
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic'
  type_line: string
  mana_cost?: string
  oracle_text?: string
  image_uris?: { normal: string; large: string; small: string }
  card_faces?: Array<{ image_uris?: { normal: string; large: string; small: string } }>
  prices: {
    eur?: string | null
    eur_foil?: string | null
    usd?: string | null
  }
  purchase_uris?: { cardmarket?: string }
  legalities: Record<string, string>
  set_uri: string
  scryfall_uri: string
}

export interface ScryfallList {
  data: ScryfallCard[]
  has_more: boolean
  next_page?: string
  total_cards: number
}

export async function searchCards(query: string, page = 1): Promise<ScryfallList> {
  const res = await fetch(
    `${BASE}/cards/search?q=${encodeURIComponent(query)}&page=${page}&order=name`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error('Scryfall search failed')
  return res.json()
}

export async function getCard(id: string): Promise<ScryfallCard> {
  const res = await fetch(`${BASE}/cards/${id}`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Scryfall card not found')
  return res.json()
}

export async function getSetCards(setCode: string, page = 1): Promise<ScryfallList> {
  const res = await fetch(
    `${BASE}/cards/search?q=set:${setCode}&order=collector_number&page=${page}`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error('Scryfall set fetch failed')
  return res.json()
}

export function getCardImage(card: ScryfallCard, size: 'small' | 'normal' | 'large' = 'normal'): string {
  const uris = card.image_uris ?? card.card_faces?.[0]?.image_uris
  return uris?.[size] ?? ''
}

export interface ScryfallSet {
  code: string
  name: string
  released_at: string
  set_type: string
  card_count: number
  icon_svg_uri: string
  scryfall_uri: string
}

const INCLUDED_SET_TYPES = new Set([
  'core',
  'expansion',
  'masters',
  'draft_innovation',
])

const ZENDIKAR_DATE = '2009-10-02'

export async function getMagicSets(): Promise<ScryfallSet[]> {
  const res = await fetch(`${BASE}/sets`, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error('Scryfall sets fetch failed')
  const data: { data: ScryfallSet[] } = await res.json()

  return data.data
    .filter(
      (s) =>
        INCLUDED_SET_TYPES.has(s.set_type) &&
        s.released_at >= ZENDIKAR_DATE &&
        s.card_count > 0
    )
    .sort((a, b) => (a.released_at < b.released_at ? 1 : -1))
}
