'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Database, Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const t = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center">
              <Database className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">IndustryDB</span>
            </Link>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="ghost">{tNav('login')}</Button>
              </Link>
              <Link href="/register">
                <Button>{tCommon('getStarted')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative inline-block">
              <span className="text-[150px] font-bold text-gray-100 select-none">
                404
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <Database className="h-20 w-20 text-primary/30" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('notFound')}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t('notFoundDescription')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                {tNav('home')}
              </Button>
            </Link>
            <Link href="/dashboard/leads">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" />
                {tNav('leads')}
              </Button>
            </Link>
          </div>

          {/* Back Link */}
          <button
            onClick={() => window.history.back()}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            {tCommon('back')}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} IndustryDB. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
