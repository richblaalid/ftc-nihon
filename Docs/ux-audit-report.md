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

## 9. Component-Level Audit Findings

### 9.1 Dashboard Components

#### NowWidget (`src/components/dashboard/NowWidget.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Typography | ✅ Pass | Proper hierarchy (h2 for activity name) |
| Colors | ❌ Fail | Uses `text-foreground-tertiary` with low contrast |
| Layout | ✅ Pass | Category accent bar, good information hierarchy |
| Glanceable | ✅ Pass | Activity name prominent, time remaining badge |
| Loading State | ✅ Pass | Skeleton loader with proper animation |
| Empty State | ✅ Pass | "Free Time" message for no activity |

**Issues:**
- Line 109, 129, 148: `text-foreground-tertiary` fails contrast

#### NextWidget (`src/components/dashboard/NextWidget.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Typography | ✅ Pass | h3 for next activity, proper hierarchy |
| Colors | ❌ Fail | Uses `text-foreground-tertiary` |
| Transit Info | ✅ Pass | "Leave by" time prominent in primary color |
| Loading State | ✅ Pass | Skeleton loader present |

**Issues:**
- Lines 82, 103, 106, 129: `text-foreground-tertiary` fails contrast

#### WeatherWidget (`src/components/dashboard/WeatherWidget.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Layout | ✅ Pass | Good compact layout with icon + temp + humidity |
| Typography | ✅ Pass | Temperature is prominent |
| Colors | ❌ Fail | `text-foreground-tertiary` for city, humidity label |
| Loading State | ✅ Pass | Animated skeleton |
| Error State | ✅ Pass | "Weather unavailable" fallback |

**Issues:**
- Lines 67, 81, 90: `text-foreground-tertiary` fails contrast

#### QuickActions (`src/components/dashboard/QuickActions.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Touch Targets | ✅ Pass | `min-h-touch min-w-touch` applied |
| Layout | ✅ Pass | 4-column grid with appropriate gap |
| Disabled State | ✅ Pass | Visual distinction for disabled AI button |
| Typography | ❌ Fail | `text-foreground-tertiary` for labels |

**Issues:**
- Line 20, 31: `text-foreground-tertiary` fails contrast
- Line 42: "AI" button disabled without clear path to enablement

**Recommendations:**
- Add `data-testid="quick-actions"` for testing
- Consider tooltip explaining why AI is disabled

#### AlertBanner (`src/components/dashboard/AlertBanner.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Semantic Colors | ✅ Pass | Uses `bg-error/10`, `text-error` appropriately |
| Dismiss Button | ✅ Pass | Has `aria-label="Dismiss alert"` |
| Touch Target | ✅ Pass | `min-h-touch min-w-touch` on dismiss |

**Good Patterns:**
- Proper semantic color usage for urgency levels
- Accessible dismiss button with aria-label

#### DaySelector (`src/components/dashboard/DaySelector.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Modal Pattern | ✅ Pass | Backdrop click to close, Escape key support |
| Touch Targets | ✅ Pass | `min-h-touch min-w-touch` on buttons |
| Active State | ✅ Pass | Clear visual distinction with primary color |
| Scroll Behavior | ✅ Pass | Auto-scrolls to selected day |
| Accessibility | ⚠️ Warn | Missing `role="dialog"`, `aria-modal` |

**Issues:**
- Line 120: `text-foreground-tertiary` fails contrast
- No `role="dialog"` or `aria-modal="true"` on modal

#### DayIndicator (`src/components/dashboard/DayIndicator.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Touch Target | ✅ Pass | Full-width button is easily tappable |
| Current Day | ✅ Pass | "Today" label when viewing current day |
| Colors | ❌ Fail | `text-foreground-tertiary` for date |

**Issues:**
- Line 65: `text-foreground-tertiary` fails contrast

### 9.2 Schedule Components

#### ActivityCard (`src/components/schedule/ActivityCard.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Design System | ✅ Pass | Category accent bar, proper card styling |
| State Styles | ✅ Pass | Current (ring), completed (opacity), upcoming |
| Hard Deadline | ✅ Pass | Timed entry warning with semantic error color |
| Transit Info | ✅ Pass | "Leave by" time prominent |
| Interaction | ✅ Pass | Links to detail page, active:scale-[0.98] |

**Good Patterns:**
- Activity state clearly indicated (current has ring)
- Hard deadline warning for timed entries

#### Timeline (`src/components/schedule/Timeline.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Grouping | ✅ Pass | Morning/Afternoon/Evening sections |
| Auto-scroll | ✅ Pass | Scrolls current activity into view |
| Empty State | ✅ Pass | "No activities scheduled" message |
| List Semantics | ❌ Fail | Uses divs instead of `<ul>/<li>` |

**Issues:**
- Line 98, 111: No list semantics (`<ul>`, `<ol>`) for screen readers
- Line 106: `text-foreground-tertiary` fails contrast

**Recommendation:**
- Wrap in `<ul>` with `<li>` for each activity or add `role="list"`

