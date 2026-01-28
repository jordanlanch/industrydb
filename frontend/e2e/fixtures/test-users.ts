/**
 * Test user data for E2E tests
 *
 * IMPORTANT: These users should exist in the test database
 * or be created dynamically during test setup.
 */

export const testUsers = {
  /**
   * Free tier user for basic feature testing
   */
  free: {
    email: 'free@test.com',
    password: 'TestPassword123!',
    name: 'Free User',
    tier: 'free' as const,
  },

  /**
   * Business tier user for advanced features (API keys, organizations)
   */
  business: {
    email: 'business@test.com',
    password: 'TestPassword123!',
    name: 'Business User',
    tier: 'business' as const,
  },

  /**
   * Admin user for admin panel testing
   */
  admin: {
    email: 'admin@test.com',
    password: 'AdminPassword123!',
    name: 'Admin User',
    tier: 'business' as const,
    role: 'admin' as const,
  },

  /**
   * Pro tier user for mid-tier feature testing
   */
  pro: {
    email: 'pro@test.com',
    password: 'TestPassword123!',
    name: 'Pro User',
    tier: 'pro' as const,
  },
};

/**
 * Generate a unique test user email for one-time registration tests
 */
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}${timestamp}${random}@example.com`;
}

/**
 * Generate test user data for registration
 */
export function generateTestUser(overrides?: Partial<typeof testUsers.free>) {
  return {
    email: generateTestEmail(),
    password: 'TestPassword123!',
    name: 'Test User',
    ...overrides,
  };
}

/**
 * Test organization data
 */
export const testOrganizations = {
  primary: {
    name: 'Test Organization',
    description: 'Organization for E2E testing',
  },
  secondary: {
    name: 'Secondary Org',
    description: 'Second organization for multi-org testing',
  },
};
