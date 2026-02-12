import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' })

  return {
    title: t('login.title'),
    description: t('login.description'),
    openGraph: {
      title: t('login.title'),
      description: t('login.description'),
    },
  }
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
