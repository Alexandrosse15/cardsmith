'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavbarProps {
  lang: string
  t: {
    home: string
    cards: string
    news: string
    meta: string
    search: string
  }
}

const GAMES = [
  { id: 'magic', label: 'Magic: The Gathering' },
  { id: 'lorcana', label: 'Disney Lorcana' },
  { id: 'lor', label: 'Legends of Runeterra' },
  { id: 'pokemon', label: 'Pokemon TCG' },
]

export default function Navbar({ lang, t }: NavbarProps) {
  const pathname = usePathname()
  const [cardsOpen, setCardsOpen] = useState(false)
  const [metaOpen, setMetaOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const otherLang = lang === 'fr' ? 'en' : 'fr'
  const switchPath = pathname.replace(`/${lang}`, `/${otherLang}`)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--surface)]/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href={`/${lang}`} className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <Image src="/cardsmith-icon.svg" alt="Cardsmith" width={32} height={32} className="rounded-lg" />
          Card<span className="text-[var(--accent)]">smith</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link
            href={`/${lang}`}
            className="rounded-md px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:text-white"
          >
            {t.home}
          </Link>

          <div className="relative" onMouseEnter={() => setCardsOpen(true)} onMouseLeave={() => setCardsOpen(false)}>
            <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:text-white">
              {t.cards}
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 8L1 3h10z" />
              </svg>
            </button>
            {cardsOpen && (
              <div className="absolute left-0 top-full mt-1 w-52 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] py-1 shadow-xl">
                {GAMES.map((g) => (
                  <Link
                    key={g.id}
                    href={`/${lang}/cards/${g.id}`}
                    className="block px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--card-border)] hover:text-white"
                  >
                    {g.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href={`/${lang}/news`}
            className="rounded-md px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:text-white"
          >
            {t.news}
          </Link>

          <div className="relative" onMouseEnter={() => setMetaOpen(true)} onMouseLeave={() => setMetaOpen(false)}>
            <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:text-white">
              {t.meta}
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 8L1 3h10z" />
              </svg>
            </button>
            {metaOpen && (
              <div className="absolute left-0 top-full mt-1 w-52 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] py-1 shadow-xl">
                {GAMES.map((g) => (
                  <Link
                    key={g.id}
                    href={`/${lang}/meta/${g.id}`}
                    className="block px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--card-border)] hover:text-white"
                  >
                    {g.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={switchPath}
            className="rounded-md border border-[var(--card-border)] px-2 py-1 text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {otherLang.toUpperCase()}
          </Link>
          <button
            className="md:hidden rounded-md p-2 text-[var(--muted)] hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-[var(--card-border)] bg-[var(--surface)] px-4 py-3 md:hidden">
          <Link href={`/${lang}`} className="block py-2 text-sm text-[var(--muted)] hover:text-white">{t.home}</Link>
          <p className="mt-2 text-xs font-semibold uppercase text-[var(--muted)]">{t.cards}</p>
          {GAMES.map((g) => (
            <Link key={g.id} href={`/${lang}/cards/${g.id}`} className="block py-1.5 pl-3 text-sm text-[var(--muted)] hover:text-white">
              {g.label}
            </Link>
          ))}
          <Link href={`/${lang}/news`} className="mt-2 block py-2 text-sm text-[var(--muted)] hover:text-white">{t.news}</Link>
          <p className="mt-2 text-xs font-semibold uppercase text-[var(--muted)]">{t.meta}</p>
          {GAMES.map((g) => (
            <Link key={g.id} href={`/${lang}/meta/${g.id}`} className="block py-1.5 pl-3 text-sm text-[var(--muted)] hover:text-white">
              {g.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
