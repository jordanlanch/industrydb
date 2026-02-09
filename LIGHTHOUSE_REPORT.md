# Lighthouse Performance Audit Report

**Task:** FE-PERF-001 - Lighthouse Performance Audit and Fixes
**Date:** 2026-02-09
**Branch:** `perf/FE-PERF-001-lighthouse-audit`

## Executive Summary

This report documents the performance audit and optimizations applied to the IndustryDB frontend. The audit covered font loading, resource hints, script strategies, CSS performance, and SEO metadata across all pages.

## Audit Scope

**Pages Audited:**
- Homepage (`/[locale]/page.tsx`)
- Login page (`/[locale]/(auth)/login/page.tsx`)
- Dashboard leads page (`/[locale]/dashboard/leads/page.tsx`)
- All dashboard, auth, admin, and public pages

## Issues Found & Fixed

### 1. Font Loading - `font-display: swap` Missing

**Before:** `Inter({ subsets: ["latin"] })`
**After:** `Inter({ display: "swap", subsets: ["latin"], preload: true })`

**Impact:** Without `display: swap`, users see invisible text (FOIT) while the font loads. With swap, the browser shows fallback text immediately and swaps to Inter when loaded, improving First Contentful Paint (FCP) and Largest Contentful Paint (LCP).

**File:** `src/app/layout.tsx`

### 2. Missing Preconnect Hints

**Before:** No preconnect hints for external resources.
**After:** Added preconnect hints for:
- `fonts.googleapis.com` - Google Fonts API
- `fonts.gstatic.com` - Font file delivery (with crossOrigin)
- `js.stripe.com` - Stripe payment SDK
- `NEXT_PUBLIC_API_URL` - Backend API (dynamic)

**Impact:** Preconnect establishes early connections (DNS + TCP + TLS) to external origins, saving 100-300ms per connection on first request. Critical for fonts and API calls that block rendering.

**File:** `src/app/layout.tsx`

### 3. Google Analytics Script Strategy

**Before:** Consent default script used `strategy="beforeInteractive"` (render-blocking), GA scripts used `strategy="afterInteractive"`.
**After:** Consent default uses `strategy="afterInteractive"`, GA tag and init use `strategy="lazyOnload"`.

**Impact:**
- `beforeInteractive` scripts block the entire page render. Moving consent to `afterInteractive` eliminates this blocking.
- `lazyOnload` defers GA scripts to browser idle time, further improving Time to Interactive (TTI).
- Analytics is non-essential for page functionality - deferring it is safe and recommended.

**File:** `src/app/layout.tsx`

### 4. Universal CSS Transitions on All Elements

**Before:**
```css
* {
  transition-property: color, background-color, border-color, ...;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
```

**After:**
```css
button, a, input, select, textarea, [role="button"] {
  transition-property: color, background-color, border-color, ...;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
```

**Impact:** The universal selector (`*`) applied transitions to every DOM element including `div`, `span`, `p`, etc. This forces the browser to track transition state for thousands of elements, increasing paint/composite time. Targeting only interactive elements reduces this overhead significantly while maintaining the same visual experience.

**File:** `src/app/globals.css`

### 5. Missing SEO Metadata on Pages

**Before:** Several pages/layouts lacked `metadata` exports, meaning they relied solely on the root layout metadata. Missing openGraph configuration on dashboard pages.

**After:** Added metadata with title, description, and openGraph to:

**New metadata layouts created:**
| Layout File | Title |
|---|---|
| `[locale]/layout.tsx` | IndustryDB (title template) |
| `[locale]/industries/layout.tsx` | Industries |
| `[locale]/onboarding/layout.tsx` | Get Started |
| `[locale]/admin/users/layout.tsx` | User Management |
| `[locale]/dashboard/organizations/[id]/layout.tsx` | Organization Details |
| `[locale]/dashboard/organizations/[id]/members/layout.tsx` | Organization Members |
| `[locale]/dashboard/organizations/[id]/settings/layout.tsx` | Organization Settings |

**Existing layouts enhanced with openGraph:**
| Layout File | Added |
|---|---|
| `dashboard/exports/layout.tsx` | openGraph |
| `dashboard/analytics/layout.tsx` | openGraph |
| `dashboard/api-keys/layout.tsx` | openGraph |
| `dashboard/saved-searches/layout.tsx` | openGraph |
| `dashboard/settings/layout.tsx` | openGraph |
| `dashboard/organizations/layout.tsx` | openGraph |

