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
}

export interface LorcanaSet {
  id: string
  name: string
  code: string
  released_at: string
  prereleased_at: string
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
  const data: LorcanaCardList = await res.json()
  return data.results.sort((a, b) => a.number - b.number)
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
