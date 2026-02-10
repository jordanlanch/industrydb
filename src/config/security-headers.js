/**
 * Security headers for all routes in next.config.js.
 *
 * Environment-aware:
 *  - HSTS is only added in production (NEXT_PUBLIC_APP_ENV or NODE_ENV).
 *  - CSP includes 'unsafe-eval' only in development (needed by Next.js HMR/Fast Refresh).
 */
function getSecurityHeaders() {
  const isProduction =
    process.env.NEXT_PUBLIC_APP_ENV === 'production' ||
    (process.env.NEXT_PUBLIC_APP_ENV === undefined &&
      process.env.NODE_ENV === 'production')

  const isDev = !isProduction

  // 'unsafe-eval' is required by Next.js dev mode for Hot Module Replacement
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com"
    : "script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com"

  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self'",
    `connect-src 'self' https://api.stripe.com https://www.google-analytics.com ${isDev ? 'http://localhost:7890' : 'https://api.industrydb.io'}`,
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "base-uri 'self'",
  ].join('; ')

  const headers = [
    // Prevents browsers from MIME-type sniffing a response away from the declared content-type
    { key: 'X-Content-Type-Options', value: 'nosniff' },

    // Prevents the page from being rendered in an iframe — protects against clickjacking
    { key: 'X-Frame-Options', value: 'DENY' },

    // Enables the browser's built-in XSS filter; blocks the page if an attack is detected
    { key: 'X-XSS-Protection', value: '1; mode=block' },

    // Controls how much referrer information is sent with requests to other origins
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

    // Restricts access to browser features: disables camera, mic, geolocation; allows Stripe payment
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
    },

    // Restricts which origins can load resources — primary defense against XSS, data injection, etc.
    { key: 'Content-Security-Policy', value: csp },
  ]

  if (isProduction) {
    // Forces HTTPS for 2 years, including all subdomains, and opts in to browser preload list
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    })
  }

  return headers
}

module.exports = { getSecurityHeaders }
