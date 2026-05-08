import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '@/dictionaries'
import { getSetCards, getCardImage } from '@/lib/api/scryfall'
import CardGrid, { type CardItem } from '@/components/cards/CardGrid'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; setCode: string }>
}): Promise<Metadata> {
  const { setCode } = await params
  return { title: `Magic - ${setCode.toUpperCase()}` }
}

export default async function SetCardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; game: string; setCode: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { lang, game, setCode } = await params
  const { page: pageParam = '1' } = await searchParams

  if (!hasLocale(lang) || game !== 'magic') notFound()

  const dict = await getDictionary(lang as Locale)
  const page = Math.max(1, parseInt(pageParam, 10) || 1)

  let result
  try {
    result = await getSetCards(setCode, page)
  } catch {
    notFound()
  }

  const cards: CardItem[] = result.data.map((c) => ({
    id: c.id,
    name: c.name,
    set: c.set_name,
    rarity: c.rarity,
    imageUrl: getCardImage(c, 'small'),
    priceEur: c.prices.eur,
    game: 'magic',
  }))

  const setName = result.data[0]?.set_name ?? setCode.toUpperCase()
  const totalCards = result.total_cards

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        href={`/${lang}/cards/magic`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {lang === 'fr' ? 'Toutes les extensions' : 'All sets'}
      </Link>

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{setName}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {totalCards} {lang === 'fr' ? 'cartes' : 'cards'}
            {' · '}
            {lang === 'fr' ? 'Page' : 'Page'} {page}
          </p>
        </div>
        <span className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] px-2.5 py-1 text-xs font-mono font-bold text-[var(--muted)]">
          {setCode.toUpperCase()}
        </span>
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

      <div className="mt-10 flex items-center justify-center gap-3">
        {page > 1 && (
          <Link
            href={`/${lang}/cards/magic/sets/${setCode}?page=${page - 1}`}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-white transition-colors hover:border-[var(--accent)]"
          >
            {lang === 'fr' ? 'Page précédente' : 'Previous page'}
          </Link>
        )}
        <span className="text-sm text-[var(--muted)]">
          {page} / {Math.ceil(totalCards / 175)}
        </span>
        {result.has_more && (
          <Link
            href={`/${lang}/cards/magic/sets/${setCode}?page=${page + 1}`}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-white transition-colors hover:border-[var(--accent)]"
          >
            {lang === 'fr' ? 'Page suivante' : 'Next page'}
          </Link>
        )}
      </div>
    </div>
  )
}
