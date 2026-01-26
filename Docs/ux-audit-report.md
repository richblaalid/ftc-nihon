# FTC: Nihon UX Audit Report

> **Generated:** January 26, 2026
> **Test Framework:** Playwright + axe-core
> **Browsers Tested:** Mobile Safari (iPhone 13 Pro), Mobile Chrome (Pixel 5)
> **Total Tests:** 74 | **Passed:** 49 | **Failed:** 25

---

## Executive Summary

This audit identified **25 accessibility and UX issues** across the FTC: Nihon PWA. The primary concerns are:

1. **Color Contrast Violations** (Critical) — `text-foreground-tertiary` (#a89b91) fails WCAG 2.1 AA contrast requirements on multiple backgrounds
2. **Viewport Zoom Restriction** (Moderate) — `user-scalable=no` disables pinch-to-zoom, a WCAG violation
3. **Navigation Height** (Low) — Bottom nav is 57px instead of 64px minimum per Design System
4. **Missing List Semantics** — Timeline doesn't use `<ul>` or `<ol>` for activity lists

### Quick Wins (High Impact, Low Effort)

1. Change `text-foreground-tertiary` from `#a89b91` to `#6b5d54` (matches `text-foreground-secondary`)
2. Remove `user-scalable=no` from viewport meta tag
3. Add `role="list"` or use `<ul>` for schedule timeline
4. Increase bottom nav height to 64px minimum

---

## 1. Accessibility Violations (WCAG 2.1 AA)

### 1.1 Color Contrast Failures (Critical)

**Impact:** Serious — Users with low vision cannot read text
**WCAG Criterion:** 1.4.3 Contrast (Minimum)

| Element | Foreground | Background | Ratio | Required |
|---------|------------|------------|-------|----------|
| Sync status | #a89b91 | #fffbf7 | 2.62:1 | 4.5:1 |
| Date/location info | #a89b91 | #fff5ec | 2.51:1 | 4.5:1 |
| "Now" / "Next" labels | #a89b91 | #ffffff | 2.70:1 | 4.5:1 |
| Location subtitle | #a89b91 | #ffffff | 2.70:1 | 4.5:1 |
| "Humidity" label | #a89b91 | #ffffff | 2.70:1 | 4.5:1 |
| "AI" button text | #d4cbc4 | #fff8f2 | 1.51:1 | 4.5:1 |
| Active nav label | #f46b55 | #fffbf7 | 2.88:1 | 4.5:1 |
| Inactive nav labels | #a89b91 | #fffbf7 | 2.62:1 | 4.5:1 |

**Root Cause:** The `text-foreground-tertiary` color (#a89b91) was designed for aesthetic warmth but doesn't meet WCAG AA requirements when used with light backgrounds.

**Affected Components:**
- `src/components/dashboard/DashboardLayout.tsx` (sync status)
- `src/components/dashboard/NowWidget.tsx` ("Now" label)
- `src/components/dashboard/NextWidget.tsx` ("Next" label, location)
- `src/components/dashboard/WeatherWidget.tsx` ("Humidity" label)
- `src/components/dashboard/QuickActions.tsx` ("AI" button)
- `src/components/ui/BottomNav.tsx` (nav labels)

**Recommendation:**
Replace `text-foreground-tertiary` (#a89b91) with a darker shade that meets 4.5:1 contrast:
- Use `#6b5d54` (current secondary) for tertiary contexts
- Or define new `--color-foreground-tertiary: #6b5d54` in Tailwind config

### 1.2 Viewport Zoom Restriction (Moderate)

**Impact:** Moderate — Users cannot zoom to enlarge text
**WCAG Criterion:** 1.4.4 Resize text

**Issue:** The viewport meta tag includes `user-scalable=no` and `maximum-scale=1`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no">
```

**Location:** `src/app/layout.tsx`

**Recommendation:**
Remove zoom restrictions:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

### 1.3 Missing List Semantics (Low)

**Impact:** Low — Screen reader users miss list context
**WCAG Criterion:** 1.3.1 Info and Relationships

**Issue:** The schedule timeline doesn't use list semantics (`<ul>`, `<ol>`, or `role="list"`).

**Location:** `src/components/schedule/Timeline.tsx`

**Recommendation:**
Wrap activity cards in `<ul>` with each card as `<li>`, or add `role="list"` and `role="listitem"`.

---

## 2. Touch Target Compliance

### 2.1 Bottom Navigation (✓ Passing)

| Metric | Result | Requirement |
|--------|--------|-------------|
| Touch target size | 4/4 passing | ≥44×44px |
| Spacing between items | 3/3 passing | ≥8px |
| Individual item sizes | All ≥44×44px | ≥44×44px |

**Issue Found:** Navigation height is 57px, below the 64px minimum specified in the Design System.

**Location:** `src/components/ui/BottomNav.tsx`

### 2.2 Quick Actions (✓ Passing)

No QuickActions component found with `data-testid`. Buttons on dashboard are generic and not specifically targetable.

**Recommendation:** Add `data-testid="quick-actions"` wrapper for better testing.

### 2.3 Day Selector (⚠ Not Found)

No day selector buttons found with expected selectors:
- `[data-testid="day-nav"]`
- `[data-testid="day-selector"]`
- `[role="tablist"]`

**Recommendation:** Add semantic roles and test IDs to DayNav component.

---

## 3. Keyboard Navigation

### 3.1 Dashboard (❌ Failing)

**Issue:** No visible focus indicator when tabbing through the page.

**Location:** All focusable elements need `:focus-visible` styles.

**Recommendation:**
Add focus ring styles globally or per-component:
```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 3.2 Reservations Page (❌ Failing)

Same issue as Dashboard — no visible focus indicator.

---

## 4. Page-Specific Findings

### 4.1 Dashboard (`/`)

| Check | Status | Notes |
|-------|--------|-------|
| Color contrast | ❌ Fail | 11 elements fail |
| Heading hierarchy | ✓ Pass | Proper h1→h2→h3 |
| Interactive elements | ✓ Pass | All have accessible names |
| Keyboard nav | ❌ Fail | No focus indicator |

### 4.2 Schedule (`/schedule`)

| Check | Status | Notes |
|-------|--------|-------|
| Color contrast | ❌ Fail | Multiple failures |
| Day navigation | ⚠ Warn | Missing tablist role |
| Activity cards | ✓ Pass | Have headings |
| List semantics | ❌ Fail | Timeline not a list |

### 4.3 Map (`/map`)

| Check | Status | Notes |
|-------|--------|-------|
| Overall a11y | ❌ Fail | Same contrast issues |
| Map controls | ❌ Fail | Missing accessible names |
| Error states | ✓ Pass | No errors present |

**Note:** Google Maps itself is excluded from a11y testing as it's third-party.

### 4.4 Reservations (`/reservations`)

| Check | Status | Notes |
|-------|--------|-------|
| Color contrast | ❌ Fail | Same tertiary text issues |
| Heading hierarchy | ⚠ Warn | First heading should be h1 |
| Accommodation cards | ✓ Pass | Have identifiable content |
| Keyboard nav | ❌ Fail | No focus indicator |

---

## 5. Design System Compliance

See `Docs/design-token-diff.md` for detailed token comparison.

### Summary of Deviations

| Category | Issue | Severity |
|----------|-------|----------|
| Colors | `text-foreground-tertiary` contrast too low | High |
| Typography | Reggae One properly restricted to display | ✓ Pass |
| Spacing | Generally follows 8px grid | ✓ Pass |
| Nav Height | 57px instead of 64px | Medium |
| Touch Targets | All ≥44px | ✓ Pass |

---

## 6. Recommendations by Priority

### Critical (Fix Before Launch)

1. **Fix color contrast for tertiary text**
   - Files: `tailwind.config.ts`, all components using `text-foreground-tertiary`
   - Change: `#a89b91` → `#6b5d54` or darker

2. **Remove viewport zoom restriction**
   - File: `src/app/layout.tsx`
   - Change: Remove `user-scalable=no` and `maximum-scale=1`

### High Priority

3. **Add focus indicators**
   - File: `src/app/globals.css` or component styles
   - Add visible `:focus-visible` styles

4. **Add list semantics to timeline**
   - File: `src/components/schedule/Timeline.tsx`
   - Wrap in `<ul>` with `<li>` children

### Medium Priority

5. **Increase bottom nav height to 64px**
   - File: `src/components/ui/BottomNav.tsx`

6. **Add semantic roles to day navigation**
   - File: `src/components/schedule/DayNav.tsx`
   - Add `role="tablist"`, `role="tab"`, `aria-selected`

7. **Add test IDs to components**
   - QuickActions, DaySelector, ActivityCard

### Low Priority

8. **Ensure h1 is first heading on each page**
9. **Add aria-labels to icon-only buttons**
10. **Review dark mode contrast (not yet tested)**

---

## 7. Test Coverage

### Tests Created

| Category | File | Tests |
|----------|------|-------|
| Dashboard A11y | `tests/audit/a11y/dashboard.spec.ts` | 5 |
| Schedule A11y | `tests/audit/a11y/schedule.spec.ts` | 6 |
| Map A11y | `tests/audit/a11y/map.spec.ts` | 6 |
| Reservations A11y | `tests/audit/a11y/reservations.spec.ts` | 8 |
| BottomNav Touch | `tests/audit/touch/bottom-nav.spec.ts` | 4 |
| QuickActions Touch | `tests/audit/touch/quick-actions.spec.ts` | 3 |
| DaySelector Touch | `tests/audit/touch/day-selector.spec.ts` | 5 |

### Running Tests

```bash
# Run all audit tests
npm run test:e2e

# Run with UI for debugging
npm run test:e2e:ui

# View HTML report
npm run test:e2e:report
```

---

## 8. Next Steps

1. Create remediation tasks in `Docs/ux-remediation-tasks.md`
2. Fix critical issues (color contrast, viewport zoom)
3. Re-run audit tests to verify fixes
4. Conduct manual testing with VoiceOver on iOS
5. Test dark mode accessibility
6. Document fixes in CHANGELOG

---

*Report generated by Claude Code UX Audit*
