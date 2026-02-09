const { getSecurityHeaders } = require('../security-headers')

describe('getSecurityHeaders', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns an array of header objects', () => {
    const headers = getSecurityHeaders()
    expect(Array.isArray(headers)).toBe(true)
    headers.forEach((h) => {
      expect(h).toHaveProperty('key')
      expect(h).toHaveProperty('value')
    })
  })

  // X-Content-Type-Options prevents MIME-type sniffing
  it('includes X-Content-Type-Options: nosniff', () => {
    const headers = getSecurityHeaders()
    const header = headers.find((h) => h.key === 'X-Content-Type-Options')
    expect(header).toBeDefined()
    expect(header!.value).toBe('nosniff')
  })

  // X-Frame-Options prevents clickjacking by disabling iframes
  it('includes X-Frame-Options: DENY', () => {
    const headers = getSecurityHeaders()
    const header = headers.find((h) => h.key === 'X-Frame-Options')
    expect(header).toBeDefined()
    expect(header!.value).toBe('DENY')
  })

  // X-XSS-Protection enables browser-level XSS filtering
  it('includes X-XSS-Protection: 1; mode=block', () => {
    const headers = getSecurityHeaders()
    const header = headers.find((h) => h.key === 'X-XSS-Protection')
    expect(header).toBeDefined()
    expect(header!.value).toBe('1; mode=block')
  })

  // Referrer-Policy controls how much referrer info is sent with requests
  it('includes Referrer-Policy: strict-origin-when-cross-origin', () => {
    const headers = getSecurityHeaders()
    const header = headers.find((h) => h.key === 'Referrer-Policy')
    expect(header).toBeDefined()
    expect(header!.value).toBe('strict-origin-when-cross-origin')
  })

  // Permissions-Policy restricts browser feature access
  it('includes Permissions-Policy restricting camera, mic, geolocation; allowing payment for self', () => {
    const headers = getSecurityHeaders()
    const header = headers.find((h) => h.key === 'Permissions-Policy')
    expect(header).toBeDefined()
    expect(header!.value).toBe(
      'camera=(), microphone=(), geolocation=(), payment=(self)'
    )
  })

  // Content-Security-Policy restricts resource loading origins
  it('includes Content-Security-Policy with required directives', () => {
    const headers = getSecurityHeaders()
    const header = headers.find((h) => h.key === 'Content-Security-Policy')
    expect(header).toBeDefined()
    const csp = header!.value

    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain('https://js.stripe.com')
    expect(csp).toContain('https://www.googletagmanager.com')
    expect(csp).toContain("style-src 'self' 'unsafe-inline'")
    expect(csp).toContain("img-src 'self' data: https: blob:")
    expect(csp).toContain("font-src 'self'")
    expect(csp).toContain('https://api.stripe.com')
    expect(csp).toContain('https://www.google-analytics.com')
    expect(csp).toContain('http://localhost:7890')
    expect(csp).toContain('https://js.stripe.com')
    expect(csp).toContain('https://hooks.stripe.com')
    expect(csp).toContain("base-uri 'self'")
  })

  describe('environment-aware behavior', () => {
    // HSTS enforces HTTPS connections - only safe for production
    it('includes Strict-Transport-Security in production', () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'production'
      const headers = getSecurityHeaders()
      const header = headers.find(
        (h) => h.key === 'Strict-Transport-Security'
      )
      expect(header).toBeDefined()
      expect(header!.value).toBe(
        'max-age=63072000; includeSubDomains; preload'
      )
    })

    it('includes Strict-Transport-Security when NODE_ENV is production and NEXT_PUBLIC_APP_ENV is not set', () => {
      delete process.env.NEXT_PUBLIC_APP_ENV
      process.env.NODE_ENV = 'production'
      const headers = getSecurityHeaders()
      const header = headers.find(
        (h) => h.key === 'Strict-Transport-Security'
      )
      expect(header).toBeDefined()
    })

    it('does NOT include Strict-Transport-Security in development', () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'development'
      process.env.NODE_ENV = 'development'
      const headers = getSecurityHeaders()
      const header = headers.find(
        (h) => h.key === 'Strict-Transport-Security'
      )
      expect(header).toBeUndefined()
    })

    // In development, CSP includes 'unsafe-eval' needed by Next.js HMR
    it('includes unsafe-eval in script-src during development', () => {
      process.env.NODE_ENV = 'development'
      delete process.env.NEXT_PUBLIC_APP_ENV
      const headers = getSecurityHeaders()
      const header = headers.find((h) => h.key === 'Content-Security-Policy')
      expect(header!.value).toContain("'unsafe-eval'")
    })

    it('does NOT include unsafe-eval in script-src during production', () => {
      process.env.NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_APP_ENV = 'production'
      const headers = getSecurityHeaders()
      const header = headers.find((h) => h.key === 'Content-Security-Policy')
      expect(header!.value).not.toContain("'unsafe-eval'")
    })
  })

  it('returns exactly the expected number of headers in production', () => {
    process.env.NEXT_PUBLIC_APP_ENV = 'production'
    process.env.NODE_ENV = 'production'
    const headers = getSecurityHeaders()
    // 7 headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection,
    // Referrer-Policy, Strict-Transport-Security, Permissions-Policy, CSP
    expect(headers).toHaveLength(7)
  })

  it('returns 6 headers in development (no HSTS)', () => {
    process.env.NEXT_PUBLIC_APP_ENV = 'development'
    process.env.NODE_ENV = 'development'
    const headers = getSecurityHeaders()
    expect(headers).toHaveLength(6)
  })
})
