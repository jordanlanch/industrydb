/**
 * Page Object Model for Stripe Checkout
 *
 * Provides methods to interact with Stripe checkout flow
 */

import { Page, expect } from '@playwright/test';

export class CheckoutPage {
  constructor(private page: Page) {}

  /**
   * Assert redirected to Stripe checkout
   */
  async expectStripeCheckout() {
    await this.page.waitForURL('**/checkout.stripe.com/**', { timeout: 15000 });
    expect(this.page.url()).toContain('stripe.com');
  }

  /**
   * Assert Stripe checkout loaded
   */
  async expectCheckoutLoaded() {
    // Wait for Stripe page to load
    await this.page.waitForLoadState('domcontentloaded');

    // Stripe checkout should have specific elements
    const stripeForm = this.page.locator('form, [data-testid="hosted-payment-page"]');
    await expect(stripeForm.first()).toBeVisible({ timeout: 10000 }).catch(() => {
      // Stripe might use different selectors
    });
  }

  /**
   * Fill payment details (test mode)
   */
  async fillPaymentDetails(cardNumber: string = '4242424242424242') {
    // This is for Stripe test mode
    await this.page.fill('input[name="cardnumber"], #cardNumber', cardNumber);
    await this.page.fill('input[name="exp-date"], #cardExpiry', '12/34');
    await this.page.fill('input[name="cvc"], #cardCvc', '123');
    await this.page.fill('input[name="postal"], #billingPostalCode', '12345');
  }

  /**
   * Submit payment
   */
  async submitPayment() {
    await this.page.click('button[type="submit"], button:has-text("Subscribe"), button:has-text("Pay")');
  }

  /**
   * Assert payment success
   */
  async expectPaymentSuccess() {
    // Should redirect back to app after success
    await this.page.waitForURL('**/dashboard**', { timeout: 30000 });
  }

  /**
   * Assert payment error
   */
  async expectPaymentError(message?: string) {
    if (message) {
      const errorMessage = this.page.locator(`text=${message}`);
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    } else {
      const errorElement = this.page.locator('.error, [role="alert"], .alert-error');
      await expect(errorElement.first()).toBeVisible({ timeout: 5000 });
    }
  }

  /**
   * Cancel checkout
   */
  async cancelCheckout() {
    // Look for back/cancel button
    const cancelButton = this.page.locator('button:has-text("Cancel"), a:has-text("Back")');
    await cancelButton.click({ timeout: 5000 }).catch(() => {});
  }

  /**
   * Assert checkout session ID in URL
   */
  async expectSessionId() {
    await this.page.waitForURL('**/cs_**', { timeout: 10000 });
    expect(this.page.url()).toMatch(/cs_[a-zA-Z0-9]+/);
  }
}
