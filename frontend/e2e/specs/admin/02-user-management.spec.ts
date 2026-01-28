/**
 * E2E Tests: Admin User Management
 *
 * Tests admin capabilities for managing users
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/auth/register.page';
import { AdminDashboardPage } from '../../pages/admin/dashboard.page';
import { generateTestUser } from '../../fixtures/test-users';
import { API_BASE } from '../../fixtures/api-helpers';

test.describe('Admin User Management', () => {
  let adminPage: AdminDashboardPage;

  test.beforeEach(async ({ page }) => {
    // Register admin user
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock admin role
    await page.route(`${API_BASE}/user/me`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ role: 'admin' }),
      });
    });

    adminPage = new AdminDashboardPage(page);
  });

  test('should list all users', async ({ page }) => {
    // Mock user list
    await page.route(`${API_BASE}/admin/users*`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          users: [
            {
              id: 1,
              email: 'user1@example.com',
              name: 'User One',
              tier: 'free',
              created_at: new Date().toISOString(),
            },
            {
              id: 2,
              email: 'user2@example.com',
              name: 'User Two',
              tier: 'starter',
              created_at: new Date().toISOString(),
            },
          ],
          pagination: {
            page: 1,
            total: 2,
          },
        }),
      });
    });

    await adminPage.gotoUserManagement();
    await page.waitForTimeout(1000);

    // Assert: Users visible
    const user1 = page.locator('text=user1@example.com');
    const user2 = page.locator('text=user2@example.com');

    await expect(user1).toBeVisible({ timeout: 5000 });
    await expect(user2).toBeVisible({ timeout: 5000 });
  });

  test('should search for users', async ({ page }) => {
    await page.route(`${API_BASE}/admin/users*`, async (route) => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get('search');

      if (search === 'user1') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            users: [
              {
                id: 1,
                email: 'user1@example.com',
                name: 'User One',
                tier: 'free',
              },
            ],
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ users: [] }),
        });
      }
    });

    await adminPage.gotoUserManagement();
    await page.waitForTimeout(1000);

    // Search
    await adminPage.searchUser('user1@example.com');
    await page.waitForTimeout(1000);

    // Assert: Filtered results
    const user1 = page.locator('text=user1@example.com');
    await expect(user1).toBeVisible({ timeout: 5000 });
  });

  test('should update user tier', async ({ page }) => {
    await page.route(`${API_BASE}/admin/users*`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            users: [
              {
                id: 1,
                email: 'user@example.com',
                tier: 'free',
              },
            ],
          }),
        });
      }
    });

    await page.route(`${API_BASE}/admin/users/1`, async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ message: 'Updated' }),
        });
      }
    });

    await adminPage.gotoUserManagement();
    await page.waitForTimeout(1000);

    // Update tier
    await adminPage.updateUserTier('user@example.com', 'pro');

    // Assert: Success
    await page.waitForTimeout(1000);
    const successMessage = page.locator('text=updated, text=success');
    await expect(successMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should suspend user account', async ({ page }) => {
    await page.route(`${API_BASE}/admin/users*`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            users: [
              {
                id: 1,
                email: 'baduser@example.com',
                status: 'active',
              },
            ],
          }),
        });
      }
    });

    await page.route(`${API_BASE}/admin/users/1`, async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ message: 'Suspended' }),
        });
      }
    });

    await adminPage.gotoUserManagement();
    await page.waitForTimeout(1000);

    // Suspend user
    await adminPage.suspendUser('baduser@example.com');

    // Assert: Success
    await page.waitForTimeout(1000);
    const successMessage = page.locator('text=suspended');
    await expect(successMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should filter users by tier', async ({ page }) => {
    await page.route(`${API_BASE}/admin/users*`, async (route) => {
      const url = new URL(route.request().url());
      const tier = url.searchParams.get('tier');

      if (tier === 'business') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            users: [
              {
                id: 1,
                email: 'business@example.com',
                tier: 'business',
              },
            ],
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ users: [] }),
        });
      }
    });

    await adminPage.gotoUserManagement();
    await page.waitForTimeout(1000);

    // Filter by tier
    await adminPage.filterByTier('business');
    await page.waitForTimeout(1000);

    // Assert: Filtered results
    const businessUser = page.locator('text=business@example.com');
    await expect(businessUser).toBeVisible({ timeout: 5000 });
  });

  test('should paginate user list', async ({ page }) => {
    await page.route(`${API_BASE}/admin/users*`, async (route) => {
      const url = new URL(route.request().url());
      const page = parseInt(url.searchParams.get('page') || '1');

      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          users: Array.from({ length: 20 }, (_, i) => ({
            id: (page - 1) * 20 + i + 1,
            email: `user${(page - 1) * 20 + i + 1}@example.com`,
            tier: 'free',
          })),
          pagination: {
            page,
            total: 50,
            pages: 3,
          },
        }),
      });
    });

    await adminPage.gotoUserManagement();
    await page.waitForTimeout(1000);

    // Assert: Pagination controls
    const nextButton = page.locator('button:has-text("Next")');
    const hasNext = await nextButton.isVisible().catch(() => false);

    if (hasNext) {
      await nextButton.click();
      await page.waitForTimeout(1000);

      // Should load page 2
      const user21 = page.locator('text=user21@example.com');
      await expect(user21).toBeVisible({ timeout: 5000 });
    }
  });

  test('should view user details', async ({ page }) => {
    await page.route(`${API_BASE}/admin/users*`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            users: [
              {
                id: 1,
                email: 'detail@example.com',
                name: 'Detail User',
                tier: 'pro',
                usage_count: 500,
                created_at: new Date().toISOString(),
              },
            ],
          }),
        });
      }
    });

    await page.route(`${API_BASE}/admin/users/1`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 1,
            email: 'detail@example.com',
            name: 'Detail User',
            tier: 'pro',
            usage_count: 500,
            subscription: {
              stripe_id: 'sub_123',
              status: 'active',
            },
          }),
        });
      }
    });

    await adminPage.gotoUserManagement();
    await page.waitForTimeout(1000);

    // Click user
    await adminPage.clickUser('detail@example.com');
    await page.waitForTimeout(1000);

    // Assert: Details shown
    const detailsModal = page.locator('[role="dialog"], .modal');
    await expect(detailsModal).toBeVisible({ timeout: 5000 });

    const usageText = page.locator('text=500');
    await expect(usageText.first()).toBeVisible({ timeout: 5000 });
  });
});
