# E2E Test Coverage Gaps

**Date:** 2026-02-04
**Status:** Phase 1 - MCP Exploration (Partially Complete)

## 🔴 CRITICAL: Blocker Resolved

**Issue:** Missing dependency `@radix-ui/react-tooltip`
**Status:** ✅ RESOLVED (installed via npm)
**Next Step:** Restart frontend dev server to access dashboard and authenticated routes

---

## Exploration Status

### ✅ Public Pages Explored (Completed)

#### 1. Landing Page (`/en`)
**Status:** ✅ Fully Mapped

**Elements:**
- Stats display: "82,740+ Verified Leads, 184 Countries Covered, 20+ Industries"
- Login link → `/en/login`
- Register link → `/en/register`
- Cookie consent banner (Accept/Decline buttons)

#### 2. Login Page (`/en/login`)
**Status:** ✅ Fully Mapped

**Selectors:**
```typescript
getByRole('textbox', { name: 'Email Address' })
getByRole('textbox', { name: 'Password' })
getByRole('button', { name: 'Sign in' })
getByRole('button', { name: 'Google' })
getByRole('button', { name: 'GitHub' })
```

#### 3. Registration Page (`/en/register`)
**Status:** ✅ Fully Mapped

**Form Validation:** Button disabled until all fields filled and terms checked

### ⏳ Authenticated Pages (Ready for Exploration)

Now that build error is fixed, explore:
- Dashboard
- CRM Features (territories, sequences, saved searches, assignment, custom fields)
- Analytics
- Leads Search
- Settings (webhooks, API keys, organizations)

---

## Next Steps

1. Restart frontend: `npm run dev`
2. Verify dashboard loads
3. Continue MCP exploration
4. Update the 7 created specs with real selectors
