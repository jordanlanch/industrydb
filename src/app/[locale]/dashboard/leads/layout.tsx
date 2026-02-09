import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Leads',
  description: 'Search and filter verified business leads by industry, country, and data quality. Export to CSV or Excel.',
  openGraph: {
    title: 'Find Leads | IndustryDB',
    description: 'Search and filter verified business leads by industry, country, and data quality.',
  },
}

export default function LeadsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
