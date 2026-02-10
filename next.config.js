const { withSentryConfig } = require('@sentry/nextjs');
const withNextIntl = require('next-intl/plugin')(
  // Specify the path to the request config
  './src/i18n/request.ts'
);
const { getSecurityHeaders } = require('./src/config/security-headers');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',

  // Skip type checking during build (types checked in CI separately)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Security headers for all routes + caching headers for static assets
  async headers() {
    return [
      {
        source: '/:path*',
        headers: getSecurityHeaders(),
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

}

const sentryWebpackPluginOptions = {
  // Upload source maps in production only
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
}

// Only wrap with Sentry if DSN is configured
const configWithIntl = withNextIntl(nextConfig)

module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(configWithIntl, sentryWebpackPluginOptions)
  : configWithIntl
