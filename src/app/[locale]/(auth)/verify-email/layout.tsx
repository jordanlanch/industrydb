import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' })

  return {
    title: t('verifyEmail.title'),
    description: t('verifyEmail.description'),
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
