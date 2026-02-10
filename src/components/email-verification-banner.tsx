'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7890/api/v1';

interface EmailVerificationBannerProps {
  email: string;
  onDismiss?: () => void;
}

export function EmailVerificationBanner({ email, onDismiss }: EmailVerificationBannerProps) {
  const t = useTranslations('auth.verification');
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [message, setMessage] = useState('');

  if (dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    setMessage('');

    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(
        `${API_URL}/auth/resend-verification`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(`✓ ${t('sent')}`);
    } catch (error: any) {
      setMessage(
        `✗ ${error.response?.data?.message || t('failed')}`
      );
    } finally {
      setSending(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div
      className="bg-yellow-50 border-b border-yellow-200"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                {t('pleaseVerify')}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {t('sentLink', { email })}
              </p>
              {message && (
                <p
                  className={`text-sm mt-2 ${message.startsWith('✓') ? 'text-green-700' : 'text-red-700'}`}
                  role="status"
                  aria-live="polite"
                >
                  {message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleResend}
              disabled={sending}
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
              aria-label={sending ? t('sending') : t('resendEmail')}
            >
              {sending ? t('sending') : t('resendEmail')}
            </Button>
            <button
              onClick={handleDismiss}
              className="text-yellow-600 hover:text-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-600 rounded p-1"
              aria-label={t('dismiss')}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
