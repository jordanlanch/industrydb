import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - /api routes
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - All files (have a dot)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