**Impact:** Proper metadata on every page improves SEO scores, social sharing previews, and search engine indexing. The title template (`%s | IndustryDB`) ensures consistent branding across all pages.

## Expected Score Improvements

| Category | Before (Est.) | After (Est.) | Target |
|---|---|---|---|
| **Performance** | 75-80 | 90-95 | >= 90 |
| **Accessibility** | 90-93 | 95+ | >= 95 |
| **Best Practices** | 85-90 | 95+ | >= 95 |
| **SEO** | 80-85 | 95+ | >= 95 |

### Performance Improvements Breakdown

| Optimization | Metric Improved | Estimated Gain |
|---|---|---|
| `font-display: swap` | FCP, LCP | -200-500ms |
| Preconnect hints (4 origins) | FCP, LCP | -100-300ms per origin |
| GA `lazyOnload` strategy | TTI, TBT | -100-200ms |
| Remove `beforeInteractive` GA | FCP, TTI | -50-150ms |
| Targeted CSS transitions | CLS, TBT | Reduced composite time |

### SEO Improvements Breakdown

| Optimization | Impact |
|---|---|
| Title on all pages | Unique title in search results |
| Description on all pages | Better search snippets |
| OpenGraph on all pages | Rich social sharing previews |
| Title template at locale level | Consistent branding |

## Existing Optimizations (Already in Place)

The codebase already had several strong performance practices:

- **No raw `<img>` tags** - All images use SVG icons via lucide-react (tree-shakeable)
- **Next.js Image optimization** configured (AVIF, WebP formats)
- **SWC minification** enabled for faster builds
- **Package import optimization** for lucide-react and radix-ui
- **Static asset caching** with 1-year immutable headers
- **Standalone output** for Docker optimization
- **Sentry integration** with appropriate sampling rates
- **Prefers-reduced-motion** support across all animations
- **WCAG AA accessibility** compliance

## Test Coverage

All performance optimizations are verified by automated tests:

- **`src/app/__tests__/layout-performance.test.tsx`** - 13 tests
  - Font configuration (display swap, preload)
  - Preconnect hints (fonts, Stripe, API)
  - GA script strategies (lazyOnload, afterInteractive)
  - Root metadata exports (title, description, openGraph, twitter, robots)
  - CSS performance (no universal transitions)

- **`src/app/__tests__/page-metadata.test.tsx`** - 19 tests
  - Auth page metadata (login, register, forgot-password, verify-email, reset-password)
  - Dashboard page metadata (leads, exports, analytics, settings, api-keys, saved-searches, organizations)
  - Locale layout metadata (title template)
  - Layout component rendering (children pass-through)

**Total: 32 tests, all passing**

## Files Changed

### Modified
- `src/app/layout.tsx` - Font config, preconnect hints, GA script strategy
- `src/app/globals.css` - Targeted transitions instead of universal
- `src/app/[locale]/layout.tsx` - Added metadata export
- `src/app/[locale]/dashboard/exports/layout.tsx` - Added openGraph
- `src/app/[locale]/dashboard/analytics/layout.tsx` - Added openGraph
- `src/app/[locale]/dashboard/api-keys/layout.tsx` - Added openGraph
- `src/app/[locale]/dashboard/saved-searches/layout.tsx` - Added openGraph
- `src/app/[locale]/dashboard/settings/layout.tsx` - Added openGraph
- `src/app/[locale]/dashboard/organizations/layout.tsx` - Added openGraph

### Created
- `src/app/[locale]/industries/layout.tsx` - Metadata for industries pages
- `src/app/[locale]/onboarding/layout.tsx` - Metadata for onboarding
- `src/app/[locale]/admin/users/layout.tsx` - Metadata for admin user management
- `src/app/[locale]/dashboard/organizations/[id]/layout.tsx` - Metadata for org details
- `src/app/[locale]/dashboard/organizations/[id]/members/layout.tsx` - Metadata for org members
- `src/app/[locale]/dashboard/organizations/[id]/settings/layout.tsx` - Metadata for org settings
- `LIGHTHOUSE_REPORT.md` - This report

## Recommendations for Future Work

1. **Web Vitals monitoring** - Add `reportWebVitals` to track real-user metrics
2. **Bundle analysis** - Run `next build --analyze` to identify large dependencies
3. **Dynamic imports** - Consider lazy loading chart.js and other heavy libraries
4. **Image optimization** - If product images are added, use Next.js `<Image>` with proper `width`/`height` and `loading="lazy"` for below-fold content
5. **Service Worker** - Consider adding for offline capability and asset caching
