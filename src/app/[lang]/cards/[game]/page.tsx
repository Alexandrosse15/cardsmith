import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '@/dictionaries'
import { searchCards as scryfallSearch, getCardImage, getMagicSets, type ScryfallSet } from '@/lib/api/scryfall'
import { getLorcanaSets, type LorcanaSet } from '@/lib/api/lorcana'
import { searchPokemonCards } from '@/lib/api/pokemon'
import CardGrid, { type CardItem } from '@/components/cards/CardGrid'
import SearchBar from '@/components/cards/SearchBar'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'

const VALID_GAMES = ['magic', 'lorcana', 'lor', 'pokemon'] as const
type Game = (typeof VALID_GAMES)[number]

const DEFAULT_QUERIES: Record<Exclude<Game, 'magic' | 'lorcana'>, string> = {
  lor: 'e',
  pokemon: 'charizard',
}

const MAGIC_SET_TYPE_LABEL: Record<string, { fr: string; en: string }> = {
  core: { fr: 'Set de base', en: 'Core Set' },
  expansion: { fr: 'Extension', en: 'Expansion' },
  masters: { fr: 'Masters', en: 'Masters' },
  draft_innovation: { fr: 'Innovation', en: 'Draft Innovation' },
}

const LORCANA_SET_NAMES: Record<string, string> = {
  '1': 'The First Chapter',
  '2': 'Rise of the Floodborn',
  '3': 'Into the Inklands',
  '4': "Ursula's Return",
  '5': 'Shimmering Skies',
  '6': 'Azurite Sea',
  '7': "Archazia's Island",
  '8': 'Reign of Jafar',
  '9': 'Fabled',
  '10': 'Whispers in the Well',
  '11': 'Winterspell',
  '12': 'Wilds Unknown',
}

async function fetchCards(game: Exclude<Game, 'magic' | 'lorcana'>, query: string): Promise<CardItem[]> {
  try {
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

function groupMagicSetsByYear(sets: ScryfallSet[]): Record<string, ScryfallSet[]> {
  return sets.reduce<Record<string, ScryfallSet[]>>((acc, set) => {
    const year = set.released_at.slice(0, 4)
    if (!acc[year]) acc[year] = []
    acc[year].push(set)
    return acc
  }, {})
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
  searchParams: Promise<{ q?: string }>
}) {
  const { lang, game } = await params
  const { q = '' } = await searchParams

  if (!hasLocale(lang) || !VALID_GAMES.includes(game as Game)) notFound()

  const dict = await getDictionary(lang as Locale)

  if (game === 'magic') {
    const sets = await getMagicSets()
    const grouped = groupMagicSetsByYear(sets)
    const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">{dict.games.magic}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {lang === 'fr'
              ? `${sets.length} extensions depuis Zendikar (2009)`
              : `${sets.length} sets since Zendikar (2009)`}
          </p>
        </div>
        <div className="space-y-10">
          {years.map((year) => (
            <section key={year}>
              <h2 className="mb-4 border-b border-[var(--card-border)] pb-2 text-lg font-bold text-white">
                {year}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {grouped[year].map((set) => (
                  <Link
                    key={set.code}
                    href={`/${lang}/cards/magic/sets/${set.code}`}
                    className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3 transition-all hover:border-[var(--accent)] hover:-translate-y-0.5"
                  >
                    <Image
                      src={set.icon_svg_uri}
                      alt=""
                      width={28}
                      height={28}
                      className="shrink-0 invert opacity-70"
                      unoptimized
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{set.name}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {MAGIC_SET_TYPE_LABEL[set.set_type]?.[lang as 'fr' | 'en'] ?? set.set_type}
                        {' · '}
                        {set.card_count} {lang === 'fr' ? 'cartes' : 'cards'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    )
  }

  if (game === 'lorcana') {
    const sets = await getLorcanaSets()

    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">{dict.games.lorcana}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {lang === 'fr'
              ? `${sets.length} extensions depuis The First Chapter (2023)`
              : `${sets.length} sets since The First Chapter (2023)`}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sets.map((set) => (
            <Link
              key={set.code}
              href={`/${lang}/cards/lorcana/sets/${set.code}`}
              className="flex items-center gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-4 transition-all hover:border-[var(--accent)] hover:-translate-y-0.5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-sm font-bold text-blue-400">
                {set.code}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{set.name}</p>
                <p className="text-xs text-[var(--muted)]">
                  {new Date(set.released_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  const cards = await fetchCards(game as Exclude<Game, 'magic' | 'lorcana'>, q)

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
        <p className="py-20 text-center text-[var(--muted)]">{dict.cards.no_results}</p>
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
