'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

interface EmailVerificationBannerProps {
  email: string;
  onDismiss?: () => void;
}

export function EmailVerificationBanner({ email, onDismiss }: EmailVerificationBannerProps) {
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

      setMessage('✓ Verification email sent! Please check your inbox.');
    } catch (error: any) {
      setMessage(
        '✗ ' + (error.response?.data?.message || 'Failed to send email. Please try again.')
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
                Please verify your email address
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                We sent a verification link to <strong>{email}</strong>.
                Check your inbox and click the link to verify your account.
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
              aria-label={sending ? 'Sending verification email' : 'Resend verification email'}
            >
              {sending ? 'Sending...' : 'Resend Email'}
            </Button>
            <button
              onClick={handleDismiss}
              className="text-yellow-600 hover:text-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-600 rounded p-1"
              aria-label="Dismiss email verification banner"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
