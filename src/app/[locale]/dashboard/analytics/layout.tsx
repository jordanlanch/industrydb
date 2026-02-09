import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Track your lead search usage, export history, and account analytics.',
  openGraph: {
    title: 'Analytics | IndustryDB',
    description: 'Track your lead search usage, export history, and account analytics.',
  },
}

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
