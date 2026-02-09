import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Organization Settings',
  description: 'Configure your organization settings, billing, and subscription on IndustryDB.',
  openGraph: {
    title: 'Organization Settings | IndustryDB',
    description: 'Configure your organization settings, billing, and subscription on IndustryDB.',
  },
}

export default function OrganizationSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
