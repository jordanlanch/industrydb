import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const isProduction = process.env.NODE_ENV === 'production'

export function initSentryClient() {
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 0.5,
  })
}

export function initSentryServer() {
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: isProduction ? 0.1 : 1.0,
  })
}

export function initSentryEdge() {
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: isProduction ? 0.1 : 1.0,
  })
}

export function captureError(error: Error, extra?: Record<string, unknown>) {
  Sentry.captureException(error, { extra })
}

export function setSentryUser(user: { id: number; email: string; name: string } | null) {
  if (!user) {
    Sentry.setUser(null)
    return
  }

  Sentry.setUser({
    id: String(user.id),
    email: user.email,
    username: user.name,
  })
}

export function addSentryBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: 'info' | 'warning' | 'error' = 'info'
) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level,
  })
}
