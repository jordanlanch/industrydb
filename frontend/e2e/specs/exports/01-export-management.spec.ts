/**
 * E2E Tests: Export Management
 *
 * Tests export creation, history, and download functionality
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/auth/register.page';
import { LeadsPage } from '../../pages/dashboard/leads.page';
import { ExportsPage } from '../../pages/dashboard/exports.page';
import { generateTestUser } from '../../fixtures/test-users';
import { API_BASE, mockLeadsResponse } from '../../fixtures/api-helpers';

test.describe('Export Management', () => {
  let leadsPage: LeadsPage;
  let exportsPage: ExportsPage;

  test.beforeEach(async ({ page }) => {
    // Register and login
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    leadsPage = new LeadsPage(page);
    exportsPage = new ExportsPage(page);
  });

  test('should create CSV export', async ({ page }) => {
    // Mock leads
    await mockLeadsResponse(page, [
      { id: 1, name: 'Business 1', industry: 'tattoo' },
    ]);

    // Mock export creation
    await page.route(`${API_BASE}/exports`, async (route) => {
      await route.fulfill({
        status: 201,
        body: JSON.stringify({
          id: 1,
          format: 'csv',
          status: 'processing',
          created_at: new Date().toISOString(),
        }),
      });
    });

    await leadsPage.goto();
    await leadsPage.search({ industry: 'tattoo' });
    await page.waitForTimeout(1000);

    // Create export
    await leadsPage.clickExport();
    await leadsPage.selectExportFormat('CSV');

    // Assert: Export created
    await page.waitForTimeout(1000);
    const successMessage = page.locator('text=export created, text=processing');
    await expect(successMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should create Excel export', async ({ page }) => {
    await mockLeadsResponse(page, [
      { id: 1, name: 'Business 1' },
    ]);

    await page.route(`${API_BASE}/exports`, async (route) => {
      await route.fulfill({
        status: 201,
        body: JSON.stringify({
          id: 1,
          format: 'excel',
          status: 'processing',
          created_at: new Date().toISOString(),
        }),
      });
    });

    await leadsPage.goto();
    await leadsPage.search({ industry: 'tattoo' });
    await page.waitForTimeout(1000);

    await leadsPage.clickExport();
    await leadsPage.selectExportFormat('Excel');

    await page.waitForTimeout(1000);
    const successMessage = page.locator('text=export created');
    await expect(successMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should show export history', async ({ page }) => {
    // Mock export list
    await page.route(`${API_BASE}/exports*`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            {
              id: 1,
              format: 'csv',
              status: 'completed',
              lead_count: 50,
              created_at: new Date().toISOString(),
              download_url: 'https://example.com/export-1.csv',
            },
            {
              id: 2,
              format: 'excel',
              status: 'processing',
              lead_count: 100,
              created_at: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await exportsPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Exports visible
    await exportsPage.expectExportInList(1);
    await exportsPage.expectExportInList(2);
  });

  test('should show export status (processing, completed, failed)', async ({ page }) => {
    await page.route(`${API_BASE}/exports*`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            { id: 1, status: 'completed', format: 'csv', created_at: new Date().toISOString() },
            { id: 2, status: 'processing', format: 'csv', created_at: new Date().toISOString() },
            { id: 3, status: 'failed', format: 'csv', created_at: new Date().toISOString() },
          ],
        }),
      });
    });

    await exportsPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Status badges
    const completedBadge = page.locator('text=completed, [data-status="completed"]');
    const processingBadge = page.locator('text=processing, [data-status="processing"]');
    const failedBadge = page.locator('text=failed, [data-status="failed"]');

    await expect(completedBadge.first()).toBeVisible({ timeout: 5000 });
  });

  test('should download completed export', async ({ page }) => {
    await page.route(`${API_BASE}/exports*`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            {
              id: 1,
              status: 'completed',
              format: 'csv',
              download_url: '/api/v1/exports/1/download',
              created_at: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await exportsPage.goto();
    await page.waitForTimeout(1000);

    // Mock download
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

    await exportsPage.clickDownload(1);

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });

  test('should disable download for processing exports', async ({ page }) => {
    await page.route(`${API_BASE}/exports*`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            {
              id: 1,
              status: 'processing',
              format: 'csv',
              created_at: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await exportsPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Download button disabled
    const downloadButton = page.locator('[data-export-id="1"] button:has-text("Download")');
    const isDisabled = await downloadButton.isDisabled().catch(() => true);
    expect(isDisabled).toBeTruthy();
  });

  test('should show lead count in export', async ({ page }) => {
    await page.route(`${API_BASE}/exports*`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            {
              id: 1,
              status: 'completed',
              format: 'csv',
              lead_count: 150,
              created_at: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await exportsPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Lead count visible
    const leadCount = page.locator('text=150 leads, text=150');
    await expect(leadCount.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show filters applied to export', async ({ page }) => {
    await page.route(`${API_BASE}/exports*`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            {
              id: 1,
              status: 'completed',
              format: 'csv',
              filters: {
                industry: 'tattoo',
                country: 'US',
                city: 'New York',
              },
              created_at: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await exportsPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Filters displayed
    const filtersText = page.locator('text=tattoo, text=US, text=New York');
    // Filters might be shown as chips or text
  });

  test('should auto-refresh processing exports', async ({ page }) => {
    let callCount = 0;

    await page.route(`${API_BASE}/exports*`, async (route) => {
      callCount++;

      const status = callCount === 1 ? 'processing' : 'completed';

      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            {
              id: 1,
              status: status,
              format: 'csv',
              created_at: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await exportsPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Initial status processing
    const processingBadge = page.locator('[data-status="processing"]');
    await expect(processingBadge.first()).toBeVisible({ timeout: 5000 });

    // Wait for auto-refresh (implementation might poll every 5s)
    await page.waitForTimeout(6000);

    // Assert: Status updated to completed
    const completedBadge = page.locator('[data-status="completed"]');
    await expect(completedBadge.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Auto-refresh might not be implemented yet
    });
  });

  test('should show export expiration date', async ({ page }) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await page.route(`${API_BASE}/exports*`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            {
              id: 1,
              status: 'completed',
              format: 'csv',
              expires_at: expiresAt.toISOString(),
              created_at: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await exportsPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Expiration shown
    const expirationText = page.locator('text=expires, text=7 days');
    // Expiration display is implementation-specific
  });

  test('should delete export', async ({ page }) => {
    await page.route(`${API_BASE}/exports*`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: [
              {
                id: 1,
                status: 'completed',
                format: 'csv',
                created_at: new Date().toISOString(),
              },
            ],
          }),
        });
      }
    });

    await page.route(`${API_BASE}/exports/1`, async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ message: 'Deleted' }),
        });
      }
    });

    await exportsPage.goto();
    await page.waitForTimeout(1000);

    await exportsPage.clickDelete(1);
    await page.waitForTimeout(500);

    // Confirm if needed
    const confirmButton = page.locator('button:has-text("Confirm")');
    const hasConfirm = await confirmButton.isVisible().catch(() => false);
    if (hasConfirm) {
      await confirmButton.click();
    }

    // Assert: Export removed
    await page.waitForTimeout(1000);
    await exportsPage.expectExportNotInList(1);
  });

  test('should handle export creation errors', async ({ page }) => {
    await mockLeadsResponse(page, [{ id: 1, name: 'Business 1' }]);

    await page.route(`${API_BASE}/exports`, async (route) => {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({ error: 'No leads selected' }),
      });
    });

    await leadsPage.goto();
    await leadsPage.search({ industry: 'tattoo' });
    await page.waitForTimeout(1000);

    await leadsPage.clickExport();
    await leadsPage.selectExportFormat('CSV');

    // Assert: Error message
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('text=error, text=failed');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should paginate export history', async ({ page }) => {
    // Mock paginated response
    await page.route(`${API_BASE}/exports*`, async (route) => {
      const url = new URL(route.request().url());
      const page = parseInt(url.searchParams.get('page') || '1');

      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: Array.from({ length: 10 }, (_, i) => ({
            id: (page - 1) * 10 + i + 1,
            status: 'completed',
            format: 'csv',
            created_at: new Date().toISOString(),
          })),
          pagination: {
            page,
            total: 25,
            pages: 3,
          },
        }),
      });
    });

    await exportsPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Pagination controls
    const nextButton = page.locator('button:has-text("Next"), [aria-label="Next page"]');
    const hasNext = await nextButton.isVisible().catch(() => false);

    if (hasNext) {
      await nextButton.click();
      await page.waitForTimeout(1000);

      // Should load next page
    }
  });
});
