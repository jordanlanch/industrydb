# IndustryDB E2E Test Suite

Comprehensive end-to-end test suite for IndustryDB using Playwright.

## 📁 Structure

```
e2e/
├── fixtures/           # Test data and helpers
│   ├── test-users.ts       # Test user definitions
│   ├── auth.fixture.ts     # Authentication fixtures
│   └── api-helpers.ts      # API mocking utilities
├── pages/              # Page Object Models (POMs)
│   ├── auth/
│   │   ├── register.page.ts
│   │   └── login.page.ts
│   ├── dashboard/
│   │   ├── leads.page.ts
│   │   ├── exports.page.ts
│   │   └── settings.page.ts
│   └── onboarding/
│       └── wizard.page.ts
└── specs/              # Test specifications
    ├── auth/
    │   ├── 01-register.spec.ts
    │   ├── 02-login.spec.ts
    │   └── 03-logout.spec.ts
    ├── leads/
    │   ├── 01-search.spec.ts
    │   └── 02-export.spec.ts
    └── onboarding/
        └── 01-wizard.spec.ts
```

## 🚀 Setup

### 1. Fix Node Modules Permissions (if needed)

```bash
sudo chown -R $USER:$USER frontend/node_modules
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install chromium
```

Or install all browsers:

```bash
npx playwright install
```

### 4. Start Backend Services

```bash
# From project root
docker-compose up -d db redis
cd backend && go run cmd/api/main.go
```

### 5. Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

Frontend should be running on http://localhost:3001

## 🧪 Running Tests

### Run All Tests

```bash
npm run test:e2e
```

### Run Specific Test Suite

```bash
# Auth tests only
npx playwright test e2e/specs/auth/

# Leads tests only
npx playwright test e2e/specs/leads/

# Single test file
npx playwright test e2e/specs/auth/01-register.spec.ts
```

### Run in UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

This opens Playwright's UI mode where you can:
- See tests running in real-time
- Debug failing tests
- View screenshots and traces
- Run tests selectively

### Run in Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

### Run Specific Test

```bash
npx playwright test -g "should register new user successfully"
```

### Run Tests in Parallel

```bash
npx playwright test --workers=4
```

### Run Tests with Debugging

```bash
npx playwright test --debug
```

## 📊 Viewing Reports

After running tests, generate HTML report:

```bash
npx playwright show-report
```

This opens an interactive HTML report in your browser showing:
- Test results
- Screenshots of failures
- Video recordings
- Traces for debugging

## 🎯 Test Coverage

### Authentication (3 test files, ~40 test cases)
- ✅ User registration with validation
- ✅ User login with error handling
- ✅ User logout and session cleanup
- ✅ Rate limiting enforcement
- ✅ Network error handling

### Leads (2 test files, ~15 test cases)
- ✅ Lead search with filters
- ✅ CSV/Excel export
- ✅ Export history
- ✅ Usage limits
- ✅ Pagination

### Onboarding (1 test file, ~6 test cases)
- ✅ Complete onboarding flow
- ✅ Skip onboarding
- ✅ Navigate between steps
- ✅ Save preferences

### Total: ~60+ test cases

## 🔧 Configuration

Edit `playwright.config.ts` to customize:

- **Base URL**: Change `baseURL` for different environments
- **Timeout**: Adjust `timeout` for slower connections
- **Retries**: Set `retries` for CI environments
- **Browsers**: Add Firefox, WebKit for cross-browser testing
- **Video/Screenshot**: Configure capture settings

## 📝 Writing Tests

### Use Page Object Models

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/login.page';

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  await loginPage.expectSuccess();
});
```

### Use Authentication Fixtures

```typescript
import { test as authTest } from '../../fixtures/auth.fixture';

authTest('should access dashboard', async ({ authenticatedPage: page }) => {
  // Already logged in!
  await expect(page).toHaveURL(/\/dashboard/);
});
```

### Mock API Responses

```typescript
import { mockLeadsResponse, generateSampleLeads } from '../../fixtures/api-helpers';

test('should show leads', async ({ page }) => {
  await mockLeadsResponse(page, generateSampleLeads(5));
  // ... rest of test
});
```

## 🐛 Debugging Failed Tests

### 1. View Screenshots

Screenshots are automatically captured on failure:

```
test-results/
├── auth-01-register-should-register-new-user-chromium/
│   ├── test-failed-1.png
│   └── trace.zip
```

### 2. View Trace

```bash
npx playwright show-trace test-results/.../trace.zip
```

### 3. Run with Debug Flag

```bash
npx playwright test --debug
```

### 4. Add Console Logs

```typescript
test('debug test', async ({ page }) => {
  console.log('Current URL:', page.url());
  const token = await page.evaluate(() => localStorage.getItem('auth_token'));
  console.log('Token:', token);
});
```

## 🚨 Common Issues

### Issue: Tests failing with "Target page, context or browser has been closed"

**Solution**: Ensure you're not navigating away or closing the page prematurely. Use `page.waitForURL()` instead of immediate assertions.

### Issue: "Timeout waiting for element"

**Solution**: Increase timeout or make selectors more specific:

```typescript
await expect(page.locator('text=Login')).toBeVisible({ timeout: 10000 });
```

### Issue: "Permission denied" when installing browsers

**Solution**: Fix node_modules ownership:

```bash
sudo chown -R $USER:$USER frontend/node_modules
npm install
npx playwright install
```

### Issue: Tests pass locally but fail in CI

**Solution**: Add retries in playwright.config.ts:

```typescript
retries: process.env.CI ? 2 : 0,
```

## 📈 CI Integration

Add to `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: |
          cd frontend
          npm install
          npx playwright install --with-deps chromium
      - name: Start services
        run: |
          docker-compose up -d
          sleep 10
      - name: Run E2E tests
        run: |
          cd frontend
          npm run test:e2e
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

## 🎨 Best Practices

1. **Use Page Object Models**: Keep test logic separate from page interactions
2. **Use Fixtures**: Reuse authentication and common setups
3. **Mock API Responses**: Make tests faster and more reliable
4. **Write Descriptive Test Names**: Use "should [expected behavior]"
5. **Use Data Test IDs**: Add `data-testid` attributes for stable selectors
6. **Keep Tests Independent**: Each test should work in isolation
7. **Clean Up After Tests**: Remove test data, logout users
8. **Use Timeouts Wisely**: Don't make tests unnecessarily slow
9. **Handle Flakiness**: Add retries for network-dependent tests
10. **Document Edge Cases**: Add comments for complex test scenarios

## 🔗 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI Integration](https://playwright.dev/docs/ci)

---

**Status**: ✅ Core test suite implemented (Phase 1-3)
**Coverage**: ~60+ test cases across authentication, leads, and onboarding
**Next Steps**: Add tests for organizations, API keys, settings, and billing
