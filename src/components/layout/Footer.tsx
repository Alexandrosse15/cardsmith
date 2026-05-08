import Link from 'next/link'

interface FooterProps {
  lang: string
}

export default function Footer({ lang }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-[var(--card-border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <p className="text-lg font-bold text-white">
              Card<span className="text-[var(--accent)]">smith</span>
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {lang === 'fr'
                ? 'Prix, meta et actualités TCG.'
                : 'TCG prices, meta and news.'}
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              {lang === 'fr' ? 'Jeux' : 'Games'}
            </p>
            {[
              { href: `/${lang}/cards/magic`, label: 'Magic: The Gathering' },
              { href: `/${lang}/cards/lorcana`, label: 'Disney Lorcana' },
              { href: `/${lang}/cards/lor`, label: 'Legends of Runeterra' },
              { href: `/${lang}/cards/pokemon`, label: 'Pokemon TCG' },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="block py-1 text-sm text-[var(--muted)] hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              {lang === 'fr' ? 'Contenu' : 'Content'}
            </p>
            {[
              { href: `/${lang}/news`, label: lang === 'fr' ? 'Actualités' : 'News' },
              { href: `/${lang}/meta/magic`, label: 'Meta Magic' },
              { href: `/${lang}/meta/lorcana`, label: 'Meta Lorcana' },
              { href: `/${lang}/meta/pokemon`, label: 'Meta Pokemon' },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="block py-1 text-sm text-[var(--muted)] hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Sources</p>
            <p className="text-xs text-[var(--muted)]">
              {lang === 'fr' ? 'Données fournies par' : 'Data provided by'}{' '}
              Scryfall, Lorcast, Riot Games Data Dragon, Pokemon TCG API.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--card-border)] pt-6 text-center text-xs text-[var(--muted)]">
          <p>
            {new Date().getFullYear()} Cardsmith.{' '}
            {lang === 'fr'
              ? 'Cardsmith n\'est pas affilié aux éditeurs des jeux cités.'
              : 'Cardsmith is not affiliated with any game publisher.'}
          </p>
        </div>
      </div>
    </footer>
  )
}
