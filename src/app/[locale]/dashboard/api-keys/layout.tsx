import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Keys',
  description: 'Manage your API keys for programmatic access to IndustryDB business data.',
  openGraph: {
    title: 'API Keys | IndustryDB',
    description: 'Manage your API keys for programmatic access to IndustryDB business data.',
  },
}

export default function ApiKeysLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
