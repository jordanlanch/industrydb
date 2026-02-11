import { MetadataRoute } from 'next'

const locales = ['en', 'es', 'fr']

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://industrydb.io'

  const pages = [
    { path: '', changeFrequency: 'weekly' as const, priority: 1 },
    { path: '/pricing', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/login', changeFrequency: 'yearly' as const, priority: 0.4 },
    { path: '/register', changeFrequency: 'yearly' as const, priority: 0.5 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  const entries: MetadataRoute.Sitemap = []

  for (const page of pages) {
    for (const locale of locales) {
      const alternates: Record<string, string> = {}
      for (const altLocale of locales) {
        alternates[altLocale] = `${baseUrl}/${altLocale}${page.path}`
      }

      entries.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: alternates,
        },
      })
    }
  }

  return entries
}
