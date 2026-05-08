import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import type { Locale } from '@/dictionaries'

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content')

export interface ArticleMeta {
  slug: string
  title: string
  excerpt: string
  date: string
  game?: string
  readingTime: string
  lang: Locale
}

export interface Article extends ArticleMeta {
  content: string
}

function getArticlesDir(lang: Locale, type: 'news' | 'meta') {
  return path.join(CONTENT_DIR, type, lang)
}

export async function getNewsArticles(lang: Locale, limit?: number): Promise<ArticleMeta[]> {
  const dir = getArticlesDir(lang, 'news')
  if (!fs.existsSync(dir)) return []

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))

  const articles = files.map((file) => {
    const slug = file.replace(/\.(mdx|md)$/, '')
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
    const { data, content } = matter(raw)
    const rt = readingTime(content)
    return {
      slug,
      title: data.title ?? slug,
      excerpt: data.excerpt ?? '',
      date: data.date ?? '',
      game: data.game,
      readingTime: Math.ceil(rt.minutes).toString(),
      lang,
    } satisfies ArticleMeta
  })

  const sorted = articles.sort((a, b) => (a.date < b.date ? 1 : -1))
  return limit ? sorted.slice(0, limit) : sorted
}

export async function getNewsArticle(lang: Locale, slug: string): Promise<Article | null> {
  const dir = getArticlesDir(lang, 'news')
  const filePath = path.join(dir, `${slug}.mdx`)
  const fallback = path.join(dir, `${slug}.md`)
  const target = fs.existsSync(filePath) ? filePath : fs.existsSync(fallback) ? fallback : null
  if (!target) return null

  const raw = fs.readFileSync(target, 'utf-8')
  const { data, content } = matter(raw)
  const rt = readingTime(content)
  return {
    slug,
    title: data.title ?? slug,
    excerpt: data.excerpt ?? '',
    date: data.date ?? '',
    game: data.game,
    readingTime: Math.ceil(rt.minutes).toString(),
    lang,
    content,
  }
}
