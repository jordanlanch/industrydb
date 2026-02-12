import type { Metadata } from 'next';
import { Inter } from "next/font/google"
import Script from "next/script"
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';
import { CookieBanner } from "@/components/cookie-consent"
import { ToastProvider } from "@/components/toast-provider"
import { Toaster } from "@/components/toaster"
import { SkipLink } from "@/components/skip-link"
import { ErrorBoundary } from "@/components/error-boundary"
import { WebVitals } from "@/components/web-vitals"

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

const inter = Inter({ display: "swap", subsets: ["latin"], preload: true })

const localeToOgLocale: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  fr: 'fr_FR',
};

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });

  const baseUrl = 'https://industrydb.io';
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${baseUrl}/${loc}`;
  }
  languages['x-default'] = `${baseUrl}/en`;

  return {
    title: t('home.title'),
    description: t('home.description'),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages,
    },
    openGraph: {
      type: 'website',
      url: `${baseUrl}/${locale}`,
      title: t('home.title'),
      description: t('home.description'),
      siteName: 'IndustryDB',
      locale: localeToOgLocale[locale] || 'en_US',
      alternateLocale: Object.values(localeToOgLocale).filter(l => l !== (localeToOgLocale[locale] || 'en_US')),
      images: [
        {
          url: '/api/og?title=IndustryDB&subtitle=Industry-specific%20business%20data.%20Verified.%20Affordable.',
          width: 1200,
          height: 630,
          alt: 'IndustryDB - Industry-Specific Business Data',
        },
      ],
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />

        <link rel="dns-prefetch" href="https://api.industrydb.io" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://js.stripe.com" />
        {process.env.NEXT_PUBLIC_API_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
        )}

        {GA_MEASUREMENT_ID && (
          <>
            <Script
              id="gtag-consent-default"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('consent', 'default', {
                    'analytics_storage': 'denied'
                  });
                `,
              }}
            />
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="lazyOnload"
            />
            <Script
              id="gtag-init"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen overflow-x-hidden`}>
        <WebVitals />
        <SkipLink />
        <ErrorBoundary>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ToastProvider>
              <main id="main-content" className="flex-1" tabIndex={-1}>
                {children}
              </main>
              <CookieBanner />
              <Toaster />
            </ToastProvider>
          </NextIntlClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
