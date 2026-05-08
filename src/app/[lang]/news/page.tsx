import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '@/dictionaries'
import { getNewsArticles } from '@/lib/content'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'News' }

export default async function NewsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang as Locale)
  const articles = await getNewsArticles(lang as Locale)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{dict.news.title}</h1>
        <p className="mt-2 text-[var(--muted)]">{dict.news.subtitle}</p>
      </div>

      {articles.length === 0 ? (
        <p className="text-center py-20 text-[var(--muted)]">
          {lang === 'fr' ? 'Aucun article pour l\'instant.' : 'No articles yet.'}
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/${lang}/news/${article.slug}`}
              className="group flex flex-col gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 transition-all hover:border-[var(--accent)]"
            >
              <div className="flex items-center gap-2">
                {article.game && (
                  <span className="rounded-full bg-[var(--accent)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
                    {article.game}
                  </span>
                )}
                <span className="text-xs text-[var(--muted)]">{article.date}</span>
                <span className="text-xs text-[var(--muted)]">&middot; {article.readingTime} {dict.news.min_read}</span>
              </div>
              <h2 className="text-lg font-semibold text-white group-hover:text-[var(--accent-hover)] transition-colors">
                {article.title}
              </h2>
              <p className="text-sm text-[var(--muted)] line-clamp-2">{article.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
