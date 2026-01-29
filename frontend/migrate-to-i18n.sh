#!/bin/bash

# IndustryDB i18n Migration Script
# This script migrates the existing app structure to support internationalization

set -e  # Exit on error

echo "🌍 IndustryDB i18n Migration Script"
echo "===================================="
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run this script from the frontend/ directory"
    exit 1
fi

# Check if next-intl is installed
if ! grep -q "next-intl" package.json; then
    echo "⚠️  Warning: next-intl is not installed"
    echo "   Run: npm install next-intl"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📁 Creating [locale] directory structure..."
mkdir -p src/app/[locale]

echo "📦 Moving existing routes to [locale]..."

# Move auth routes
if [ -d "src/app/(auth)" ]; then
    echo "  - Moving (auth)/"
    mv src/app/\(auth\) src/app/[locale]/
fi

# Move dashboard routes
if [ -d "src/app/dashboard" ]; then
    echo "  - Moving dashboard/"
    mv src/app/dashboard src/app/[locale]/
fi

# Move onboarding
if [ -d "src/app/onboarding" ]; then
    echo "  - Moving onboarding/"
    mv src/app/onboarding src/app/[locale]/
fi

# Move admin
if [ -d "src/app/admin" ]; then
    echo "  - Moving admin/"
    mv src/app/admin src/app/[locale]/
fi

# Move privacy
if [ -d "src/app/privacy" ]; then
    echo "  - Moving privacy/"
    mv src/app/privacy src/app/[locale]/
fi

# Move terms
if [ -d "src/app/terms" ]; then
    echo "  - Moving terms/"
    mv src/app/terms src/app/[locale]/
fi

echo "📝 Creating locale layout..."
cat > src/app/[locale]/layout.tsx << 'EOF'
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
EOF

echo "📝 Creating locale page (redirect)..."
cat > src/app/[locale]/page.tsx << 'EOF'
import { redirect } from 'next/navigation';

export default function LocalePage() {
  // Redirect to dashboard or landing page
  redirect('/dashboard/leads');
}
EOF

echo "✨ Updating root layout..."
# Backup original layout
if [ -f "src/app/layout.tsx" ]; then
    cp src/app/layout.tsx src/app/layout.tsx.backup
    echo "  - Backup created: layout.tsx.backup"
fi

cat > src/app/layout.tsx << 'EOF'
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
  description: 'Industry-specific business data. Verified. Affordable.',
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
EOF

echo ""
echo "✅ Migration Complete!"
echo ""
echo "📋 Next Steps:"
echo "  1. Review the changes: git diff"
echo "  2. Test the application: npm run dev"
echo "  3. Visit http://localhost:5678 (should redirect to /dashboard/leads)"
echo "  4. Test language switching in the footer"
echo "  5. Start translating pages (see EXAMPLE_TRANSLATED_PAGE.tsx)"
echo ""
echo "⚠️  Important:"
echo "  - Root page.tsx was not moved (if it exists)"
echo "  - Backup created: src/app/layout.tsx.backup"
echo "  - Start server to test: npm run dev"
echo ""
echo "📚 Documentation:"
echo "  - Read I18N_SETUP.md for full guide"
echo "  - See EXAMPLE_TRANSLATED_PAGE.tsx for usage examples"
echo ""
echo "Happy translating! 🌍"
