const BASE = 'https://api.lorcast.com/v0'

export interface LorcanaCard {
  id: string
  name: string
  version?: string
  fullName: string
  fullIdentifier: string
  set: { id: string; name: string; code: string }
  number: number
  rarity: string
  type: string[]
  classifications?: string[]
  cost: number
  inkable: boolean
  color: string
  image: { thumbnail: string; full: string }
  prices: { low?: number; mid?: number; high?: number; market?: number }
}

export interface LorcanaCardList {
  results: LorcanaCard[]
  count: number
  next?: string
  previous?: string
}

export async function searchLorcanaCards(query: string): Promise<LorcanaCardList> {
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

export async function getLorcanaSet(setCode: string): Promise<LorcanaCardList> {
  const res = await fetch(`${BASE}/cards/search?q=set:${setCode}`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Lorcast set fetch failed')
  return res.json()
}
