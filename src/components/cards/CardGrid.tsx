import Image from 'next/image'
import Link from 'next/link'

export interface CardItem {
  id: string
  name: string
  set: string
  rarity: string
  imageUrl: string
  priceEur?: string | number | null
  game: string
}

interface CardGridProps {
  cards: CardItem[]
  lang: string
  priceLabel: string
  viewLabel: string
}

const RARITY_COLOR: Record<string, string> = {
  common: 'text-gray-400',
  uncommon: 'text-blue-400',
  rare: 'text-yellow-400',
  mythic: 'text-orange-400',
  Super: 'text-purple-400',
  Legendary: 'text-orange-400',
  Epic: 'text-blue-400',
  Common: 'text-gray-400',
  Rare: 'text-yellow-400',
}

export default function CardGrid({ cards, lang, priceLabel, viewLabel }: CardGridProps) {
  if (!cards.length) return null

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={`/${lang}/cards/${card.game}/${card.id}`}
          className="group flex flex-col rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden transition-all duration-200 hover:border-[var(--accent)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--accent)]/10"
        >
          <div className="relative aspect-[2.5/3.5] w-full bg-[var(--surface)]">
            {card.imageUrl ? (
              <Image
                src={card.imageUrl}
                alt={card.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--muted)] text-xs px-2 text-center">
                {card.name}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-0.5 p-2.5">
            <p className="truncate text-xs font-semibold text-white">{card.name}</p>
            <p className="truncate text-xs text-[var(--muted)]">{card.set}</p>
            <div className="mt-1 flex items-center justify-between">
              <span className={`text-xs font-medium ${RARITY_COLOR[card.rarity] ?? 'text-[var(--muted)]'}`}>
                {card.rarity}
              </span>
              {card.priceEur != null && (
                <span className="text-xs font-semibold text-[var(--accent)]">
                  {typeof card.priceEur === 'string'
                    ? `${parseFloat(card.priceEur).toFixed(2)} €`
                    : `${Number(card.priceEur).toFixed(2)} €`}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
