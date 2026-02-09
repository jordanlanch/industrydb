import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Saved Searches',
  description: 'Access your saved search queries for quick lead discovery.',
  openGraph: {
    title: 'Saved Searches | IndustryDB',
    description: 'Access your saved search queries for quick lead discovery.',
  },
}

export default function SavedSearchesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
