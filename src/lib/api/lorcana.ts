const BASE = 'https://api.lorcast.com/v0'

export interface LorcanaCard {
  id: string
  name: string
  version?: string
  layout: string
  released_at: string
  image_uris?: {
    digital?: {
      small: string
      normal: string
      large: string
    }
  }
  cost: number
  inkwell: boolean
  ink: string
  type: string[]
  classifications?: string[] | null
  text?: string | null
  keywords: string[]
  strength?: number | null
  willpower?: number | null
  lore?: number | null
  rarity: string
  collector_number: string
  set: { id: string; code: string; name: string }
  prices: { usd?: number | null; usd_foil?: number | null }
  purchase_uris?: { tcgplayer?: string }
}

export interface LorcanaSet {
  id: string
  name: string
  code: string
  released_at: string
  prereleased_at: string
}

export function getLorcanaFullName(card: LorcanaCard): string {
  return card.version ? `${card.name} - ${card.version}` : card.name
}

export function getLorcanaImage(card: LorcanaCard, size: 'small' | 'normal' | 'large' = 'normal'): string {
  return card.image_uris?.digital?.[size] ?? ''
}

export function formatLorcanaRarity(rarity: string): string {
  return rarity.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const MAIN_SET_CODES = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])

export async function getLorcanaSets(): Promise<LorcanaSet[]> {
  const res = await fetch(`${BASE}/sets`, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error('Lorcast sets fetch failed')
  const data: LorcanaSet[] = await res.json()
  return data
    .filter((s) => MAIN_SET_CODES.has(s.code))
    .sort((a, b) => (a.released_at < b.released_at ? -1 : 1))
}

export async function getLorcanaSetCards(setCode: string): Promise<LorcanaCard[]> {
  const res = await fetch(
    `${BASE}/cards/search?q=set:${setCode}`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error('Lorcast set fetch failed')
  const data: { results: LorcanaCard[] } = await res.json()
  return data.results.sort(
    (a, b) => parseInt(a.collector_number) - parseInt(b.collector_number)
  )
}

export async function searchLorcanaCards(query: string): Promise<{ results: LorcanaCard[] }> {
  const res = await fetch(
    `${BASE}/cards/search?q=${encodeURIComponent(query)}`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error('Lorcast search failed')
  return res.json()
}

export async function getLorcanaCard(id: string): Promise<LorcanaCard> {
  const res = await fetch(`${BASE}/cards/${id}`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Lorcast card not found')
  return res.json()
}
