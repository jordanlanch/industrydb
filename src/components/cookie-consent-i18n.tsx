'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Cookie, X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'industrydb_cookie_consent';

type ConsentValue = 'accepted' | 'declined' | null;

export function CookieConsentBanner() {
  const t = useTranslations('cookieConsent');
  const [consent, setConsent] = useState<ConsentValue>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!storedConsent) {
      setIsVisible(true);
    } else {
      setConsent(storedConsent as ConsentValue);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setConsent('accepted');
    setIsVisible(false);
    
    // Enable analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted',
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setConsent('declined');
    setIsVisible(false);
    
    // Disable analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t shadow-lg md:p-6"
      role="dialog"
      aria-label={t('title')}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {t('title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('message')}{' '}
                <Link 
                  href="/privacy" 
                  className="text-primary hover:underline font-medium"
                >
                  {t('learnMore')}
                </Link>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={handleDecline}
              className="min-w-[100px]"
            >
              {t('decline')}
            </Button>
            <Button 
              onClick={handleAccept}
              className="min-w-[140px]"
            >
              {t('accept')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieConsentBanner;
