import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { CookieBanner } from "@/components/cookie-consent"
import { ToastProvider } from "@/components/toast-provider"
import { Toaster } from "@/components/toaster"
import { SkipLink } from "@/components/skip-link"
import { ErrorBoundary } from "@/components/error-boundary"

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

const inter = Inter({ display: "swap", subsets: ["latin"], preload: true })

export const metadata: Metadata = {
  title: {
    default: "IndustryDB - Industry-Specific Business Data",
    template: "%s | IndustryDB"
  },
  description: "Access verified local business data by industry. Affordable leads for tattoo studios, beauty salons, gyms, and more.",
  keywords: ["business data", "leads", "industry data", "tattoo studios", "beauty salons", "gyms", "restaurants", "b2b data"],
  authors: [{ name: "IndustryDB" }],
  creator: "IndustryDB",
  publisher: "IndustryDB",
  metadataBase: new URL("https://industrydb.io"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://industrydb.io",
    title: "IndustryDB - Industry-Specific Business Data",
    description: "Access verified local business data by industry. Affordable and reliable.",
    siteName: "IndustryDB",
    images: [
      {
        url: "/api/og?title=IndustryDB&subtitle=Industry-specific%20business%20data.%20Verified.%20Affordable.",
        width: 1200,
        height: 630,
        alt: "IndustryDB - Industry-Specific Business Data",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IndustryDB - Industry-Specific Business Data",
    description: "Access verified local business data by industry. Affordable and reliable.",
    images: ["/api/og?title=IndustryDB"],
    creator: "@industrydb",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />

        {/* Preconnect hints for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://js.stripe.com" />
        {process.env.NEXT_PUBLIC_API_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
        )}

        {/* Google Analytics - Consent Mode */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              id="gtag-consent-default"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}

                  // Set default consent to 'denied' (GDPR compliant)
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
        <SkipLink />
        <ErrorBoundary>
          <ToastProvider>
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <CookieBanner />
            <Toaster />
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
