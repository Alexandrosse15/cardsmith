import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '@/dictionaries'
import { getNewsArticle } from '@/lib/content'
import Link from 'next/link'
import { compileMDX } from 'next-mdx-remote/rsc'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  if (!hasLocale(lang)) return {}
  const article = await getNewsArticle(lang as Locale, slug)
  return { title: article?.title ?? slug, description: article?.excerpt }
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang as Locale)
  const article = await getNewsArticle(lang as Locale, slug)
  if (!article) notFound()

  const { content } = await compileMDX({ source: article.content })

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={`/${lang}/news`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {dict.news.title}
      </Link>

      <article>
        <div className="mb-6 flex items-center gap-2">
          {article.game && (
            <span className="rounded-full bg-[var(--accent)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
              {article.game}
            </span>
          )}
          <span className="text-xs text-[var(--muted)]">{article.date}</span>
          <span className="text-xs text-[var(--muted)]">&middot; {article.readingTime} {dict.news.min_read}</span>
        </div>
        <h1 className="mb-8 text-3xl font-bold text-white">{article.title}</h1>
        <div className="prose prose-invert prose-sm max-w-none">
          {content}
        </div>
      </article>
    </div>
  )
}
