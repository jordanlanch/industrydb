'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Database } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';

export function LandingFooter() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <Database className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-white">IndustryDB</span>
            </div>
            <p className="text-sm text-gray-400">
              {t('description')}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('product')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/pricing" className="text-sm hover:text-white transition-colors">
                  {tNav('pricing')}
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm hover:text-white transition-colors">
                  {tNav('register')}
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm hover:text-white transition-colors">
                  {tNav('login')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('company')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-white transition-colors">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm hover:text-white transition-colors">
                  {t('blog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('legal')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {currentYear} IndustryDB. {t('allRightsReserved')}
          </p>
          <LanguageSwitcher variant="dark" />
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
