import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

const locales = ['en', 'es', 'fr'];

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  const baseUrl = 'https://industrydb.io';

  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${baseUrl}/${loc}/pricing`;
  }
  languages['x-default'] = `${baseUrl}/en/pricing`;

  return {
    title: t('pricing.title'),
    description: t('pricing.description'),
    alternates: {
      canonical: `${baseUrl}/${locale}/pricing`,
      languages,
    },
  };
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
