import type { Metadata } from 'next'
import { hasLocale, getDictionary, type Locale } from '@/dictionaries'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Analytics } from '@vercel/analytics/next'
import '../globals.css'

export const metadata: Metadata = {
  title: { default: 'Cardsmith', template: '%s | Cardsmith' },
  description: 'TCG card prices, meta analysis and news for Magic, Lorcana, Riftbound and Pokemon TCG.',
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang as Locale)

  return (
    <html lang={lang}>
      <body className="min-h-screen flex flex-col">
        <Navbar lang={lang} t={dict.nav} />
        <main className="flex-1">{children}</main>
        <Footer lang={lang} />
        <Analytics />
      </body>
    </html>
  )
}
