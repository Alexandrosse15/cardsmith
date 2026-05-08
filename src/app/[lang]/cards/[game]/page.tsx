import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '@/dictionaries'
import { searchCards as scryfallSearch, getCardImage } from '@/lib/api/scryfall'
import { searchLorcanaCards } from '@/lib/api/lorcana'
import { searchPokemonCards } from '@/lib/api/pokemon'
import CardGrid, { type CardItem } from '@/components/cards/CardGrid'
import SearchBar from '@/components/cards/SearchBar'
import { Suspense } from 'react'
import type { Metadata } from 'next'

const VALID_GAMES = ['magic', 'lorcana', 'lor', 'pokemon'] as const
type Game = (typeof VALID_GAMES)[number]

const DEFAULT_QUERIES: Record<Game, string> = {
  magic: 'format:standard',
  lorcana: 'the',
  lor: 'e',
  pokemon: 'charizard',
}

async function fetchCards(game: Game, query: string): Promise<CardItem[]> {
  try {
    if (game === 'magic') {
      const q = query || DEFAULT_QUERIES.magic
      const res = await scryfallSearch(q)
      return res.data.map((c) => ({
        id: c.id,
        name: c.name,
        set: c.set_name,
        rarity: c.rarity,
        imageUrl: getCardImage(c, 'small'),
        priceEur: c.prices.eur,
        game: 'magic',
      }))
    }

    if (game === 'lorcana') {
      const res = await searchLorcanaCards(query || DEFAULT_QUERIES.lorcana)
      return res.results.slice(0, 30).map((c) => ({
        id: c.id,
        name: c.fullName,
        set: c.set.name,
        rarity: c.rarity,
        imageUrl: c.image.thumbnail,
        priceEur: c.prices.market ?? c.prices.mid,
        game: 'lorcana',
      }))
    }

    if (game === 'lor') {
      const { searchLorCards, getLorCardImage } = await import('@/lib/api/lor')
      const cards = await searchLorCards(query || DEFAULT_QUERIES.lor)
      return cards
        .filter((c) => c.collectible)
        .slice(0, 30)
        .map((c) => ({
          id: c.cardCode,
          name: c.name,
          set: c.set,
          rarity: c.rarity,
          imageUrl: getLorCardImage(c),
          priceEur: null,
          game: 'lor',
        }))
    }

    if (game === 'pokemon') {
      const res = await searchPokemonCards(query || DEFAULT_QUERIES.pokemon)
      return res.data.map((c) => ({
        id: c.id,
        name: c.name,
        set: c.set.name,
        rarity: c.rarity ?? 'Unknown',
        imageUrl: c.images.small,
        priceEur: c.cardmarket?.prices?.averageSellPrice,
        game: 'pokemon',
      }))
    }
  } catch {
    return []
  }
  return []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; game: string }>
}): Promise<Metadata> {
  const { lang, game } = await params
  const dict = hasLocale(lang) ? await getDictionary(lang as Locale) : null
  const gameName = dict?.games[game as keyof typeof dict.games] ?? game
  return { title: `${gameName} - ${dict?.cards.title ?? 'Cards'}` }
}

export default async function CardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; game: string }>
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { lang, game } = await params
  const { q = '' } = await searchParams

  if (!hasLocale(lang) || !VALID_GAMES.includes(game as Game)) notFound()

  const dict = await getDictionary(lang as Locale)
  const cards = await fetchCards(game as Game, q)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          {dict.games[game as keyof typeof dict.games]}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{dict.cards.title}</p>
      </div>

      <div className="mb-6 max-w-md">
        <Suspense>
          <SearchBar placeholder={dict.cards.search_placeholder} defaultValue={q} />
        </Suspense>
      </div>

      {cards.length === 0 ? (
        <p className="text-center py-20 text-[var(--muted)]">{dict.cards.no_results}</p>
      ) : (
        <CardGrid
          cards={cards}
          lang={lang}
          priceLabel={dict.cards.price_label}
          viewLabel={dict.cards.view_card}
        />
      )}
    </div>
  )
}
