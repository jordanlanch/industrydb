import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your IndustryDB account to access verified business leads and industry data.',
  openGraph: {
    title: 'Login | IndustryDB',
    description: 'Sign in to your IndustryDB account to access verified business leads and industry data.',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
