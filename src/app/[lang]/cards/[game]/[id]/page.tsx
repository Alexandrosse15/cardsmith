import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '@/dictionaries'
import Image from 'next/image'
import Link from 'next/link'
import { getCard, getCardImage } from '@/lib/api/scryfall'
import { getLorcanaCard, getLorcanaFullName, getLorcanaImage, formatLorcanaRarity } from '@/lib/api/lorcana'
import { getPokemonCard } from '@/lib/api/pokemon'
import type { Metadata } from 'next'

type Game = 'magic' | 'lorcana' | 'lor' | 'pokemon'

async function fetchCardDetail(game: Game, id: string) {
  try {
    if (game === 'magic') {
      const card = await getCard(id)
      return {
        name: card.name,
        image: getCardImage(card, 'large'),
        set: card.set_name,
        rarity: card.rarity,
        type: card.type_line,
        text: card.oracle_text,
        priceEur: card.prices.eur ? `${parseFloat(card.prices.eur).toFixed(2)} €` : null,
        priceEurFoil: card.prices.eur_foil ? `${parseFloat(card.prices.eur_foil).toFixed(2)} €` : null,
        cardmarketUrl: card.purchase_uris?.cardmarket,
        number: card.collector_number,
        legalities: card.legalities,
      }
    }
    if (game === 'lorcana') {
      const card = await getLorcanaCard(id)
      const usd = card.prices.usd != null ? parseFloat(String(card.prices.usd)) : null
      const usdFoil = card.prices.usd_foil != null ? parseFloat(String(card.prices.usd_foil)) : null
      return {
        name: getLorcanaFullName(card),
        image: getLorcanaImage(card, 'large'),
        set: card.set.name,
        rarity: formatLorcanaRarity(card.rarity),
        type: (card.type ?? []).join(', '),
        text: card.text ?? null,
        priceEur: usd ? `${usd.toFixed(2)} $` : null,
        priceEurFoil: usdFoil ? `${usdFoil.toFixed(2)} $` : null,
        cardmarketUrl: card.purchase_uris?.tcgplayer ?? null,
        number: String(card.collector_number),
        legalities: {},
      }
    }
    if (game === 'lor') {
      const { getLorCard, getLorCardImage } = await import('@/lib/api/lor')
      const card = await getLorCard(id)
      if (!card) return null
      return {
        name: card.name,
        image: getLorCardImage(card, 'full'),
        set: card.set,
        rarity: card.rarity,
        type: card.type,
        text: card.descriptionRaw,
        priceEur: null,
        priceEurFoil: null,
        cardmarketUrl: null,
        number: card.cardCode,
        legalities: {},
      }
    }
    if (game === 'pokemon') {
      const card = await getPokemonCard(id)
      return {
        name: card.name,
        image: card.images.large,
        set: card.set.name,
        rarity: card.rarity ?? 'Unknown',
        type: `${card.supertype}${card.subtypes ? ' - ' + card.subtypes.join(', ') : ''}`,
        text: card.attacks?.map((a) => `${a.name}: ${a.text}`).join('\n') ?? null,
        priceEur: card.cardmarket?.prices?.averageSellPrice
          ? `${card.cardmarket.prices.averageSellPrice.toFixed(2)} €`
          : null,
        priceEurFoil: null,
        cardmarketUrl: null,
        number: card.number,
        legalities: {},
      }
    }
  } catch {
    return null
  }
  return null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; game: string; id: string }>
}): Promise<Metadata> {
  const { lang, game, id } = await params
  try {
    const card = await fetchCardDetail(game as Game, id)
    return { title: card?.name ?? id }
  } catch {
    return { title: id }
  }
}

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ lang: string; game: string; id: string }>
}) {
  const { lang, game, id } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang as Locale)
  const card = await fetchCardDetail(game as Game, id)
  if (!card) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href={`/${lang}/cards/${game}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {dict.card.back_to_list}
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[300px_1fr]">
        <div className="flex justify-center">
          {card.image ? (
            <div className="relative w-64 md:w-full">
              <Image
                src={card.image}
                alt={card.name}
                width={300}
                height={420}
                className="rounded-xl shadow-2xl"
              />
            </div>
          ) : (
            <div className="flex h-96 w-64 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--muted)]">
              {card.name}
            </div>
          )}
        </div>

        <div>
          <h1 className="mb-1 text-3xl font-bold text-white">{card.name}</h1>
          <p className="mb-4 text-sm text-[var(--muted)]">
            {dict.games[game as keyof typeof dict.games]}
          </p>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: dict.card.set, value: card.set },
              { label: dict.card.rarity, value: card.rarity },
              { label: dict.card.type, value: card.type },
              { label: dict.card.collector_number, value: card.number },
            ].map((row) => (
              <div key={row.label} className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-3">
                <p className="text-xs text-[var(--muted)]">{row.label}</p>
                <p className="mt-0.5 text-sm font-medium text-white">{row.value}</p>
              </div>
            ))}
          </div>

          {(card.priceEur || card.priceEurFoil) && (
            <div className="mb-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
              <p className="mb-3 text-sm font-semibold text-white">{dict.card.price_cardmarket}</p>
              <div className="flex gap-4">
                {card.priceEur && (
                  <div>
                    <p className="text-xs text-[var(--muted)]">Non-foil</p>
                    <p className="text-2xl font-bold text-[var(--accent)]">{card.priceEur}</p>
                  </div>
                )}
                {card.priceEurFoil && (
                  <div>
                    <p className="text-xs text-[var(--muted)]">Foil</p>
                    <p className="text-2xl font-bold text-purple-400">{card.priceEurFoil}</p>
                  </div>
                )}
              </div>
              {card.cardmarketUrl && (
                <a
                  href={card.cardmarketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block rounded-md bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--accent-hover)]"
                >
                  {lang === 'fr' ? 'Voir sur Cardmarket' : 'View on Cardmarket'}
                </a>
              )}
            </div>
          )}

          {card.text && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-[var(--muted)]">
                {lang === 'fr' ? 'Texte de la carte' : 'Card text'}
              </p>
              <p className="whitespace-pre-line text-sm text-white leading-relaxed">{card.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
