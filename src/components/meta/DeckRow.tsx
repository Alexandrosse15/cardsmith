'use client'

import { useState } from 'react'
import type { MetaDeck } from '@/lib/meta'

interface DeckRowProps {
  deck: MetaDeck
  lang: string
  game: string
}

const TIER_STYLE: Record<number, string> = {
  1: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  2: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  3: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
}

const COLOR_SYMBOLS: Record<string, { bg: string; label: string }> = {
  W: { bg: 'bg-yellow-100 text-yellow-900', label: 'W' },
  U: { bg: 'bg-blue-500 text-white', label: 'U' },
  B: { bg: 'bg-gray-800 text-white', label: 'B' },
  R: { bg: 'bg-red-500 text-white', label: 'R' },
  G: { bg: 'bg-green-600 text-white', label: 'G' },
  Sapphire: { bg: 'bg-blue-500 text-white', label: 'S' },
  Steel: { bg: 'bg-gray-400 text-gray-900', label: 'St' },
  Ruby: { bg: 'bg-red-500 text-white', label: 'R' },
  Amethyst: { bg: 'bg-purple-500 text-white', label: 'A' },
  Emerald: { bg: 'bg-green-500 text-white', label: 'E' },
  Amber: { bg: 'bg-amber-500 text-white', label: 'Am' },
  Fire: { bg: 'bg-orange-500 text-white', label: 'F' },
  Psychic: { bg: 'bg-pink-500 text-white', label: 'P' },
  Lightning: { bg: 'bg-yellow-400 text-yellow-900', label: 'L' },
  Water: { bg: 'bg-blue-400 text-white', label: 'W' },
  Colorless: { bg: 'bg-gray-300 text-gray-800', label: 'C' },
  Fury: { bg: 'bg-orange-500 text-white', label: 'Fy' },
  Valor: { bg: 'bg-yellow-500 text-white', label: 'Va' },
  Wisdom: { bg: 'bg-indigo-500 text-white', label: 'Wi' },
  Shadow: { bg: 'bg-gray-800 text-gray-200', label: 'Sd' },
  Nature: { bg: 'bg-green-600 text-white', label: 'Na' },
  Order: { bg: 'bg-sky-500 text-white', label: 'Or' },
}

export default function DeckRow({ deck, lang, game }: DeckRowProps) {
  const [open, setOpen] = useState(false)

  const mainTotal = deck.mainboard.reduce((sum, c) => sum + c.quantity, 0)
  const sideTotal = deck.sideboard.reduce((sum, c) => sum + c.quantity, 0)

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold ${TIER_STYLE[deck.tier] ?? TIER_STYLE[3]}`}>
            T{deck.tier}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {deck.colors.map((c) => {
              const style = COLOR_SYMBOLS[c]
              return style ? (
                <span key={c} className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${style.bg}`}>
                  {style.label}
                </span>
              ) : null
            })}
          </div>
          <span className="font-semibold text-white truncate">{deck.name}</span>
          <span className="hidden sm:block text-xs text-[var(--muted)] shrink-0">{deck.archetype}</span>
        </div>
        <div className="flex items-center gap-4 shrink-0 ml-3">
          <span className="text-sm font-semibold text-[var(--accent)]">{deck.winRate}</span>
          <svg
            className={`h-4 w-4 text-[var(--muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--card-border)] px-5 py-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                {lang === 'fr' ? 'Deck principal' : 'Mainboard'}{' '}
                <span className="text-[var(--accent)]">({mainTotal})</span>
              </p>
              <div className="space-y-1">
                {deck.mainboard.map((card, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-5 shrink-0 text-right font-bold text-[var(--accent)]">
                      {card.quantity}
                    </span>
                    <a
                      href={`/${lang}/cards/${game}?q=${encodeURIComponent(card.name)}`}
                      className="text-white hover:text-[var(--accent-hover)] transition-colors truncate"
                    >
                      {card.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {deck.sideboard.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {lang === 'fr' ? 'Sideboard' : 'Sideboard'}{' '}
                  <span className="text-[var(--accent)]">({sideTotal})</span>
                </p>
                <div className="space-y-1">
                  {deck.sideboard.map((card, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-5 shrink-0 text-right font-bold text-[var(--muted)]">
                        {card.quantity}
                      </span>
                      <a
                        href={`/${lang}/cards/${game}?q=${encodeURIComponent(card.name)}`}
                        className="text-[var(--muted)] hover:text-white transition-colors truncate"
                      >
                        {card.name}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
