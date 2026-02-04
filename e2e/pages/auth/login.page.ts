/**
 * Page Object Model for Login Page
 *
 * Provides methods to interact with the login form
 */

import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Fill login form fields
   */
  async fillForm(email: string, password: string) {
    await this.page.fill('input[id="email"]', email);
    await this.page.fill('input[id="password"]', password);
  }

  /**
   * Submit login form
   */
  async submit() {
    await this.page.click('button[type="submit"]');
  }

  /**
   * Complete login (fill form + submit)
   */
  async login(email: string, password: string) {
    await this.fillForm(email, password);
    await this.submit();
  }

  /**
   * Assert successful login (redirected to dashboard)
   */
  async expectSuccess() {
    await this.page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Verify token is stored
    const token = await this.page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();
  }

  /**
   * Assert login error is displayed
   */
  async expectError(message: string = 'Invalid') {
    await expect(this.page.locator(`text=${message}`).first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert validation error for specific field
   */
  async expectFieldError(fieldName: string, message: string) {
    const errorLocator = this.page.locator(`input[id="${fieldName}"] ~ span, label[for="${fieldName}"] ~ span`);
    await expect(errorLocator.locator(`text=${message}`).first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get heading text
   */
  async getHeading(): Promise<string> {
    const heading = this.page.getByRole('heading', { name: /sign in/i }).first();
    return (await heading.textContent()) || '';
  }

  /**
   * Click on "Create an account" link
   */
  async clickRegisterLink() {
    await this.page.click('text=Create an account');
  }

  /**
   * Click on "Forgot password" link
   */
  async clickForgotPasswordLink() {
    await this.page.click('text=Forgot password');
  }

  /**
   * Assert page is loaded correctly
   */
  async expectPageLoaded() {
    await expect(this.page.getByRole('heading', { name: /sign in/i }).first()).toBeVisible();
    await expect(this.page.locator('input[id="email"]')).toBeVisible();
    await expect(this.page.locator('input[id="password"]')).toBeVisible();
    await expect(this.page.locator('button[type="submit"]')).toBeVisible();
  }

  /**
   * Assert user is redirected to login (for protected routes)
   */
  async expectRedirectedToLogin() {
    await expect(this.page).toHaveURL('/login');
  }

  /**
   * Get current form values (for debugging)
   */
  async getFormValues() {
    return {
      email: await this.page.inputValue('input[id="email"]'),
      password: await this.page.inputValue('input[id="password"]'),
    };
  }

  /**
   * Check if OAuth buttons are visible
   */
  async hasOAuthButtons(): Promise<boolean> {
    const googleButton = this.page.locator('button:has-text("Google")');
    const githubButton = this.page.locator('button:has-text("GitHub")');

    const hasGoogle = await googleButton.isVisible().catch(() => false);
    const hasGithub = await githubButton.isVisible().catch(() => false);

    return hasGoogle || hasGithub;
  }

  /**
   * Click Google OAuth button
   */
  async clickGoogleOAuth() {
    await this.page.click('button:has-text("Google")');
  }

  /**
   * Click GitHub OAuth button
   */
  async clickGitHubOAuth() {
    await this.page.click('button:has-text("GitHub")');
  }
}
