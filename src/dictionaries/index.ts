import 'server-only'

const dictionaries = {
  fr: () => import('./fr.json').then((m) => m.default),
  en: () => import('./en.json').then((m) => m.default),
}

export type Locale = keyof typeof dictionaries

export const locales: Locale[] = ['fr', 'en']
export const defaultLocale: Locale = 'fr'

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
