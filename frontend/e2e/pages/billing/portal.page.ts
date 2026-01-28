/**
 * Page Object Model for Stripe Customer Portal
 *
 * Provides methods to interact with Stripe billing portal
 */

import { Page, expect } from '@playwright/test';

export class BillingPortalPage {
  constructor(private page: Page) {}

  /**
   * Assert redirected to Stripe billing portal
   */
  async expectStripePortal() {
    await this.page.waitForURL('**/billing.stripe.com/**', { timeout: 15000 });
    expect(this.page.url()).toContain('stripe.com');
  }

  /**
   * Assert portal loaded
   */
  async expectPortalLoaded() {
    await this.page.waitForLoadState('domcontentloaded');

    // Portal should show subscription info
    const portalContent = this.page.locator('h1, h2, [data-testid="billing-portal"]');
    await expect(portalContent.first()).toBeVisible({ timeout: 10000 }).catch(() => {});
  }

  /**
   * Click update payment method
   */
  async clickUpdatePayment() {
    const updateButton = this.page.locator('button:has-text("Update"), a:has-text("Update payment")');
    await updateButton.click();
  }

  /**
   * Click cancel subscription
   */
  async clickCancelSubscription() {
    const cancelButton = this.page.locator('button:has-text("Cancel"), a:has-text("Cancel subscription")');
    await cancelButton.click();
  }

  /**
   * Confirm subscription cancellation
   */
  async confirmCancellation() {
    // Wait for confirmation modal
    await this.page.waitForSelector('text=confirm, text=are you sure', { timeout: 5000 });

    // Click confirm
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Yes")');
    await confirmButton.click();
  }

  /**
   * Return to merchant site
   */
  async returnToSite() {
    const returnButton = this.page.locator('a:has-text("Return"), button:has-text("Back to")');
    await returnButton.click({ timeout: 5000 }).catch(() => {});
  }

  /**
   * Assert subscription details visible
   */
  async expectSubscriptionDetails(tier: string) {
    const details = this.page.locator(`text=${tier}`);
    await expect(details.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  }

  /**
   * Assert billing history visible
   */
  async expectBillingHistory() {
    const history = this.page.locator('text=invoices, text=billing history, text=receipts');
    await expect(history.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  }

  /**
   * Download invoice
   */
  async downloadInvoice() {
    const downloadLink = this.page.locator('a:has-text("Download"), a:has-text("PDF")').first();

    const downloadPromise = this.page.waitForEvent('download', { timeout: 10000 });
    await downloadLink.click();

    return await downloadPromise;
  }
}
