import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Industries',
  description: 'Browse verified business data across 20+ industries including tattoo studios, beauty salons, gyms, restaurants, and more.',
  openGraph: {
    title: 'Industries | IndustryDB',
    description: 'Browse verified business data across 20+ industries including tattoo studios, beauty salons, gyms, restaurants, and more.',
  },
}

export default function IndustriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
