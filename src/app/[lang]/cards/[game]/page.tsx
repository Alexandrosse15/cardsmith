import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '@/dictionaries'
import { getMagicSets, type ScryfallSet } from '@/lib/api/scryfall'
import { getLorcanaSets } from '@/lib/api/lorcana'
import { getPokemonSets } from '@/lib/api/pokemon'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

const VALID_GAMES = ['magic', 'lorcana', 'riftbound', 'pokemon'] as const
type Game = (typeof VALID_GAMES)[number]

const MAGIC_SET_TYPE_LABEL: Record<string, { fr: string; en: string }> = {
  core: { fr: 'Set de base', en: 'Core Set' },
  expansion: { fr: 'Extension', en: 'Expansion' },
  masters: { fr: 'Masters', en: 'Masters' },
  draft_innovation: { fr: 'Innovation', en: 'Draft Innovation' },
}

function groupPokemonSetsBySeries(sets: Awaited<ReturnType<typeof getPokemonSets>>): Record<string, typeof sets> {
  return sets.reduce<Record<string, typeof sets>>((acc, set) => {
    if (!acc[set.series]) acc[set.series] = []
    acc[set.series].push(set)
    return acc
  }, {})
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
}: {
  params: Promise<{ lang: string; game: string }>
}) {
  const { lang, game } = await params

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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sets.map((set) => (
            <Link
              key={set.code}
              href={`/${lang}/cards/lorcana/sets/${set.code}`}
              className="flex flex-col gap-1 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-4 transition-all hover:border-[var(--accent)] hover:-translate-y-0.5"
            >
              <p className="truncate text-sm font-semibold text-white">{set.name}</p>
              <p className="text-xs text-[var(--muted)]">
                {new Date(set.released_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  if (game === 'riftbound') {
    const { RIFTBOUND_SETS } = await import('@/lib/api/riftbound')

    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">{dict.games.riftbound}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {lang === 'fr'
              ? `${RIFTBOUND_SETS.length} extensions`
              : `${RIFTBOUND_SETS.length} sets`}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {RIFTBOUND_SETS.map((set) => (
            <Link
              key={set.id}
              href={`/${lang}/cards/riftbound/sets/${set.id}`}
              className="flex flex-col gap-1 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-4 transition-all hover:border-[var(--accent)] hover:-translate-y-0.5"
            >
              <p className="truncate text-sm font-semibold text-white">{set.name}</p>
              <p className="text-xs text-[var(--muted)]">
                {new Date(set.released_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  // pokemon
  const sets = await getPokemonSets()
  const grouped = groupPokemonSetsBySeries(sets)
  const series = Object.keys(grouped)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{dict.games.pokemon}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {lang === 'fr'
            ? `${sets.length} extensions`
            : `${sets.length} sets`}
        </p>
      </div>
      <div className="space-y-10">
        {series.map((serie) => (
          <section key={serie}>
            <h2 className="mb-4 border-b border-[var(--card-border)] pb-2 text-lg font-bold text-white">
              {serie}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {grouped[serie].map((set) => (
                <Link
                  key={set.id}
                  href={`/${lang}/cards/pokemon/sets/${set.id}`}
                  className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3 transition-all hover:border-[var(--accent)] hover:-translate-y-0.5"
                >
                  {set.images.symbol && (
                    <Image
                      src={set.images.symbol}
                      alt=""
                      width={24}
                      height={24}
                      className="shrink-0 object-contain"
                      unoptimized
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{set.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {set.printedTotal} {lang === 'fr' ? 'cartes' : 'cards'}
                      {' · '}
                      {new Date(set.releaseDate).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                      })}
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
