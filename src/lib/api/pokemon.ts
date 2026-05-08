const BASE = 'https://api.pokemontcg.io/v2'

export interface PokemonCard {
  id: string
  name: string
  supertype: string
  subtypes?: string[]
  hp?: string
  types?: string[]
  evolvesFrom?: string
  abilities?: Array<{ name: string; text: string; type: string }>
  attacks?: Array<{ name: string; cost: string[]; convertedEnergyCost: number; damage: string; text: string }>
  weaknesses?: Array<{ type: string; value: string }>
  retreatCost?: string[]
  number: string
  rarity?: string
  set: { id: string; name: string; series: string; printedTotal: number; releaseDate: string }
  images: { small: string; large: string }
  cardmarket?: {
    updatedAt: string
    prices: {
      averageSellPrice?: number
      lowPrice?: number
      trendPrice?: number
      avg1?: number
      avg7?: number
      avg30?: number
    }
  }
  tcgplayer?: {
    prices?: {
      normal?: { low: number; mid: number; high: number; market: number }
      holofoil?: { low: number; mid: number; high: number; market: number }
    }
  }
}

export interface PokemonCardList {
  data: PokemonCard[]
  page: number
  pageSize: number
  count: number
  totalCount: number
}

export async function searchPokemonCards(query: string, page = 1): Promise<PokemonCardList> {
  const res = await fetch(
    `${BASE}/cards?q=name:"${encodeURIComponent(query)}"&page=${page}&pageSize=20&orderBy=name`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error('Pokemon TCG search failed')
  return res.json()
}

export async function getPokemonCard(id: string): Promise<PokemonCard> {
  const res = await fetch(`${BASE}/cards/${id}`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Pokemon TCG card not found')
  const data = await res.json()
  return data.data
}

export async function getPokemonSetCards(setId: string, page = 1): Promise<PokemonCardList> {
  const res = await fetch(
    `${BASE}/cards?q=set.id:${setId}&page=${page}&pageSize=20`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error('Pokemon TCG set fetch failed')
  return res.json()
}
