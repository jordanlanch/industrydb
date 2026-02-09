import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Organization Members',
  description: 'Manage team members, roles, and invitations for your IndustryDB organization.',
  openGraph: {
    title: 'Organization Members | IndustryDB',
    description: 'Manage team members, roles, and invitations for your IndustryDB organization.',
  },
}

export default function OrganizationMembersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
