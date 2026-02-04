import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CookieBanner } from '../cookie-consent';

// Mock react-cookie-consent
jest.mock('react-cookie-consent', () => {
  return function MockCookieConsent(props: any) {
    return (
      <div
        data-testid="cookie-consent"
        data-location={props.location}
        data-cookie-name={props.cookieName}
        data-expires={props.expires}
        style={props.style}
      >
        <div>{props.children}</div>
        <button
          data-testid="accept-button"
          style={props.buttonStyle}
          onClick={() => props.onAccept && props.onAccept()}
        >
          {props.buttonText}
        </button>
        {props.enableDeclineButton && (
          <button
            data-testid="decline-button"
            style={props.declineButtonStyle}
            onClick={() => props.onDecline && props.onDecline()}
          >
            {props.declineButtonText}
          </button>
        )}
      </div>
    );
  };
});

describe('CookieBanner', () => {
  let mockGtag: jest.Mock;

  beforeEach(() => {
    // Mock window.gtag
    mockGtag = jest.fn();
    (window as any).gtag = mockGtag;
  });

  afterEach(() => {
    // Clean up
    delete (window as any).gtag;
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders cookie consent banner', () => {
      render(<CookieBanner />);

      const banner = screen.getByTestId('cookie-consent');
      expect(banner).toBeInTheDocument();
    });

    test('displays correct cookie message', () => {
      render(<CookieBanner />);

      expect(
        screen.getByText(/We use cookies to enhance your browsing experience/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/By clicking "Accept All Cookies", you consent to our use of cookies/i)
      ).toBeInTheDocument();
    });

    test('displays Privacy Policy link', () => {
      render(<CookieBanner />);

      const privacyLink = screen.getByText(/Learn more in our Privacy Policy/i);
      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink.tagName).toBe('A');
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    test('renders at bottom location', () => {
      render(<CookieBanner />);

      const banner = screen.getByTestId('cookie-consent');
      expect(banner).toHaveAttribute('data-location', 'bottom');
    });
  });

  describe('Buttons', () => {
    test('renders Accept button with correct text', () => {
      render(<CookieBanner />);

      const acceptButton = screen.getByTestId('accept-button');
      expect(acceptButton).toBeInTheDocument();
      expect(acceptButton).toHaveTextContent('Accept All Cookies');
    });

    test('renders Decline button with correct text', () => {
      render(<CookieBanner />);

      const declineButton = screen.getByTestId('decline-button');
      expect(declineButton).toBeInTheDocument();
      expect(declineButton).toHaveTextContent('Decline');
    });

    test('Accept button has correct styling', () => {
      render(<CookieBanner />);

      const acceptButton = screen.getByTestId('accept-button');
      expect(acceptButton).toHaveStyle({
        background: 'rgb(76, 175, 80)', // #4CAF50
        color: 'rgb(255, 255, 255)', // white
        cursor: 'pointer',
      });
    });

    test('Decline button has correct styling', () => {
      render(<CookieBanner />);

      const declineButton = screen.getByTestId('decline-button');
      expect(declineButton).toHaveStyle({
        background: 'rgb(244, 67, 54)', // #f44336
        color: 'rgb(255, 255, 255)', // white
        cursor: 'pointer',
      });
    });
  });

  describe('Cookie Configuration', () => {
    test('uses correct cookie name', () => {
      render(<CookieBanner />);

      const banner = screen.getByTestId('cookie-consent');
      expect(banner).toHaveAttribute('data-cookie-name', 'industrydb_cookie_consent');
    });

    test('sets correct expiration time (365 days)', () => {
      render(<CookieBanner />);

      const banner = screen.getByTestId('cookie-consent');
      expect(banner).toHaveAttribute('data-expires', '365');
    });
  });

  describe('Google Analytics Integration', () => {
    test('grants analytics consent when Accept button is clicked', () => {
      render(<CookieBanner />);

      const acceptButton = screen.getByTestId('accept-button');
      fireEvent.click(acceptButton);

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'granted',
      });
    });

    test('denies analytics consent when Decline button is clicked', () => {
      render(<CookieBanner />);

      const declineButton = screen.getByTestId('decline-button');
      fireEvent.click(declineButton);

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'denied',
      });
    });

    test('handles Accept when gtag is not available', () => {
      delete (window as any).gtag;

      render(<CookieBanner />);

      const acceptButton = screen.getByTestId('accept-button');

      // Should not throw error
      expect(() => fireEvent.click(acceptButton)).not.toThrow();
    });

    test('handles Decline when gtag is not available', () => {
      delete (window as any).gtag;

      render(<CookieBanner />);

      const declineButton = screen.getByTestId('decline-button');

      // Should not throw error
      expect(() => fireEvent.click(declineButton)).not.toThrow();
    });
  });

  describe('Styling', () => {
    test('banner has correct background color', () => {
      render(<CookieBanner />);

      const banner = screen.getByTestId('cookie-consent');
      expect(banner).toHaveStyle({
        background: '#2B373B',
        alignItems: 'center',
        padding: '1rem',
      });
    });

    test('Privacy Policy link has correct styling', () => {
      render(<CookieBanner />);

      const privacyLink = screen.getByText(/Learn more in our Privacy Policy/i);
      expect(privacyLink).toHaveStyle({
        color: '#4CAF50',
        textDecoration: 'underline',
        marginLeft: '8px',
      });
    });
  });

  describe('GDPR Compliance', () => {
    test('provides clear opt-in mechanism', () => {
      render(<CookieBanner />);

      // User must actively click Accept
      expect(screen.getByTestId('accept-button')).toBeInTheDocument();
      expect(mockGtag).not.toHaveBeenCalled(); // Not called until user accepts
    });

    test('provides clear opt-out mechanism', () => {
      render(<CookieBanner />);

      // User can actively decline
      const declineButton = screen.getByTestId('decline-button');
      expect(declineButton).toBeInTheDocument();
    });

    test('links to Privacy Policy for transparency', () => {
      render(<CookieBanner />);

      const privacyLink = screen.getByText(/Learn more in our Privacy Policy/i);
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    test('explains cookie usage clearly', () => {
      render(<CookieBanner />);

      // Should explain what cookies are used for
      expect(
        screen.getByText(/enhance your browsing experience/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/serve personalized content/i)).toBeInTheDocument();
      expect(screen.getByText(/analyze our traffic/i)).toBeInTheDocument();
    });

    test('respects user consent choice (Accept)', () => {
      render(<CookieBanner />);

      const acceptButton = screen.getByTestId('accept-button');
      fireEvent.click(acceptButton);

      // Analytics should be granted
      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'granted',
      });
    });

    test('respects user consent choice (Decline)', () => {
      render(<CookieBanner />);

      const declineButton = screen.getByTestId('decline-button');
      fireEvent.click(declineButton);

      // Analytics should be denied
      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'denied',
      });
    });
  });

  describe('Accessibility', () => {
    test('buttons are keyboard accessible', () => {
      render(<CookieBanner />);

      const acceptButton = screen.getByTestId('accept-button');
      const declineButton = screen.getByTestId('decline-button');

      expect(acceptButton.tagName).toBe('BUTTON');
      expect(declineButton.tagName).toBe('BUTTON');
    });

    test('Privacy Policy link is keyboard accessible', () => {
      render(<CookieBanner />);

      const privacyLink = screen.getByText(/Learn more in our Privacy Policy/i);
      expect(privacyLink.tagName).toBe('A');
      expect(privacyLink).toHaveAttribute('href');
    });

    test('has sufficient color contrast for buttons', () => {
      render(<CookieBanner />);

      const acceptButton = screen.getByTestId('accept-button');
      const declineButton = screen.getByTestId('decline-button');

      // Green background with white text (good contrast)
      expect(acceptButton).toHaveStyle({
        background: 'rgb(76, 175, 80)',
        color: 'rgb(255, 255, 255)',
      });
      // Red background with white text (good contrast)
      expect(declineButton).toHaveStyle({
        background: 'rgb(244, 67, 54)',
        color: 'rgb(255, 255, 255)',
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles multiple clicks on Accept', () => {
      render(<CookieBanner />);

      const acceptButton = screen.getByTestId('accept-button');
      fireEvent.click(acceptButton);
      fireEvent.click(acceptButton);
      fireEvent.click(acceptButton);

      // Should be called three times
      expect(mockGtag).toHaveBeenCalledTimes(3);
      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'granted',
      });
    });

    test('handles multiple clicks on Decline', () => {
      render(<CookieBanner />);

      const declineButton = screen.getByTestId('decline-button');
      fireEvent.click(declineButton);
      fireEvent.click(declineButton);

      // Should be called twice
      expect(mockGtag).toHaveBeenCalledTimes(2);
      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'denied',
      });
    });

    test('handles switching between Accept and Decline', () => {
      render(<CookieBanner />);

      const acceptButton = screen.getByTestId('accept-button');
      const declineButton = screen.getByTestId('decline-button');

      fireEvent.click(acceptButton);
      expect(mockGtag).toHaveBeenLastCalledWith('consent', 'update', {
        analytics_storage: 'granted',
      });

      fireEvent.click(declineButton);
      expect(mockGtag).toHaveBeenLastCalledWith('consent', 'update', {
        analytics_storage: 'denied',
      });

      fireEvent.click(acceptButton);
      expect(mockGtag).toHaveBeenLastCalledWith('consent', 'update', {
        analytics_storage: 'granted',
      });
    });
  });
});
