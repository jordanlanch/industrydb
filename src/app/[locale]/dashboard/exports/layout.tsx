import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Exports',
  description: 'View and download your exported business lead data in CSV or Excel format.',
  openGraph: {
    title: 'Exports | IndustryDB',
    description: 'View and download your exported business lead data in CSV or Excel format.',
  },
}

export default function ExportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
