'use client';

import Link from "next/link";
import { LanguageSwitcher } from './language-switcher';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t mt-auto" role="contentinfo" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">IndustryDB</h3>
            <p className="text-sm text-muted-foreground">
              Industry-specific business data. Verified. Affordable.
            </p>
          </div>

          {/* Product */}
          <nav aria-label="Product links">
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded">
                  API Docs
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company links">
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded">
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@industrydb.io"
                  className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  aria-label="Email support at support@industrydb.io"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal links">
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded">
                  Terms of Service
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    // Clear cookie consent to show banner again
                    if (typeof document !== 'undefined') {
                      document.cookie = "industrydb_cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      window.location.reload();
                    }
                  }}
                  className="text-muted-foreground hover:text-primary text-left focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  aria-label="Open cookie consent settings"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {currentYear} IndustryDB. All rights reserved.
              </p>
              <LanguageSwitcher />
            </div>
            <nav className="flex space-x-6 text-sm" aria-label="Legal and contact links">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"
              >
                Terms
              </Link>
              <a
                href="mailto:legal@industrydb.io"
                className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded"
                aria-label="Email legal at legal@industrydb.io"
              >
                Legal
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
