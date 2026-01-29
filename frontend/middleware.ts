import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always show the locale in the URL
  localePrefix: 'as-needed',
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - /api routes
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - Static files (images, etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