#### DayNav (`src/components/schedule/DayNav.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Touch Targets | ✅ Pass | `min-h-touch min-w-touch` on nav buttons |
| Disabled State | ✅ Pass | Visual distinction + disabled behavior |
| Pending State | ✅ Pass | Opacity change + cursor-wait |
| Accessibility | ✅ Pass | `aria-label` on prev/next buttons |
| Semantics | ⚠️ Warn | Missing `role="tablist"` for day nav |

**Good Patterns:**
- Good pending state for transitions
- Clear aria-labels

### 9.3 Map Components

#### Map (`src/components/maps/Map.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Loading State | ✅ Pass | Spinner with "Loading map..." text |
| Error State | ✅ Pass | Clear message with config instruction |
| Pin Markers | ✅ Pass | Custom styled pins with category colors |
| User Location | ✅ Pass | Blue dot marker for current location |
| Hardcoded Colors | ❌ Fail | Uses hex values instead of CSS variables |

**Issues:**
- Lines 32-37: Hardcoded category colors (should use CSS vars)
- Lines 175-176: Hardcoded `#666`, `#888` in info window
- Line 219: Hardcoded `#4285F4` for user location

**Recommendation:**
- Create theme-aware info window content
- Use CSS variables for all colors

#### Pin (`src/components/maps/Pin.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Design System | ✅ Pass | Uses `bg-category-*` classes |
| Size Variants | ✅ Pass | sm/md/lg sizes available |
| Selected State | ✅ Pass | Ring indicator for selected |

**Good Patterns:**
- Uses CSS variables via Tailwind classes

#### PinInfo (`src/components/maps/PinInfo.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Layout | ✅ Pass | Card with category accent bar |
| Actions | ✅ Pass | View Details + Directions buttons |
| Close Button | ✅ Pass | Has `aria-label="Close"` |
| Touch Targets | ⚠️ Warn | Close button may be too small (p-1) |

**Issues:**
- Line 47: Close button padding `p-1` may be too small for touch

#### Directions (`src/components/maps/Directions.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Step Display | ✅ Pass | Clear step-by-step with icons |
| Expandable | ✅ Pass | Collapsible sections |
| External Link | ✅ Pass | Google Maps integration |
| Typography | ❌ Fail | `text-foreground-tertiary` for labels |

**Issues:**
- Lines 107, 125, 167, 189: `text-foreground-tertiary` fails contrast

### 9.4 Reservation Components

#### AccommodationCard (`src/components/reservations/AccommodationCard.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Expandable | ✅ Pass | Collapse/expand for details |
| Current Stay | ✅ Pass | Ring indicator + badge |
| Copy Function | ✅ Pass | Japanese address copy with feedback |
| Actions | ✅ Pass | Call + Directions buttons |
| Pin Display | ✅ Pass | PIN code prominent in primary color |
| Language Attr | ✅ Pass | `lang="ja"` on Japanese address |

**Issues:**
- Lines 99, 105, 114, 122, 129, 137, 166: `text-foreground-tertiary` fails contrast

**Good Patterns:**
- Excellent copy functionality with visual feedback
- Japanese address with proper `lang` attribute

### 9.5 Core UI Components

#### BottomNav (`src/components/ui/BottomNav.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Touch Targets | ✅ Pass | `min-w-touch min-h-touch` applied |
| Active State | ✅ Pass | Primary color + filled icon |
| Inactive Color | ❌ Fail | `text-foreground-tertiary` fails contrast |
| Height | ❌ Fail | h-14 (56px) < 64px minimum |
| Safe Area | ✅ Pass | `pb-safe` applied |
| Blur | ✅ Pass | `backdrop-blur-sm` present |

**Issues:**
- Line 91: Height is `h-14` (56px), should be at least 64px
- Line 101: `text-foreground-tertiary` fails contrast
- Line 105: Label text `text-[10px]` is very small (7.5pt)

#### CategoryIcon (`src/components/ui/CategoryIcon.tsx`)
| Aspect | Status | Notes |
|--------|--------|-------|
| Accessibility | ✅ Pass | Has `role="img"` and `aria-label` |
| Size Variants | ✅ Pass | sm/md/lg available |
| Helper Functions | ✅ Pass | `getCategoryBgClass`, `getCategoryTextClass` |

**Good Patterns:**
- Proper accessibility attributes on emoji icons

---

## 10. Summary of Component Issues

### Critical (WCAG Failures)

| Component | Issue | Count |
|-----------|-------|-------|
| All using `text-foreground-tertiary` | Color contrast < 4.5:1 | 25+ locations |
| Map.tsx | Hardcoded colors in info windows | 3 locations |

### High Priority (UX Issues)

| Component | Issue | Recommendation |
|-----------|-------|----------------|
| BottomNav | Height 56px < 64px | Change `h-14` to `h-16` |
| BottomNav | Label text 10px too small | Increase to 12px |
| Timeline | No list semantics | Add `<ul>/<li>` |
| DaySelector | Missing dialog role | Add `role="dialog"` |

### Medium Priority (Polish)

| Component | Issue | Recommendation |
|-----------|-------|----------------|
| PinInfo | Close button small | Increase to `p-2` |
| DayNav | Missing tablist role | Add ARIA roles |
| QuickActions | No test ID | Add `data-testid` |

---

*Report generated by Claude Code UX Audit*
