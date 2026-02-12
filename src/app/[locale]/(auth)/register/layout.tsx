import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' })

  return {
    title: t('register.title'),
    description: t('register.description'),
    openGraph: {
      title: t('register.title'),
      description: t('register.description'),
    },
  }
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
