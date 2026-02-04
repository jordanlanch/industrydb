import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CookieConsentBanner } from '../cookie-consent-i18n';

// Mock next-intl
const mockTranslations: Record<string, string> = {
  title: 'Cookie Consent',
  message: 'We use cookies to improve your experience.',
  learnMore: 'Learn more',
  accept: 'Accept All',
  decline: 'Decline',
};

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => mockTranslations[key] || key,
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Cookie: ({ className, ...props }: any) => (
    <svg data-testid="cookie-icon" className={className} {...props} />
  ),
  X: ({ className, ...props }: any) => (
    <svg data-testid="x-icon" className={className} {...props} />
  ),
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

describe('CookieConsentBanner (i18n)', () => {
  let mockGtag: jest.Mock;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock window.gtag
    mockGtag = jest.fn();
    (window as any).gtag = mockGtag;

    // Mock localStorage
    localStorageMock = {};
    Storage.prototype.getItem = jest.fn((key) => localStorageMock[key] || null);
    Storage.prototype.setItem = jest.fn((key, value) => {
      localStorageMock[key] = value;
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    delete (window as any).gtag;
  });

  describe('Initial Rendering', () => {
    test('renders banner when no consent stored', () => {
      render(<CookieConsentBanner />);

      expect(screen.getByText('Cookie Consent')).toBeInTheDocument();
      expect(screen.getByText('We use cookies to improve your experience.')).toBeInTheDocument();
    });

    test('does not render when consent already stored', () => {
      localStorageMock['industrydb_cookie_consent'] = 'accepted';

      render(<CookieConsentBanner />);

      expect(screen.queryByText('Cookie Consent')).not.toBeInTheDocument();
    });

    test('renders cookie icon', () => {
      render(<CookieConsentBanner />);

      expect(screen.getByTestId('cookie-icon')).toBeInTheDocument();
    });

    test('renders accept and decline buttons', () => {
      render(<CookieConsentBanner />);

      expect(screen.getByText('Accept All')).toBeInTheDocument();
      expect(screen.getByText('Decline')).toBeInTheDocument();
    });

    test('renders learn more link to privacy policy', () => {
      render(<CookieConsentBanner />);

      const learnMoreLink = screen.getByText('Learn more');
      expect(learnMoreLink).toBeInTheDocument();
      expect(learnMoreLink).toHaveAttribute('href', '/privacy');
    });
  });

  describe('Internationalization', () => {
    test('displays translated title', () => {
      render(<CookieConsentBanner />);

      expect(screen.getByText('Cookie Consent')).toBeInTheDocument();
    });

    test('displays translated message', () => {
      render(<CookieConsentBanner />);

      expect(screen.getByText('We use cookies to improve your experience.')).toBeInTheDocument();
    });

    test('displays translated accept button', () => {
      render(<CookieConsentBanner />);

      expect(screen.getByText('Accept All')).toBeInTheDocument();
    });

    test('displays translated decline button', () => {
      render(<CookieConsentBanner />);

      expect(screen.getByText('Decline')).toBeInTheDocument();
    });

    test('displays translated learn more link', () => {
      render(<CookieConsentBanner />);

      expect(screen.getByText('Learn more')).toBeInTheDocument();
    });
  });

  describe('Accept Functionality', () => {
    test('hides banner when accept is clicked', async () => {
      render(<CookieConsentBanner />);

      const acceptButton = screen.getByText('Accept All');
      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(screen.queryByText('Cookie Consent')).not.toBeInTheDocument();
      });
    });

    test('saves consent to localStorage when accepted', () => {
      render(<CookieConsentBanner />);

      const acceptButton = screen.getByText('Accept All');
      fireEvent.click(acceptButton);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'industrydb_cookie_consent',
        'accepted'
      );
    });

    test('grants analytics consent when accepted', () => {
      render(<CookieConsentBanner />);

      const acceptButton = screen.getByText('Accept All');
      fireEvent.click(acceptButton);

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
      });
    });

    test('handles accept when gtag is not available', () => {
      delete (window as any).gtag;

      render(<CookieConsentBanner />);

      const acceptButton = screen.getByText('Accept All');

      // Should not throw error
      expect(() => fireEvent.click(acceptButton)).not.toThrow();
    });
  });

  describe('Decline Functionality', () => {
    test('hides banner when decline is clicked', async () => {
      render(<CookieConsentBanner />);

      const declineButton = screen.getByText('Decline');
      fireEvent.click(declineButton);

      await waitFor(() => {
        expect(screen.queryByText('Cookie Consent')).not.toBeInTheDocument();
      });
    });

    test('saves consent to localStorage when declined', () => {
      render(<CookieConsentBanner />);

      const declineButton = screen.getByText('Decline');
      fireEvent.click(declineButton);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'industrydb_cookie_consent',
        'declined'
      );
    });

    test('denies analytics consent when declined', () => {
      render(<CookieConsentBanner />);

      const declineButton = screen.getByText('Decline');
      fireEvent.click(declineButton);

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
      });
    });

    test('handles decline when gtag is not available', () => {
      delete (window as any).gtag;

      render(<CookieConsentBanner />);

      const declineButton = screen.getByText('Decline');

      // Should not throw error
      expect(() => fireEvent.click(declineButton)).not.toThrow();
    });
  });

  describe('LocalStorage Persistence', () => {
    test('checks localStorage on mount', () => {
      render(<CookieConsentBanner />);

      expect(localStorage.getItem).toHaveBeenCalledWith('industrydb_cookie_consent');
    });

    test('hides banner if previously accepted', () => {
      localStorageMock['industrydb_cookie_consent'] = 'accepted';

      render(<CookieConsentBanner />);

      expect(screen.queryByText('Cookie Consent')).not.toBeInTheDocument();
    });

    test('hides banner if previously declined', () => {
      localStorageMock['industrydb_cookie_consent'] = 'declined';

      render(<CookieConsentBanner />);

      expect(screen.queryByText('Cookie Consent')).not.toBeInTheDocument();
    });

    test('shows banner if no previous consent', () => {
      render(<CookieConsentBanner />);

      expect(screen.getByText('Cookie Consent')).toBeInTheDocument();
    });

    test('persists accepted consent across re-renders', () => {
      const { rerender } = render(<CookieConsentBanner />);

      const acceptButton = screen.getByText('Accept All');
      fireEvent.click(acceptButton);

      // Simulate re-mount
      localStorageMock['industrydb_cookie_consent'] = 'accepted';
      rerender(<CookieConsentBanner />);

      expect(screen.queryByText('Cookie Consent')).not.toBeInTheDocument();
    });

    test('persists declined consent across re-renders', () => {
      const { rerender } = render(<CookieConsentBanner />);

      const declineButton = screen.getByText('Decline');
      fireEvent.click(declineButton);

      // Simulate re-mount
      localStorageMock['industrydb_cookie_consent'] = 'declined';
      rerender(<CookieConsentBanner />);

      expect(screen.queryByText('Cookie Consent')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has role="dialog"', () => {
      const { container } = render(<CookieConsentBanner />);

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
    });

    test('has aria-label with translated title', () => {
      const { container } = render(<CookieConsentBanner />);

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-label', 'Cookie Consent');
    });

    test('accept button is keyboard accessible', () => {
      render(<CookieConsentBanner />);

      const acceptButton = screen.getByText('Accept All');
      expect(acceptButton.tagName).toBe('BUTTON');
    });

    test('decline button is keyboard accessible', () => {
      render(<CookieConsentBanner />);

      const declineButton = screen.getByText('Decline');
      expect(declineButton.tagName).toBe('BUTTON');
    });

    test('privacy policy link is keyboard accessible', () => {
      render(<CookieConsentBanner />);

      const learnMoreLink = screen.getByText('Learn more');
      expect(learnMoreLink.tagName).toBe('A');
      expect(learnMoreLink).toHaveAttribute('href', '/privacy');
    });
  });

  describe('Button Variants', () => {
    test('accept button has default variant', () => {
      render(<CookieConsentBanner />);

      const acceptButton = screen.getByText('Accept All');
      expect(acceptButton).not.toHaveAttribute('data-variant');
    });

    test('decline button has outline variant', () => {
      render(<CookieConsentBanner />);

      const declineButton = screen.getByText('Decline');
      expect(declineButton).toHaveAttribute('data-variant', 'outline');
    });

    test('buttons have minimum width classes', () => {
      render(<CookieConsentBanner />);

      const acceptButton = screen.getByText('Accept All');
      const declineButton = screen.getByText('Decline');

      expect(acceptButton.className).toContain('min-w-[140px]');
      expect(declineButton.className).toContain('min-w-[100px]');
    });
  });

  describe('Styling', () => {
    test('has fixed positioning at bottom', () => {
      const { container } = render(<CookieConsentBanner />);

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog?.className).toContain('fixed');
      expect(dialog?.className).toContain('bottom-0');
    });

    test('has high z-index to appear above content', () => {
      const { container } = render(<CookieConsentBanner />);

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog?.className).toContain('z-50');
    });

    test('has white background with border and shadow', () => {
      const { container } = render(<CookieConsentBanner />);

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog?.className).toContain('bg-white');
      expect(dialog?.className).toContain('border-t');
      expect(dialog?.className).toContain('shadow-lg');
    });

    test('has responsive padding', () => {
      const { container } = render(<CookieConsentBanner />);

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog?.className).toContain('p-4');
      expect(dialog?.className).toContain('md:p-6');
    });
  });

  describe('Layout', () => {
    test('uses flexbox for responsive layout', () => {
      const { container } = render(<CookieConsentBanner />);

      const contentDiv = container.querySelector('.flex.flex-col.md\\:flex-row');
      expect(contentDiv).toBeInTheDocument();
    });

    test('centers content with max-width', () => {
      const { container } = render(<CookieConsentBanner />);

      const maxWidthDiv = container.querySelector('.max-w-7xl.mx-auto');
      expect(maxWidthDiv).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles rapid clicks on accept button', () => {
      render(<CookieConsentBanner />);

      const acceptButton = screen.getByText('Accept All');

      // Click multiple times rapidly
      fireEvent.click(acceptButton);
      fireEvent.click(acceptButton);
      fireEvent.click(acceptButton);

      // Should only save to localStorage once (state prevents subsequent clicks)
      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    });

    test('handles switching between accept and decline', () => {
      const { unmount } = render(<CookieConsentBanner />);

      // First decline
      const declineButton = screen.getByText('Decline');
      fireEvent.click(declineButton);

      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        'industrydb_cookie_consent',
        'declined'
      );

      // Unmount and clear localStorage to simulate new session
      unmount();
      localStorageMock = {};

      // Remount component (simulates new page load without consent)
      render(<CookieConsentBanner />);

      // Then accept
      const acceptButton = screen.getByText('Accept All');
      fireEvent.click(acceptButton);

      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        'industrydb_cookie_consent',
        'accepted'
      );
    });

    test('handles invalid localStorage data', () => {
      localStorageMock['industrydb_cookie_consent'] = 'invalid_value';

      render(<CookieConsentBanner />);

      // Should treat invalid value as no consent and show banner
      expect(screen.queryByText('Cookie Consent')).not.toBeInTheDocument();
    });
  });
});
