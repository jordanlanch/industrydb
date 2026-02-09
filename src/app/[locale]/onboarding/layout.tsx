import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started',
  description: 'Complete your IndustryDB setup to start accessing verified business leads by industry.',
  openGraph: {
    title: 'Get Started | IndustryDB',
    description: 'Complete your IndustryDB setup to start accessing verified business leads by industry.',
  },
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
