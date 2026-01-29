import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'es', 'fr'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Show locale prefix only for non-default locales
  // This allows /login to work (treated as /en/login)
  localePrefix: 'as-needed'
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing);
