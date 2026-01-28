/**
 * Page Object Model for Registration Page
 *
 * Provides methods to interact with the registration form
 */

import { Page, expect } from '@playwright/test';

export class RegisterPage {
  constructor(private page: Page) {}

  /**
   * Navigate to registration page
   */
  async goto() {
    await this.page.goto('/register');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Fill registration form fields
   */
  async fillForm(name: string, email: string, password: string) {
    await this.page.fill('input[id="name"]', name);
    await this.page.fill('input[id="email"]', email);
    await this.page.fill('input[id="password"]', password);
  }

  /**
   * Accept terms and conditions checkbox
   */
  async acceptTerms() {
    const termsCheckbox = this.page.locator('input[id="terms"]');
    if (await termsCheckbox.isVisible().catch(() => false)) {
      await termsCheckbox.check();
    }
  }

  /**
   * Submit registration form
   */
  async submit() {
    await this.page.click('button[type="submit"]');
  }

  /**
   * Complete registration (fill form + accept terms + submit)
   */
  async register(name: string, email: string, password: string) {
    await this.fillForm(name, email, password);
    await this.acceptTerms();
    await this.submit();
  }

  /**
   * Assert successful registration (redirected to dashboard)
   */
  async expectSuccess() {
    await this.page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Verify token is stored
    const token = await this.page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();
  }

  /**
   * Assert registration error is displayed
   */
  async expectError(message: string) {
    await expect(this.page.locator(`text=${message}`).first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert validation error for specific field
   */
  async expectFieldError(fieldName: string, message: string) {
    // Look for error message near the field
    const errorLocator = this.page.locator(`input[id="${fieldName}"] ~ span, label[for="${fieldName}"] ~ span`);
    await expect(errorLocator.locator(`text=${message}`).first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert terms checkbox is required
   */
  async expectTermsRequired() {
    const termsCheckbox = this.page.locator('input[id="terms"]');
    await expect(termsCheckbox).toHaveAttribute('required', '');
  }

  /**
   * Get heading text
   */
  async getHeading(): Promise<string> {
    const heading = this.page.getByRole('heading', { name: /create an account/i }).first();
    return (await heading.textContent()) || '';
  }

  /**
   * Click on "Already have an account" link
   */
  async clickLoginLink() {
    await this.page.click('text=Already have an account');
  }

  /**
   * Assert page is loaded correctly
   */
  async expectPageLoaded() {
    await expect(this.page.getByRole('heading', { name: /create an account/i }).first()).toBeVisible();
    await expect(this.page.locator('input[id="name"]')).toBeVisible();
    await expect(this.page.locator('input[id="email"]')).toBeVisible();
    await expect(this.page.locator('input[id="password"]')).toBeVisible();
    await expect(this.page.locator('button[type="submit"]')).toBeVisible();
  }

  /**
   * Get current form values (for debugging)
   */
  async getFormValues() {
    return {
      name: await this.page.inputValue('input[id="name"]'),
      email: await this.page.inputValue('input[id="email"]'),
      password: await this.page.inputValue('input[id="password"]'),
      termsChecked: await this.page.isChecked('input[id="terms"]').catch(() => false),
    };
  }
}
