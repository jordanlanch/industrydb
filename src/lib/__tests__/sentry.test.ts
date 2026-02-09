// Mock @sentry/nextjs
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
  init: jest.fn(),
  browserTracingIntegration: jest.fn(() => 'browserTracingIntegration'),
  replayIntegration: jest.fn(() => 'replayIntegration'),
}))

describe('sentry helpers', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  function getSentryMock() {
    return require('@sentry/nextjs') as {
      init: jest.Mock
      captureException: jest.Mock
      setUser: jest.Mock
      addBreadcrumb: jest.Mock
      browserTracingIntegration: jest.Mock
      replayIntegration: jest.Mock
    }
  }

  describe('initSentryClient', () => {
    it('should not call Sentry.init when DSN is empty', () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = ''
      const { initSentryClient } = require('@/lib/sentry')
      const Sentry = getSentryMock()

      initSentryClient()

      expect(Sentry.init).not.toHaveBeenCalled()
    })

    it('should not call Sentry.init when DSN is undefined', () => {
      delete process.env.NEXT_PUBLIC_SENTRY_DSN
      const { initSentryClient } = require('@/lib/sentry')
      const Sentry = getSentryMock()

      initSentryClient()

      expect(Sentry.init).not.toHaveBeenCalled()
    })

    it('should call Sentry.init with correct config when DSN is provided', () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'production'
      const { initSentryClient } = require('@/lib/sentry')
      const Sentry = getSentryMock()

      initSentryClient()

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
          tracesSampleRate: 0.1,
          replaysSessionSampleRate: 0.01,
          replaysOnErrorSampleRate: 0.5,
        })
      )
    })

    it('should use higher sample rate in development', () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'development'
      const { initSentryClient } = require('@/lib/sentry')
      const Sentry = getSentryMock()

      initSentryClient()

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 1.0,
        })
      )
    })

    it('should include browser tracing and replay integrations', () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      const { initSentryClient } = require('@/lib/sentry')
      const Sentry = getSentryMock()

      initSentryClient()

      expect(Sentry.browserTracingIntegration).toHaveBeenCalled()
      expect(Sentry.replayIntegration).toHaveBeenCalledWith({
        maskAllText: true,
        blockAllMedia: true,
      })
    })
  })

  describe('initSentryServer', () => {
    it('should not call Sentry.init when DSN is empty', () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = ''
      const { initSentryServer } = require('@/lib/sentry')
      const Sentry = getSentryMock()

      initSentryServer()

      expect(Sentry.init).not.toHaveBeenCalled()
    })

    it('should call Sentry.init with server config when DSN is provided', () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'production'
      const { initSentryServer } = require('@/lib/sentry')
      const Sentry = getSentryMock()

      initSentryServer()

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
          tracesSampleRate: 0.1,
        })
      )
    })
  })

  describe('initSentryEdge', () => {
    it('should not call Sentry.init when DSN is empty', () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = ''
      const { initSentryEdge } = require('@/lib/sentry')
      const Sentry = getSentryMock()

      initSentryEdge()

      expect(Sentry.init).not.toHaveBeenCalled()
    })

    it('should call Sentry.init with edge config when DSN is provided', () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      process.env.NODE_ENV = 'production'
      const { initSentryEdge } = require('@/lib/sentry')
      const Sentry = getSentryMock()

      initSentryEdge()

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
          tracesSampleRate: 0.1,
        })
      )
    })
  })

  describe('captureError', () => {
    it('should call Sentry.captureException with error and extra context', () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      const { captureError } = require('@/lib/sentry')
      const Sentry = getSentryMock()

      const error = new Error('Test error')
      const extra = { componentStack: '<App>' }

      captureError(error, extra)

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: { componentStack: '<App>' },
      })
    })

    it('should call Sentry.captureException without extra when not provided', () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
      const { captureError } = require('@/lib/sentry')
      const Sentry = getSentryMock()

      const error = new Error('Test error')

      captureError(error)

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: undefined,
      })
    })
  })

  describe('setSentryUser', () => {
    it('should call Sentry.setUser with user data', () => {
      const { setSentryUser } = require('@/lib/sentry')
      const Sentry = getSentryMock()

      setSentryUser({ id: 1, email: 'test@example.com', name: 'Test' })

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: '1',
        email: 'test@example.com',
        username: 'Test',
      })
    })

    it('should call Sentry.setUser with null to clear user', () => {
      const { setSentryUser } = require('@/lib/sentry')
      const Sentry = getSentryMock()

      setSentryUser(null)

      expect(Sentry.setUser).toHaveBeenCalledWith(null)
    })
  })

  describe('addSentryBreadcrumb', () => {
    it('should call Sentry.addBreadcrumb with correct data', () => {
      const { addSentryBreadcrumb } = require('@/lib/sentry')
      const Sentry = getSentryMock()

      addSentryBreadcrumb('navigation', 'User searched for leads', {
        industry: 'tattoo',
        country: 'US',
      })

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'navigation',
        message: 'User searched for leads',
        data: { industry: 'tattoo', country: 'US' },
        level: 'info',
      })
    })

    it('should accept custom severity level', () => {
      const { addSentryBreadcrumb } = require('@/lib/sentry')
      const Sentry = getSentryMock()

      addSentryBreadcrumb('auth', 'Login failed', { reason: 'invalid password' }, 'warning')

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'auth',
        message: 'Login failed',
        data: { reason: 'invalid password' },
        level: 'warning',
      })
    })
  })
})
