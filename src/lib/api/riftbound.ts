const BASE_URL = 'https://riftscribe.gg/api'

export interface RiftboundCard {
  id: string
  name: string
  set_id: string
  collector_number: number
  rarity: string
  faction: string
  type: string
  stats?: {
    energy?: number
    might?: number
    power?: number
  }
  image: string
  image_thumb?: {
    small?: string
    medium?: string
    large?: string
  }
}

export interface RiftboundSet {
  id: string
  name: string
  released_at: string
}

export const RIFTBOUND_SETS: RiftboundSet[] = [
  { id: 'OGN', name: 'Origins', released_at: '2025-06-01' },
  { id: 'OGS', name: 'Origins Starter', released_at: '2025-06-01' },
  { id: 'SFD', name: 'Spiritforged', released_at: '2025-09-01' },
  { id: 'UNL', name: 'Unleashed', released_at: '2025-12-01' },
  { id: 'VEN', name: 'Vendetta', released_at: '2026-03-01' },
]

export async function getRiftboundSetCards(setId: string): Promise<RiftboundCard[]> {
  const res = await fetch(`${BASE_URL}/cards?set_id=${setId}&limit=500`, {
    next: { revalidate: 86400 },
  })
  if (!res.ok) return []
  const data = await res.json()
  if (Array.isArray(data)) return data
  return data.cards ?? data.results ?? []
}

export async function searchRiftboundCards(query: string): Promise<RiftboundCard[]> {
  const q = query.toLowerCase()
  const results: RiftboundCard[] = []
  for (const set of RIFTBOUND_SETS) {
    const cards = await getRiftboundSetCards(set.id)
    results.push(...cards.filter((c) => c.name.toLowerCase().includes(q)))
    if (results.length >= 30) break
  }
  return results.slice(0, 30)
}

export async function getRiftboundCard(id: string): Promise<RiftboundCard | null> {
  for (const set of RIFTBOUND_SETS) {
    const cards = await getRiftboundSetCards(set.id)
    const card = cards.find((c) => c.id === id)
    if (card) return card
  }
  return null
}

export function getRiftboundCardImage(card: RiftboundCard, size: 'small' | 'medium' | 'large' | 'original' = 'medium'): string {
  if (size === 'original') return card.image
  return card.image_thumb?.[size] ?? card.image_thumb?.medium ?? card.image
}
