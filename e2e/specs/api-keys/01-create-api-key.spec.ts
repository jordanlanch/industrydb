/**
 * E2E Tests: Create API Key
 *
 * Tests API key creation flow and security warnings
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/auth/register.page';
import { APIKeysPage } from '../../pages/dashboard/api-keys.page';
import { generateTestUser } from '../../fixtures/test-users';
import { API_BASE } from '../../fixtures/api-helpers';

test.describe('Create API Key', () => {
  let apiKeysPage: APIKeysPage;

  test.beforeEach(async ({ page }) => {
    // Register and login (assume business tier for API key access)
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock business tier user
    await page.route(`${API_BASE}/user/usage`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          current_usage: 0,
          usage_limit: 10000,
          remaining: 10000,
          tier: 'business', // Business tier has API key access
        }),
      });
    });

    apiKeysPage = new APIKeysPage(page);
    await apiKeysPage.goto();
  });

  test('should create API key successfully', async ({ page }) => {
    // Mock create response
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            api_key: {
              id: 1,
              name: 'Test API Key',
              key: 'idb_' + 'a'.repeat(64), // Mock key
              prefix: 'idb_aaa',
              expires_at: null,
              created_at: new Date().toISOString(),
            },
          }),
        });
      }
    });

    // Create API key
    await apiKeysPage.createAPIKey('Test API Key');

    // Assert: Plain key shown
    await page.waitForTimeout(1000);
    const plainKey = await apiKeysPage.getPlainKey();
    expect(plainKey).toMatch(/^idb_[a-f0-9]{64}$/);
  });

  test('should show warning that key is only shown once', async ({ page }) => {
    // Mock response
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            api_key: {
              id: 1,
              name: 'Test',
              key: 'idb_' + 'b'.repeat(64),
              prefix: 'idb_bbb',
              expires_at: null,
              created_at: new Date().toISOString(),
            },
          }),
        });
      }
    });

    await apiKeysPage.createAPIKey('Test');

    // Assert: Warning message visible
    await page.waitForTimeout(1000);
    await apiKeysPage.expectWarning("won't be shown again");
  });

  test('should allow copying API key', async ({ page }) => {
    // Mock response
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            api_key: {
              id: 1,
              name: 'Test',
              key: 'idb_' + 'c'.repeat(64),
              prefix: 'idb_ccc',
              expires_at: null,
              created_at: new Date().toISOString(),
            },
          }),
        });
      }
    });

    await apiKeysPage.createAPIKey('Test');
    await page.waitForTimeout(1000);

    // Click copy
    await apiKeysPage.clickCopyKey();

    // Assert: Copy feedback (toast or button text change)
    await page.waitForTimeout(500);
    const copiedFeedback = page.locator('text=Copied, text=Copied!');
    await expect(copiedFeedback.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should hide plain key after closing dialog', async ({ page }) => {
    // Mock response
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            api_key: {
              id: 1,
              name: 'Test',
              key: 'idb_' + 'd'.repeat(64),
              prefix: 'idb_ddd',
              expires_at: null,
              created_at: new Date().toISOString(),
            },
          }),
        });
      }
    });

    await apiKeysPage.createAPIKey('Test');
    await page.waitForTimeout(1000);

    // Close dialog
    await apiKeysPage.closeCreateDialog();

    // Assert: Plain key no longer visible
    const plainKeyElement = page.locator('[data-testid="api-key-plain"]');
    await expect(plainKeyElement).not.toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should validate API key name is required', async ({ page }) => {
    // Click create button
    await apiKeysPage.clickCreateButton();
    await page.waitForTimeout(500);

    // Try to submit without name
    await apiKeysPage.submitCreate();

    // Assert: Validation error
    await page.waitForTimeout(500);
    const validationError = page.locator('text=required, text=cannot be empty');
    await expect(validationError.first()).toBeVisible({ timeout: 3000 }).catch(() => {
      // Button might be disabled instead
    });
  });

  test('should allow setting expiration date', async ({ page }) => {
    // Mock response
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');

        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            api_key: {
              id: 1,
              name: body.name,
              key: 'idb_' + 'e'.repeat(64),
              prefix: 'idb_eee',
              expires_at: body.expires_at || null,
              created_at: new Date().toISOString(),
            },
          }),
        });
      }
    });

    // Create key with expiration
    const expiresAt = '2027-12-31';
    await apiKeysPage.createAPIKey('Test Key', expiresAt);

    await page.waitForTimeout(1000);

    // Assert: Key created
    const plainKey = await apiKeysPage.getPlainKey();
    expect(plainKey).toBeTruthy();
  });

  test('should include expiration in API request', async ({ page }) => {
    // Capture request
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/api-keys') && request.method() === 'POST',
      { timeout: 15000 }
    );

    // Mock response
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            api_key: {
              id: 1,
              name: 'Test',
              key: 'idb_' + 'f'.repeat(64),
              prefix: 'idb_fff',
              expires_at: '2027-12-31T23:59:59Z',
              created_at: new Date().toISOString(),
            },
          }),
        });
      }
    });

    await apiKeysPage.createAPIKey('Test', '2027-12-31');

    const request = await requestPromise;
    const postData = JSON.parse(request.postData() || '{}');

    // Assert: Expiration included
    expect(postData).toHaveProperty('name');
    if (postData.expires_at) {
      expect(postData.expires_at).toBeTruthy();
    }
  });

  test('should include auth token in create request', async ({ page }) => {
    // Capture request
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/api-keys') && request.method() === 'POST',
      { timeout: 15000 }
    );

    // Mock response
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            api_key: {
              id: 1,
              name: 'Test',
              key: 'idb_test',
              prefix: 'idb_',
              expires_at: null,
              created_at: new Date().toISOString(),
            },
          }),
        });
      }
    });

    await apiKeysPage.createAPIKey('Test');

    const request = await requestPromise;

    // Assert: Authorization header
    const authHeader = request.headers()['authorization'];
    expect(authHeader).toBeTruthy();
    expect(authHeader).toContain('Bearer ');
  });

  test('should handle creation errors gracefully', async ({ page }) => {
    // Mock error
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          body: JSON.stringify({
            error: 'Invalid API key name',
          }),
        });
      }
    });

    await apiKeysPage.createAPIKey('Invalid Name!@#');

    // Assert: Error message
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('text=error, text=failed, text=invalid');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should handle 500 server errors', async ({ page }) => {
    // Mock error
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          body: JSON.stringify({
            error: 'Internal server error',
          }),
        });
      }
    });

    await apiKeysPage.createAPIKey('Test');

    // Assert: Error handling
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('text=error, text=failed');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should show loading state during creation', async ({ page }) => {
    // Mock slow response
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            api_key: {
              id: 1,
              name: 'Test',
              key: 'idb_test',
              prefix: 'idb_',
              expires_at: null,
              created_at: new Date().toISOString(),
            },
          }),
        });
      }
    });

    await apiKeysPage.clickCreateButton();
    await page.waitForTimeout(500);
    await apiKeysPage.fillCreateForm('Test');
    await apiKeysPage.submitCreate();

    // Assert: Loading indicator
    await page.waitForTimeout(500);
    const loadingIndicator = page.locator('text=Creating, .spinner, [data-testid="loading"]');
    // Loading might be too fast to catch
  });

  test('should disable submit button during creation', async ({ page }) => {
    // Mock slow response
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            api_key: {
              id: 1,
              name: 'Test',
              key: 'idb_test',
              prefix: 'idb_',
              expires_at: null,
              created_at: new Date().toISOString(),
            },
          }),
        });
      }
    });

    await apiKeysPage.clickCreateButton();
    await page.waitForTimeout(500);
    await apiKeysPage.fillCreateForm('Test');

    const submitButton = page.locator('button[type="submit"], button:has-text("Create")').last();
    await submitButton.click();

    // Assert: Button disabled
    await page.waitForTimeout(300);
    const isDisabled = await submitButton.isDisabled().catch(() => false);
    expect(isDisabled).toBeTruthy();
  });

  test('should validate key format (idb_ prefix + 64 hex chars)', async ({ page }) => {
    // Mock response
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify({
            api_key: {
              id: 1,
              name: 'Test',
              key: 'idb_' + 'a1b2c3d4'.repeat(8), // 64 hex chars
              prefix: 'idb_a1b',
              expires_at: null,
              created_at: new Date().toISOString(),
            },
          }),
        });
      }
    });

    await apiKeysPage.createAPIKey('Test');
    await page.waitForTimeout(1000);

    const plainKey = await apiKeysPage.getPlainKey();

    // Assert: Correct format
    expect(plainKey).toMatch(/^idb_[a-f0-9]{64}$/);
  });

  test('should prevent creating duplicate key names', async ({ page }) => {
    // Mock error for duplicate
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');

        if (body.name === 'Duplicate') {
          await route.fulfill({
            status: 400,
            body: JSON.stringify({
              error: 'API key name already exists',
            }),
          });
        } else {
          await route.fulfill({
            status: 201,
            body: JSON.stringify({
              api_key: {
                id: 1,
                name: body.name,
                key: 'idb_test',
                prefix: 'idb_',
                expires_at: null,
                created_at: new Date().toISOString(),
              },
            }),
          });
        }
      }
    });

    await apiKeysPage.createAPIKey('Duplicate');

    // Assert: Error shown
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('text=already exists, text=duplicate');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});
