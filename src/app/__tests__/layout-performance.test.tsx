/**
 * Tests for performance optimizations in root layout.
 * Verifies preconnect hints, font-display swap, and GA script strategies.
 *
 * @see FE-PERF-001 - Lighthouse performance audit and fixes
 */
import React from 'react'
import fs from 'fs'
import path from 'path'

// Mock next/font/google
let interCallArgs: any = null
jest.mock('next/font/google', () => ({
  Inter: (opts: any) => {
    interCallArgs = opts
    return { className: 'inter-mock' }
  },
}))

// Mock next/script
jest.mock('next/script', () => {
  return function MockScript(props: any) {
    return <script data-testid={`script-${props.id || 'external'}`} />
  }
})

// Mock child components
jest.mock('@/components/cookie-consent', () => ({
  CookieBanner: () => <div data-testid="cookie-banner" />,
}))
jest.mock('@/components/toast-provider', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
jest.mock('@/components/toaster', () => ({
  Toaster: () => <div data-testid="toaster" />,
}))
jest.mock('@/components/skip-link', () => ({
  SkipLink: () => <div data-testid="skip-link" />,
}))
jest.mock('@/components/error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('Root Layout - Performance Optimizations', () => {
  describe('Font Configuration', () => {
    it('configures Inter font with display swap for faster rendering', () => {
      // Force module evaluation which triggers the Inter() call
      require('../layout')

      expect(interCallArgs).toBeDefined()
      expect(interCallArgs).toEqual(
        expect.objectContaining({
          display: 'swap',
          subsets: ['latin'],
          preload: true,
        })
      )
    })
  })

  describe('Preconnect Hints', () => {
    it('layout source code includes preconnect for fonts.googleapis.com', () => {
      const layoutSource = fs.readFileSync(
        path.join(__dirname, '..', 'layout.tsx'),
        'utf-8'
      )
      expect(layoutSource).toContain('rel="preconnect"')
      expect(layoutSource).toContain('fonts.googleapis.com')
    })

    it('layout source code includes preconnect for fonts.gstatic.com', () => {
      const layoutSource = fs.readFileSync(
        path.join(__dirname, '..', 'layout.tsx'),
        'utf-8'
      )
      expect(layoutSource).toContain('fonts.gstatic.com')
    })

    it('layout source code includes preconnect for stripe.com', () => {
      const layoutSource = fs.readFileSync(
        path.join(__dirname, '..', 'layout.tsx'),
        'utf-8'
      )
      expect(layoutSource).toContain('js.stripe.com')
    })

    it('layout source code includes preconnect for API URL', () => {
      const layoutSource = fs.readFileSync(
        path.join(__dirname, '..', 'layout.tsx'),
        'utf-8'
      )
      expect(layoutSource).toContain('NEXT_PUBLIC_API_URL')
      expect(layoutSource).toContain('preconnect')
    })
  })

  describe('GA Script Strategy', () => {
    it('uses lazyOnload strategy for GA scripts instead of beforeInteractive', () => {
      const layoutSource = fs.readFileSync(
        path.join(__dirname, '..', 'layout.tsx'),
        'utf-8'
      )
      // Should NOT use beforeInteractive (blocks rendering)
      expect(layoutSource).not.toContain('"beforeInteractive"')
      // Should use lazyOnload for non-essential analytics
      expect(layoutSource).toContain('"lazyOnload"')
    })

    it('uses afterInteractive for consent default script', () => {
      const layoutSource = fs.readFileSync(
        path.join(__dirname, '..', 'layout.tsx'),
        'utf-8'
      )
      // Consent default should run after hydration but before analytics
      expect(layoutSource).toContain('"afterInteractive"')
    })
  })

  describe('Metadata', () => {
    it('exports metadata with correct title template', async () => {
      const layoutModule = await import('../layout')
      const metadata = (layoutModule as any).metadata

      expect(metadata).toBeDefined()
      expect(metadata.title).toEqual({
        default: 'IndustryDB - Industry-Specific Business Data',
        template: '%s | IndustryDB',
      })
    })

    it('exports metadata with description', async () => {
      const layoutModule = await import('../layout')
      const metadata = (layoutModule as any).metadata

      expect(metadata.description).toContain('verified local business data')
    })

    it('exports metadata with openGraph configuration', async () => {
      const layoutModule = await import('../layout')
      const metadata = (layoutModule as any).metadata

      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph.type).toBe('website')
      expect(metadata.openGraph.images).toBeDefined()
      expect(metadata.openGraph.images).toHaveLength(1)
    })

    it('exports metadata with twitter card configuration', async () => {
      const layoutModule = await import('../layout')
      const metadata = (layoutModule as any).metadata

      expect(metadata.twitter).toBeDefined()
      expect(metadata.twitter.card).toBe('summary_large_image')
    })

    it('exports metadata with SEO robots configuration', async () => {
      const layoutModule = await import('../layout')
      const metadata = (layoutModule as any).metadata

      expect(metadata.robots).toBeDefined()
      expect(metadata.robots.index).toBe(true)
      expect(metadata.robots.follow).toBe(true)
    })
  })
})

describe('CSS Performance', () => {
  it('does not apply transitions to all elements via universal selector', () => {
    const cssSource = fs.readFileSync(
      path.join(__dirname, '..', 'globals.css'),
      'utf-8'
    )

    // The old pattern was: * { transition-property: ... }
    // This should now target specific interactive elements only
    const universalTransitionPattern = /\*\s*\{[^}]*transition-property/
    expect(cssSource).not.toMatch(universalTransitionPattern)

    // Should target specific interactive elements instead
    expect(cssSource).toContain('button,')
    expect(cssSource).toContain('transition-property')
  })
})
