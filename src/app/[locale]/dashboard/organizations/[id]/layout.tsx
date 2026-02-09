import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Organization Details',
  description: 'View and manage your organization settings, members, and subscription on IndustryDB.',
  openGraph: {
    title: 'Organization Details | IndustryDB',
    description: 'View and manage your organization settings, members, and subscription on IndustryDB.',
  },
}

export default function OrganizationDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
