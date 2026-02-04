/**
 * API helpers for E2E tests
 *
 * Utilities for mocking API responses and interacting with backend
 */

import { Page, Route } from '@playwright/test';

export const API_BASE = process.env.API_URL || 'http://localhost:8081/api/v1';

/**
 * Mock leads search response
 */
export async function mockLeadsResponse(page: Page, leads: any[], total?: number) {
  await page.route(`${API_BASE}/leads*`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        leads,
        pagination: {
          page: 1,
          limit: 20,
          total: total ?? leads.length,
          pages: Math.ceil((total ?? leads.length) / 20),
        },
      }),
    });
  });
}

/**
 * Mock empty leads response
 */
export async function mockEmptyLeadsResponse(page: Page) {
  await mockLeadsResponse(page, [], 0);
}

/**
 * Mock API error response
 */
export async function mockApiError(page: Page, endpoint: string, statusCode: number, message: string) {
  await page.route(`${API_BASE}${endpoint}*`, async (route: Route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({
        error: message,
        status: statusCode,
      }),
    });
  });
}

/**
 * Mock network failure
 */
export async function mockNetworkFailure(page: Page, endpoint: string) {
  await page.route(`${API_BASE}${endpoint}*`, async (route: Route) => {
    await route.abort('failed');
  });
}

/**
 * Mock usage limit exceeded
 */
export async function mockUsageLimitExceeded(page: Page) {
  await page.route(`${API_BASE}/leads*`, async (route: Route) => {
    await route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Usage limit exceeded',
        message: 'You have reached your monthly limit',
      }),
    });
  });
}

/**
 * Generate sample lead data
 */
export function generateSampleLead(overrides?: Partial<any>) {
  return {
    id: Math.floor(Math.random() * 10000),
    name: 'Sample Business',
    industry: 'tattoo',
    country: 'US',
    city: 'New York',
    address: '123 Main St',
    phone: '+1234567890',
    email: 'contact@samplebusiness.com',
    website: 'https://samplebusiness.com',
    quality_score: 85,
    ...overrides,
  };
}

/**
 * Generate multiple sample leads
 */
export function generateSampleLeads(count: number): any[] {
  return Array.from({ length: count }, (_, i) =>
    generateSampleLead({
      id: i + 1,
      name: `Business ${i + 1}`
    })
  );
}

/**
 * Wait for API request to complete
 */
export async function waitForApiRequest(page: Page, endpoint: string): Promise<any> {
  const response = await page.waitForResponse(
    (response) => response.url().includes(endpoint) && response.status() === 200,
    { timeout: 10000 }
  );
  return response.json();
}

/**
 * Mock export creation success
 */
export async function mockExportSuccess(page: Page, exportId: number = 1) {
  await page.route(`${API_BASE}/exports`, async (route: Route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: exportId,
        status: 'processing',
        format: 'csv',
        created_at: new Date().toISOString(),
      }),
    });
  });
}

/**
 * Get auth token from localStorage (for debugging)
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  return page.evaluate(() => localStorage.getItem('auth_token'));
}

/**
 * Set auth token in localStorage (for manual auth)
 */
export async function setAuthToken(page: Page, token: string): Promise<void> {
  await page.evaluate((token) => localStorage.setItem('auth_token', token), token);
}

/**
 * Clear auth token from localStorage
 */
export async function clearAuthToken(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.removeItem('auth_token'));
}
