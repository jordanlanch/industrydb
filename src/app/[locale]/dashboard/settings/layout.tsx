import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your IndustryDB account settings, subscription, and privacy preferences.',
  openGraph: {
    title: 'Settings | IndustryDB',
    description: 'Manage your IndustryDB account settings, subscription, and privacy preferences.',
  },
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
