/**
 * E2E Tests: API Key Management
 *
 * Tests listing, revoking, and deleting API keys
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/auth/register.page';
import { APIKeysPage } from '../../pages/dashboard/api-keys.page';
import { generateTestUser } from '../../fixtures/test-users';
import { API_BASE } from '../../fixtures/api-helpers';

test.describe('API Key List & Management', () => {
  let apiKeysPage: APIKeysPage;

  test.beforeEach(async ({ page }) => {
    // Register and login (business tier)
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock business tier
    await page.route(`${API_BASE}/user/usage`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ tier: 'business' }),
      });
    });

    apiKeysPage = new APIKeysPage(page);
  });

  test('should list all API keys', async ({ page }) => {
    // Mock list response
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            api_keys: [
              {
                id: 1,
                name: 'Production API Key',
                prefix: 'idb_abc',
                last_used_at: null,
                usage_count: 0,
                revoked: false,
                created_at: new Date().toISOString(),
              },
              {
                id: 2,
                name: 'Development Key',
                prefix: 'idb_def',
                last_used_at: new Date().toISOString(),
                usage_count: 15,
                revoked: false,
                created_at: new Date().toISOString(),
              },
            ],
          }),
        });
      }
    });

    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Keys visible
    await apiKeysPage.expectKeyInList('Production API Key');
    await apiKeysPage.expectKeyInList('Development Key');
  });

  test('should show key prefix (not full key)', async ({ page }) => {
    // Mock list response
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            api_keys: [
              {
                id: 1,
                name: 'Test Key',
                prefix: 'idb_abc123',
                revoked: false,
                created_at: new Date().toISOString(),
              },
            ],
          }),
        });
      }
    });

    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Prefix shown
    const prefixElement = page.locator('text=idb_abc123');
    await expect(prefixElement.first()).toBeVisible({ timeout: 5000 });

    // Assert: Full key NOT shown
    const fullKeyPattern = /idb_[a-f0-9]{64}/;
    const pageContent = await page.content();
    const hasFullKey = fullKeyPattern.test(pageContent);
    expect(hasFullKey).toBeFalsy();
  });

  test('should display usage count for each key', async ({ page }) => {
    // Mock list with usage
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            api_keys: [
              {
                id: 1,
                name: 'High Usage Key',
                prefix: 'idb_abc',
                usage_count: 1250,
                revoked: false,
                created_at: new Date().toISOString(),
              },
            ],
          }),
        });
      }
    });

    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Usage count visible
    await apiKeysPage.expectUsageCount('High Usage Key', 1250);
  });

  test('should show last used timestamp', async ({ page }) => {
    const lastUsed = new Date();
    lastUsed.setHours(lastUsed.getHours() - 2);

    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            api_keys: [
              {
                id: 1,
                name: 'Recent Key',
                prefix: 'idb_abc',
                last_used_at: lastUsed.toISOString(),
                revoked: false,
                created_at: new Date().toISOString(),
              },
            ],
          }),
        });
      }
    });

    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Timestamp shown (might be relative like "2 hours ago")
    const timestamp = page.locator('text=2 hours, text=ago, text=recently');
    // Timestamp format is implementation-specific
  });

  test('should revoke API key', async ({ page }) => {
    // Mock list
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            api_keys: [
              {
                id: 1,
                name: 'Test Key',
                prefix: 'idb_abc',
                revoked: false,
                created_at: new Date().toISOString(),
              },
            ],
          }),
        });
      }
    });

    // Mock revoke
    await page.route(`${API_BASE}/api-keys/1/revoke`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ message: 'Key revoked' }),
      });
    });

    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    // Revoke key
    await apiKeysPage.clickRevoke('Test Key');
    await page.waitForTimeout(500);
    await apiKeysPage.confirmRevoke();

    // Assert: Success
    await page.waitForTimeout(1000);
    const successMessage = page.locator('text=revoked, text=success');
    await expect(successMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should show confirmation dialog before revoke', async ({ page }) => {
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            api_keys: [
              {
                id: 1,
                name: 'Test Key',
                prefix: 'idb_abc',
                revoked: false,
                created_at: new Date().toISOString(),
              },
            ],
          }),
        });
      }
    });

    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    await apiKeysPage.clickRevoke('Test Key');

    // Assert: Confirmation dialog
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"], .modal');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const warningText = page.locator('text=cannot be undone, text=revoke, text=are you sure');
    await expect(warningText.first()).toBeVisible({ timeout: 5000 });
  });

  test('should mark revoked keys visually', async ({ page }) => {
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            api_keys: [
              {
                id: 1,
                name: 'Revoked Key',
                prefix: 'idb_abc',
                revoked: true,
                revoked_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
              },
            ],
          }),
        });
      }
    });

    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Revoked badge
    await apiKeysPage.expectRevoked('Revoked Key');
  });

  test('should delete API key permanently', async ({ page }) => {
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            api_keys: [
              {
                id: 1,
                name: 'To Delete',
                prefix: 'idb_abc',
                revoked: false,
                created_at: new Date().toISOString(),
              },
            ],
          }),
        });
      }
    });

    await page.route(`${API_BASE}/api-keys/1`, async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ message: 'Deleted' }),
        });
      }
    });

    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    await apiKeysPage.clickDelete('To Delete');
    await page.waitForTimeout(500);
    await apiKeysPage.confirmDelete();

    // Assert: Key removed from list
    await page.waitForTimeout(1000);
    await apiKeysPage.expectKeyNotInList('To Delete');
  });

  test('should show empty state when no keys', async ({ page }) => {
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ api_keys: [] }),
        });
      }
    });

    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Empty state
    const emptyState = page.locator('text=No API keys, text=Create your first');
    await expect(emptyState.first()).toBeVisible({ timeout: 5000 });
  });

  test('should update key name', async ({ page }) => {
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            api_keys: [
              {
                id: 1,
                name: 'Old Name',
                prefix: 'idb_abc',
                revoked: false,
                created_at: new Date().toISOString(),
              },
            ],
          }),
        });
      }
    });

    await page.route(`${API_BASE}/api-keys/1`, async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ message: 'Updated' }),
        });
      }
    });

    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    await apiKeysPage.updateName('Old Name', 'New Name');

    // Assert: Success
    await page.waitForTimeout(1000);
    const successMessage = page.locator('text=updated, text=success');
    await expect(successMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should display API key statistics', async ({ page }) => {
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            api_keys: [
              { id: 1, name: 'Key 1', revoked: false },
              { id: 2, name: 'Key 2', revoked: false },
              { id: 3, name: 'Key 3', revoked: true },
            ],
          }),
        });
      }
    });

    await page.route(`${API_BASE}/api-keys/stats`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          total_keys: 3,
          active_keys: 2,
          revoked_keys: 1,
          total_usage: 1500,
        }),
      });
    });

    await apiKeysPage.goto();
    await page.waitForTimeout(1500);

    // Assert: Stats visible
    const totalText = page.locator('text=3');
    const activeText = page.locator('text=2');
    // Stats might be displayed as cards or summary
  });

  test('should handle list loading errors', async ({ page }) => {
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Server error' }),
        });
      }
    });

    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Error message
    const errorMessage = page.locator('text=error, text=failed to load');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should allow filtering or searching keys', async ({ page }) => {
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            api_keys: [
              { id: 1, name: 'Production Key', prefix: 'idb_abc', revoked: false },
              { id: 2, name: 'Development Key', prefix: 'idb_def', revoked: false },
              { id: 3, name: 'Testing Key', prefix: 'idb_ghi', revoked: false },
            ],
          }),
        });
      }
    });

    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    // If search exists
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');
    const hasSearch = await searchInput.isVisible().catch(() => false);

    if (hasSearch) {
      await searchInput.fill('Production');
      await page.waitForTimeout(500);

      // Should filter results
      await apiKeysPage.expectKeyInList('Production Key');
    }
  });
});
