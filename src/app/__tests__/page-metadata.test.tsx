/**
 * Tests for page-level metadata exports.
 * Ensures all key pages have proper SEO metadata via their layout files.
 *
 * @see FE-PERF-001 - Lighthouse performance audit and fixes
 */
describe('Page Metadata - Auth Pages', () => {
  it('login layout exports metadata with title', async () => {
    const module = await import('../[locale]/(auth)/login/layout')
    const metadata = (module as any).metadata

    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Login')
    expect(metadata.description).toBeTruthy()
    expect(metadata.description).toContain('IndustryDB')
  })

  it('login layout exports openGraph metadata', async () => {
    const module = await import('../[locale]/(auth)/login/layout')
    const metadata = (module as any).metadata

    expect(metadata.openGraph).toBeDefined()
    expect(metadata.openGraph.title).toContain('Login')
  })

  it('register layout exports metadata with title', async () => {
    const module = await import('../[locale]/(auth)/register/layout')
    const metadata = (module as any).metadata

    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Create Account')
    expect(metadata.description).toContain('free business leads')
  })

  it('register layout exports openGraph metadata', async () => {
    const module = await import('../[locale]/(auth)/register/layout')
    const metadata = (module as any).metadata

    expect(metadata.openGraph).toBeDefined()
    expect(metadata.openGraph.title).toContain('Create Account')
  })

  it('forgot-password layout exports metadata with noindex', async () => {
    const module = await import('../[locale]/(auth)/forgot-password/layout')
    const metadata = (module as any).metadata

    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Forgot Password')
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })

  it('verify-email layout exports metadata with noindex', async () => {
    const module = await import('../[locale]/(auth)/verify-email/layout')
    const metadata = (module as any).metadata

    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Verify Email')
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })

  it('reset-password layout exports metadata with noindex', async () => {
    const module = await import('../[locale]/(auth)/reset-password/layout')
    const metadata = (module as any).metadata

    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Reset Password')
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })
})

describe('Page Metadata - Dashboard Pages', () => {
  it('leads layout exports metadata with title', async () => {
    const module = await import('../[locale]/dashboard/leads/layout')
    const metadata = (module as any).metadata

    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Find Leads')
    expect(metadata.description).toContain('business leads')
  })

  it('leads layout exports openGraph metadata', async () => {
    const module = await import('../[locale]/dashboard/leads/layout')
    const metadata = (module as any).metadata

    expect(metadata.openGraph).toBeDefined()
    expect(metadata.openGraph.title).toContain('Find Leads')
  })

  it('exports layout exports metadata with title', async () => {
    const module = await import('../[locale]/dashboard/exports/layout')
    const metadata = (module as any).metadata

    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Exports')
    expect(metadata.description).toContain('exported')
  })

  it('analytics layout exports metadata with title', async () => {
    const module = await import('../[locale]/dashboard/analytics/layout')
    const metadata = (module as any).metadata

    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Analytics')
    expect(metadata.description).toContain('usage')
  })

  it('settings layout exports metadata with title', async () => {
    const module = await import('../[locale]/dashboard/settings/layout')
    const metadata = (module as any).metadata

    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Settings')
    expect(metadata.description).toContain('account settings')
  })

  it('api-keys layout exports metadata with title', async () => {
    const module = await import('../[locale]/dashboard/api-keys/layout')
    const metadata = (module as any).metadata

    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('API Keys')
    expect(metadata.description).toContain('API keys')
  })

  it('saved-searches layout exports metadata with title', async () => {
    const module = await import('../[locale]/dashboard/saved-searches/layout')
    const metadata = (module as any).metadata

    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Saved Searches')
    expect(metadata.description).toContain('saved search')
  })

  it('organizations layout exports metadata with title', async () => {
    const module = await import('../[locale]/dashboard/organizations/layout')
    const metadata = (module as any).metadata

    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Organizations')
    expect(metadata.description).toContain('teams')
  })
})

describe('Page Metadata - Locale Layout', () => {
  it('locale layout exports metadata with title template', async () => {
    // Mock the dependencies
    jest.mock('next-intl', () => ({
      NextIntlClientProvider: ({ children }: any) => children,
    }))
    jest.mock('next-intl/server', () => ({
      getMessages: jest.fn().mockResolvedValue({}),
    }))
    jest.mock('next/navigation', () => ({
      notFound: jest.fn(),
    }))
    jest.mock('@/i18n', () => ({
      locales: ['en', 'es', 'fr'],
    }))

    const module = await import('../[locale]/layout')
    const metadata = (module as any).metadata

    expect(metadata).toBeDefined()
    expect(metadata.title).toEqual({
      default: 'IndustryDB - Industry-Specific Business Data',
      template: '%s | IndustryDB',
    })
    expect(metadata.description).toContain('verified local business data')
  })
})

describe('Layout Components - Render children', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { render } = require('@testing-library/react')

  it('login layout passes children through', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: LoginLayout } = require('../[locale]/(auth)/login/layout')

    const { container } = render(
      <LoginLayout>
        <div data-testid="child">Test</div>
      </LoginLayout>
    )

    expect(container.querySelector('[data-testid="child"]')).toBeTruthy()
  })

  it('leads layout passes children through', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: LeadsLayout } = require('../[locale]/dashboard/leads/layout')

    const { container } = render(
      <LeadsLayout>
        <div data-testid="child">Test</div>
      </LeadsLayout>
    )

    expect(container.querySelector('[data-testid="child"]')).toBeTruthy()
  })

  it('auth layout passes children through', () => {
    // Mock LanguageSwitcher to avoid useLocale issues
    jest.mock('@/components/language-switcher', () => ({
      LanguageSwitcher: () => <div>LanguageSwitcher</div>,
    }))

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: AuthLayout } = require('../[locale]/(auth)/layout')

    const { container } = render(
      <AuthLayout>
        <div data-testid="child">Test</div>
      </AuthLayout>
    )

    expect(container.querySelector('[data-testid="child"]')).toBeTruthy()
  })
})
