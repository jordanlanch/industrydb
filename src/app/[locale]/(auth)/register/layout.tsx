import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Sign up for IndustryDB and get 50 free business leads per month. Access verified data for tattoo studios, beauty salons, gyms, and more.',
  openGraph: {
    title: 'Create Account | IndustryDB',
    description: 'Sign up for IndustryDB and get 50 free business leads per month. Access verified data for tattoo studios, beauty salons, gyms, and more.',
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
