'use client';

import CookieConsent from "react-cookie-consent";

export function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept All Cookies"
      declineButtonText="Decline"
      enableDeclineButton
      cookieName="industrydb_cookie_consent"
      style={{
        background: "#2B373B",
        alignItems: "center",
        padding: "1rem"
      }}
      buttonStyle={{
        background: "#4CAF50",
        color: "white",
        fontSize: "14px",
        borderRadius: "4px",
        padding: "0.5rem 1rem",
        cursor: "pointer"
      }}
      declineButtonStyle={{
        background: "#f44336",
        color: "white",
        fontSize: "14px",
        borderRadius: "4px",
        padding: "0.5rem 1rem",
        cursor: "pointer"
      }}
      expires={365}
      onAccept={() => {
        // Enable analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('consent', 'update', {
            'analytics_storage': 'granted'
          });
        }
      }}
      onDecline={() => {
        // Disable analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('consent', 'update', {
            'analytics_storage': 'denied'
          });
        }
      }}
    >
      We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
      By clicking "Accept All Cookies", you consent to our use of cookies.{" "}
      <a
        href="/privacy"
        style={{ color: "#4CAF50", textDecoration: "underline", marginLeft: "8px" }}
      >
        Learn more in our Privacy Policy
      </a>
    </CookieConsent>
  );
}
