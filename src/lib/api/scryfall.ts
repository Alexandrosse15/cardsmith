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
  return searchCards(`set:${setCode}`, page)
}

export function getCardImage(card: ScryfallCard, size: 'small' | 'normal' | 'large' = 'normal'): string {
  const uris = card.image_uris ?? card.card_faces?.[0]?.image_uris
  return uris?.[size] ?? ''
}
