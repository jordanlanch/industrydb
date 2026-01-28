# IndustryDB Internationalization (i18n) Setup Guide

## Overview

IndustryDB now supports 3 languages:
- 🇺🇸 English (en) - Default
- 🇪🇸 Español (es)
- 🇫🇷 Français (fr)

## Installation Required

⚠️ **IMPORTANT**: First, fix node_modules permissions and install next-intl:

```bash
# Fix permissions
sudo chown -R $USER:$USER /home/jordanlanch/work/sideProjects/industrydb/frontend/node_modules

# Install next-intl
cd frontend
npm install next-intl
```

## Files Created

### Configuration Files
- `i18n.ts` - Main i18n configuration
- `middleware.ts` - Locale detection and routing
- `next.config.js` - Updated with next-intl plugin

### Translation Files
- `messages/en.json` - English translations
- `messages/es.json` - Spanish translations
- `messages/fr.json` - French translations

### Components
- `src/components/language-switcher.tsx` - Language selector component
- `src/components/footer.tsx` - Updated with language switcher

## Project Structure Changes Needed

### Before (Current):
```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── dashboard/
│   ├── leads/page.tsx
│   └── settings/page.tsx
└── layout.tsx
```

### After (Required):
```
src/app/
├── [locale]/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── leads/page.tsx
│   │   └── settings/page.tsx
│   └── layout.tsx (with NextIntlClientProvider)
└── layout.tsx (root layout, kept separate)
```

## Migration Steps

### 1. Create [locale] Directory Structure

```bash
cd src/app
mkdir -p [locale]
```

### 2. Move Existing Pages

```bash
# Move all app routes into [locale] directory
mv (auth) [locale]/
mv dashboard [locale]/
mv onboarding [locale]/
mv admin [locale]/
# Keep root page.tsx separate for now
```

### 3. Create Locale Layout

Create `src/app/[locale]/layout.tsx`:

```tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '../../i18n';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

### 4. Update Root Layout

Update `src/app/layout.tsx` to NOT wrap with NextIntlClientProvider (it's now in [locale]/layout.tsx):

```tsx
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/toast-provider';
import { Footer } from '@/components/footer';
import { SkipLink } from '@/components/skip-link';
import { ErrorBoundary } from '@/components/error-boundary';
import { CookieBanner } from '@/components/cookie-consent';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'IndustryDB',
  description: 'Industry-specific business data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <SkipLink />
        <ErrorBoundary>
          <ToastProvider>
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <CookieBanner />
            <Toaster />
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

## Usage in Pages

### Import useTranslations Hook

```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('auth.login');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      <button>{t('submit')}</button>
    </div>
  );
}
```

### Common Translations

```tsx
// For common words
const t = useTranslations('common');
<button>{t('save')}</button>
<button>{t('cancel')}</button>

// For navigation
const t = useTranslations('nav');
<Link href="/dashboard">{t('dashboard')}</Link>

// For errors
const t = useTranslations('errors');
<p>{t('generic')}</p>
```

### With Parameters

```tsx
const t = useTranslations('dashboard.usage');
<p>{t('remaining', { count: 42 })}</p>
```

### Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export default async function ServerPage() {
  const t = await getTranslations('leads');

  return <h1>{t('title')}</h1>;
}
```

## Translation Keys Structure

All translation keys are organized in a hierarchical structure:

```
common.*         - Common words (save, cancel, error, etc.)
nav.*            - Navigation items
auth.login.*     - Login page
auth.register.*  - Registration page
landing.*        - Landing page sections
dashboard.*      - Dashboard pages
leads.*          - Leads search page
exports.*        - Exports page
settings.*       - Settings page
admin.*          - Admin dashboard
errors.*         - Error messages
```

## Language Switcher

The LanguageSwitcher component is already integrated in the Footer. Users can change language from any page.

Location: Bottom left of footer, next to copyright notice.

## URL Structure

After migration, URLs will be:
- `/` or `/en` - English (default)
- `/es` - Spanish
- `/fr` - French

The middleware automatically detects browser language and redirects accordingly.

## Testing

### Test Language Switching
1. Start dev server: `npm run dev`
2. Visit `http://localhost:3001`
3. Scroll to footer
4. Click language switcher
5. Select different language
6. Verify page content changes

### Test URL Routing
- `/en/dashboard/leads` - English leads page
- `/es/dashboard/leads` - Spanish leads page
- `/fr/dashboard/leads` - French leads page

## Pages to Translate (Priority Order)

### High Priority
1. ✅ Landing page (`/page.tsx`)
2. ✅ Login (`(auth)/login/page.tsx`)
3. ✅ Register (`(auth)/register/page.tsx`)
4. ✅ Dashboard (`dashboard/page.tsx`)
5. ✅ Leads (`dashboard/leads/page.tsx`)

### Medium Priority
6. Settings (`dashboard/settings/page.tsx`)
7. Exports (`dashboard/exports/page.tsx`)
8. Admin (`admin/page.tsx`)

### Low Priority
9. Privacy Policy (`privacy/page.tsx`)
10. Terms of Service (`terms/page.tsx`)
11. Onboarding (`onboarding/page.tsx`)

## Translation File Maintenance

### Adding New Keys
1. Add to `messages/en.json` (source of truth)
2. Translate to `messages/es.json`
3. Translate to `messages/fr.json`

### Example
```json
// en.json
"newFeature": {
  "title": "New Feature",
  "description": "This is a new feature"
}

// es.json
"newFeature": {
  "title": "Nueva característica",
  "description": "Esta es una nueva característica"
}

// fr.json
"newFeature": {
  "title": "Nouvelle fonctionnalité",
  "description": "Ceci est une nouvelle fonctionnalité"
}
```

## Common Pitfalls

### 1. Missing Translations
If a key is missing, next-intl will show the key path as text.

**Fix**: Ensure all keys exist in all translation files.

### 2. Component Import Errors
If LanguageSwitcher doesn't work, ensure next-intl is installed.

**Fix**: Run `npm install next-intl`

### 3. Middleware Not Running
If language detection doesn't work, check middleware configuration.

**Fix**: Verify `middleware.ts` is in root of `frontend/` directory.

### 4. Locale Not Found Errors
If you get 404s after migration, check [locale] folder structure.

**Fix**: Ensure all pages are inside `app/[locale]/` directory.

## Status

**Current Status**: Configuration created, installation blocked by permissions.

**Next Steps**:
1. ✅ Fix node_modules permissions
2. ✅ Install next-intl
3. ⏳ Migrate pages to [locale] structure (30 min)
4. ⏳ Update page components to use translations (2-3 hours)
5. ⏳ Test language switching (30 min)

**Total Time Remaining**: ~4 hours after fixing permissions

## Support

For issues or questions:
- Check [next-intl documentation](https://next-intl-docs.vercel.app/)
- Review translation files in `messages/` directory
- Verify middleware configuration

---

**Created**: 2026-01-27
**Status**: Ready for installation and migration
**Languages**: EN, ES, FR
