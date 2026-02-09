import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User Management',
  description: 'Manage platform users, subscriptions, and roles on IndustryDB admin panel.',
  openGraph: {
    title: 'User Management | IndustryDB Admin',
    description: 'Manage platform users, subscriptions, and roles on IndustryDB admin panel.',
  },
}

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
