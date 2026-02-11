import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "IndustryDB - Verified Business Leads by Industry",
    template: "%s | IndustryDB"
  },
  description: "Access verified local business data by industry. Affordable leads for tattoo studios, beauty salons, gyms, and more.",
  keywords: ["business data", "leads", "industry data", "tattoo studios", "beauty salons", "gyms", "restaurants", "b2b data"],
  authors: [{ name: "IndustryDB" }],
  creator: "IndustryDB",
  publisher: "IndustryDB",
  metadataBase: new URL("https://industrydb.io"),
  openGraph: {
    type: "website",
    url: "https://industrydb.io",
    title: "IndustryDB - Verified Business Leads by Industry",
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
    title: "IndustryDB - Verified Business Leads by Industry",
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
