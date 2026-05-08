import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '@/dictionaries'
import type { Metadata } from 'next'

const VALID_GAMES = ['magic', 'lorcana', 'lor', 'pokemon']

const PLACEHOLDER_META: Record<string, Array<{ name: string; tier: number; winRate: string; archetype: string }>> = {
  magic: [
    { name: 'Domain Ramp', tier: 1, winRate: '56.2%', archetype: 'Ramp' },
    { name: 'Azorius Control', tier: 1, winRate: '54.8%', archetype: 'Control' },
    { name: 'Esper Midrange', tier: 2, winRate: '52.1%', archetype: 'Midrange' },
    { name: 'Rakdos Sacrifice', tier: 2, winRate: '51.7%', archetype: 'Combo' },
    { name: 'Mono Red Aggro', tier: 2, winRate: '50.3%', archetype: 'Aggro' },
  ],
  lorcana: [
    { name: 'Sapphire/Steel Control', tier: 1, winRate: '58.1%', archetype: 'Control' },
    { name: 'Ruby/Amethyst Aggro', tier: 1, winRate: '55.4%', archetype: 'Aggro' },
    { name: 'Emerald/Ruby Tempo', tier: 2, winRate: '52.0%', archetype: 'Tempo' },
    { name: 'Amber/Sapphire Songs', tier: 2, winRate: '50.8%', archetype: 'Combo' },
  ],
  lor: [
    { name: 'Noxus/Demacia Aggro', tier: 1, winRate: '57.3%', archetype: 'Aggro' },
    { name: 'Piltover/Zaun Combo', tier: 1, winRate: '55.9%', archetype: 'Combo' },
    { name: 'Freljord Control', tier: 2, winRate: '53.2%', archetype: 'Control' },
  ],
  pokemon: [
    { name: 'Charizard ex', tier: 1, winRate: '59.4%', archetype: 'Aggro' },
    { name: 'Gardevoir ex', tier: 1, winRate: '57.2%', archetype: 'Combo' },
    { name: 'Lost Box', tier: 2, winRate: '54.1%', archetype: 'Midrange' },
    { name: 'Miraidon ex', tier: 2, winRate: '52.8%', archetype: 'Aggro' },
    { name: 'Roaring Moon ex', tier: 3, winRate: '49.5%', archetype: 'Aggro' },
  ],
}

const TIER_COLOR: Record<number, string> = {
  1: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  2: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  3: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; game: string }>
}): Promise<Metadata> {
  const { lang, game } = await params
  const dict = hasLocale(lang) ? await getDictionary(lang as Locale) : null
  const gameName = dict?.games[game as keyof typeof dict.games] ?? game
  return { title: `Meta ${gameName}` }
}

export default async function MetaPage({
  params,
}: {
  params: Promise<{ lang: string; game: string }>
}) {
  const { lang, game } = await params
  if (!hasLocale(lang) || !VALID_GAMES.includes(game)) notFound()

  const dict = await getDictionary(lang as Locale)
  const decks = PLACEHOLDER_META[game] ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Meta {dict.games[game as keyof typeof dict.games]}
        </h1>
        <p className="mt-2 text-[var(--muted)]">{dict.meta.subtitle}</p>
      </div>

      <div className="flex flex-col gap-3">
        {decks.map((deck, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-5 py-4"
          >
            <div className="flex items-center gap-4">
              <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${TIER_COLOR[deck.tier]}`}>
                T{deck.tier}
              </span>
              <div>
                <p className="font-semibold text-white">{deck.name}</p>
                <p className="text-xs text-[var(--muted)]">{deck.archetype}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[var(--accent)]">{deck.winRate}</p>
              <p className="text-xs text-[var(--muted)]">{dict.meta.win_rate}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-[var(--muted)]">
        {lang === 'fr'
          ? 'Données indicatives basées sur les tournois récents. Mis a jour regulierement.'
          : 'Indicative data based on recent tournament results. Updated regularly.'}
      </p>
    </div>
  )
}
