import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '@/dictionaries'
import { getMetaFormat, FORMATS } from '@/lib/meta'
import DeckRow from '@/components/meta/DeckRow'
import Link from 'next/link'
import type { Metadata } from 'next'

const VALID_GAMES = ['magic', 'lorcana', 'riftbound', 'pokemon']

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
  searchParams,
}: {
  params: Promise<{ lang: string; game: string }>
  searchParams: Promise<{ format?: string }>
}) {
  const { lang, game } = await params
  const { format: formatParam } = await searchParams

  if (!hasLocale(lang) || !VALID_GAMES.includes(game)) notFound()

  const dict = await getDictionary(lang as Locale)
  const formats = FORMATS[game] ?? []
  const activeFormatId = formatParam ?? formats[0]?.id ?? 'standard'
  const activeFormat = formats.find((f) => f.id === activeFormatId) ?? formats[0]

  const meta = await getMetaFormat(game, activeFormatId)

  const gameName = dict.games[game as keyof typeof dict.games]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Meta {gameName}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {lang === 'fr' ? 'Decks et archetypes du moment' : 'Top decks and archetypes'}
          {meta && (
            <span className="ml-2">
              · {lang === 'fr' ? 'mis à jour le' : 'updated'} {meta.updatedAt}
            </span>
          )}
        </p>
      </div>

      {formats.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {formats.map((f) => (
            <Link
              key={f.id}
              href={`/${lang}/meta/${game}?format=${f.id}`}
              className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors ${
                f.id === activeFormatId
                  ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                  : 'border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-white'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      )}

      {!meta || meta.decks.length === 0 ? (
        <p className="py-20 text-center text-[var(--muted)]">
          {lang === 'fr' ? 'Aucun deck pour ce format.' : 'No decks for this format yet.'}
        </p>
      ) : (
        <div className="space-y-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              {activeFormat?.label} · {meta.decks.length} {lang === 'fr' ? 'decks' : 'decks'}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {lang === 'fr' ? 'Cliquer sur un deck pour voir la liste de cartes' : 'Click a deck to expand the card list'}
            </p>
          </div>
          {meta.decks.map((deck) => (
            <DeckRow key={deck.id} deck={deck} lang={lang} game={game} />
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-[var(--muted)]">
        {lang === 'fr'
          ? 'Données basées sur les résultats de tournois récents. Mis à jour régulièrement.'
          : 'Data based on recent tournament results. Updated regularly.'}
      </p>
    </div>
  )
}
