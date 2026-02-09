import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Organizations',
  description: 'Manage your teams and organizations on IndustryDB.',
  openGraph: {
    title: 'Organizations | IndustryDB',
    description: 'Manage your teams and organizations on IndustryDB.',
  },
}

export default function OrganizationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
