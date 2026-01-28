import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// import { Footer } from "@/components/footer" // Temporarily disabled
import { CookieBanner } from "@/components/cookie-consent"
import { ToastProvider } from "@/components/toast-provider"
import { Toaster } from "@/components/toaster"
import { SkipLink } from "@/components/skip-link"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

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
        url: "/og-image.png",
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
    images: ["/og-image.png"],
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
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <SkipLink />
        <ErrorBoundary>
          <ToastProvider>
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            {/* <Footer /> */}
            <CookieBanner />
            <Toaster />
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
