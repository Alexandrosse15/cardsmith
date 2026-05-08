import Link from 'next/link'
import { getDictionary, hasLocale, type Locale } from '@/dictionaries'
import { notFound } from 'next/navigation'
import { getNewsArticles } from '@/lib/content'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cardsmith - TCG prices & meta',
}

const GAMES = [
  {
    id: 'magic',
    name: 'Magic: The Gathering',
    color: 'from-amber-900/30 to-amber-700/10',
    border: 'border-amber-700/30',
    accent: 'text-amber-400',
  },
  {
    id: 'lorcana',
    name: 'Disney Lorcana',
    color: 'from-blue-900/30 to-blue-700/10',
    border: 'border-blue-700/30',
    accent: 'text-blue-400',
  },
  {
    id: 'lor',
    name: 'Legends of Runeterra',
    color: 'from-red-900/30 to-red-700/10',
    border: 'border-red-700/30',
    accent: 'text-red-400',
  },
  {
    id: 'pokemon',
    name: 'Pokemon TCG',
    color: 'from-yellow-900/30 to-yellow-700/10',
    border: 'border-yellow-700/30',
    accent: 'text-yellow-400',
  },
]

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang as Locale)
  const articles = await getNewsArticles(lang as Locale, 3)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
          {dict.home.hero_title}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-[var(--muted)]">
          {dict.home.hero_subtitle}
        </p>
        <Link
          href={`/${lang}/cards/magic`}
          className="inline-block rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          {dict.home.explore_cards}
        </Link>
      </section>

      <section className="mb-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GAMES.map((game) => (
            <Link
              key={game.id}
              href={`/${lang}/cards/${game.id}`}
              className={`flex flex-col gap-3 rounded-xl border ${game.border} bg-gradient-to-br ${game.color} p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <p className={`text-sm font-semibold uppercase tracking-wider ${game.accent}`}>
                {dict.games[game.id as keyof typeof dict.games]}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {lang === 'fr' ? 'Voir les cartes et les prix' : 'Browse cards and prices'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {articles.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{dict.home.latest_news}</h2>
            <Link href={`/${lang}/news`} className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]">
              {lang === 'fr' ? 'Toutes les actualités' : 'All news'} &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/${lang}/news/${article.slug}`}
                className="flex flex-col gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 transition-all hover:border-[var(--accent)]"
              >
                {article.game && (
                  <span className="w-fit rounded-full bg-[var(--accent)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
                    {article.game}
                  </span>
                )}
                <h3 className="font-semibold text-white">{article.title}</h3>
                <p className="text-sm text-[var(--muted)] line-clamp-2">{article.excerpt}</p>
                <p className="mt-auto text-xs text-[var(--muted)]">
                  {article.date} &middot; {article.readingTime} {dict.news.min_read}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
