# UX Remediation Tasks

> Generated from UX Audit Report on January 26, 2026
> Reference: `Docs/ux-audit-report.md`, `Docs/design-token-diff.md`

## Priority Levels

- **P0 (Critical)**: WCAG violations, must fix before launch
- **P1 (High)**: Brand misalignment, poor UX patterns
- **P2 (Medium)**: Polish issues, inconsistencies
- **P3 (Low)**: Nice-to-haves, micro-interactions

---

## P0: Critical (Fix Before Launch)

### Task 1: Fix Color Contrast for Tertiary Text ✅ COMPLETED

**Issue:** `--foreground-tertiary` (#a89b91) has only 2.6:1 contrast ratio, fails WCAG AA (requires 4.5:1)

**Files Modified:**
- `src/app/globals.css`

**Change Applied:**
```css
/* Before */
--foreground-tertiary: #a89b91;

/* After */
--foreground-tertiary: #6b5d54;
```

**Verification:**
- [x] TypeScript checks pass
- [x] Lint checks pass

**Completed:** January 26, 2026

---

### Task 2: Remove Viewport Zoom Restriction ✅ COMPLETED

**Issue:** `user-scalable=no` and `maximum-scale=1` prevent users from zooming, violates WCAG 1.4.4

**Files Modified:**
- `src/app/layout.tsx`

**Change Applied:**
Removed `maximumScale: 1` and `userScalable: false` from viewport config.

**Verification:**
- [x] TypeScript checks pass
- [x] Lint checks pass

**Completed:** January 26, 2026

---

## P1: High Priority

### Task 3: Add Focus Indicators ✅ COMPLETED

**Issue:** No visible focus ring when using keyboard navigation

**Files Modified:**
- `src/app/globals.css`

**Change Applied:**
Fixed focus-visible styles to use proper CSS `outline` property instead of Tailwind utilities.

**Verification:**
- [x] TypeScript checks pass
- [x] Lint checks pass

**Completed:** January 26, 2026

---

### Task 4: Add List Semantics to Timeline ✅ COMPLETED

**Issue:** Timeline activities not wrapped in list elements, screen readers miss list context

**Files Modified:**
- `src/components/schedule/Timeline.tsx`

**Change Applied:**
- Changed `<div>` wrapper to `<ol className="list-none">`
- Changed activity `<div>` wrappers to `<li>`
- Updated ref type from `HTMLDivElement` to `HTMLLIElement`

**Verification:**
- [x] TypeScript checks pass
- [x] Lint checks pass

**Completed:** January 26, 2026

---

### Task 5: Fix BottomNav Height ✅ COMPLETED

**Issue:** Current height 56px (h-14), Design System specifies 64px minimum

**Files Modified:**
- `src/components/ui/BottomNav.tsx`
- `src/app/layout.tsx` (updated pb-14 to pb-16)

**Change Applied:**
Changed `h-14` to `h-16` (64px).

**Verification:**
- [x] TypeScript checks pass
- [x] Lint checks pass

**Completed:** January 26, 2026

---

### Task 6: Increase BottomNav Label Size ✅ COMPLETED

**Issue:** Label text is 10px (7.5pt), too small for comfortable reading

**Files Modified:**
- `src/components/ui/BottomNav.tsx`

**Change Applied:**
Changed `text-[10px]` to `text-xs` (12px).

**Verification:**
- [x] TypeScript checks pass
- [x] Lint checks pass

**Completed:** January 26, 2026

---

### Task 7: Replace Hardcoded Colors in Map.tsx ✅ COMPLETED

**Issue:** Map component uses hardcoded hex colors instead of CSS variables

**Files Modified:**
- `src/components/maps/Map.tsx`

**Changes Applied:**
1. Added `getCategoryColor()` helper that reads `--category-*` CSS variables at runtime
2. Added `getThemeColor()` helper for reading any CSS variable with fallback
3. Pin markers now use theme-aware category colors (supports dark mode)
4. Info window uses theme colors for text (`--foreground`, `--foreground-secondary`, `--foreground-tertiary`)
5. Info window background uses `--background` for theme consistency
6. User location marker uses `--primary` instead of hardcoded Google blue

**Verification:**
- [x] Pin colors consistent with design system
- [x] Info window text readable in both light/dark mode
- [x] All map tests pass

**Completed:** January 26, 2026

---

## P2: Medium Priority

### Task 8: Add Dialog Role to DaySelector Modal ✅ COMPLETED

**Issue:** Modal missing `role="dialog"` and `aria-modal="true"`

**Files Modified:**
- `src/components/dashboard/DaySelector.tsx`

**Changes Applied:**
- Added `role="dialog"` and `aria-modal="true"` to modal container
- Added `aria-labelledby="day-selector-title"` pointing to header
- Added `role="presentation"` to backdrop
- Added `role="listbox"` to day list container
- Added `role="option"` and `aria-selected` to day buttons
- Added `data-testid="day-option-{day}"` for testing

**Verification:**
- [x] Screen reader announces modal correctly
- [x] All tests pass

**Completed:** January 26, 2026

---

### Task 9: Add Navigation Semantics to DayNav ✅ COMPLETED

**Issue:** Day navigation missing proper ARIA roles

**Files Modified:**
- `src/components/schedule/DayNav.tsx`

**Changes Applied:**
- Changed wrapper `<div>` to `<nav aria-label="Day navigation">`
- Improved aria-labels on prev/next buttons to say "Go to day N"
- Added `aria-hidden="true"` to arrow icons
- Added `aria-live="polite"` and `aria-atomic="true"` for day announcements
- Added `data-testid="day-nav"`, `data-testid="day-nav-prev"`, `data-testid="day-nav-next"`

**Note:** DayNav uses prev/next button pattern, not tablist. This is semantically correct for stepped navigation.

**Verification:**
- [x] Screen reader announces day changes
- [x] All tests pass

**Completed:** January 26, 2026

---

### Task 10: Add Test IDs to Components ✅ COMPLETED

**Issue:** Missing `data-testid` attributes for automated testing

**Files Modified:**
- `src/components/dashboard/QuickActions.tsx`
- `src/components/schedule/DayNav.tsx`
- `src/components/schedule/ActivityCard.tsx`
- `src/components/maps/PinInfo.tsx`
- `src/components/dashboard/DaySelector.tsx`
- `src/app/page.tsx`

**Test IDs Added:**
- `data-testid="quick-actions"` - QuickActions grid
- `data-testid="quick-action-schedule"` - Schedule button
- `data-testid="quick-action-map"` - Map button
- `data-testid="quick-action-hotels"` - Hotels button
- `data-testid="quick-action-ai"` - AI button (disabled)
- `data-testid="day-nav"` - DayNav container
- `data-testid="day-nav-prev"` - Previous day button
- `data-testid="day-nav-next"` - Next day button
- `data-testid="activity-card"` - ActivityCard
- `data-testid="pin-info-close"` - PinInfo close button
- `data-testid="day-option-{n}"` - DaySelector day options
- `data-testid="sync-status"` - Sync status indicator

**Verification:**
- [x] Playwright tests can find elements
- [x] All tests pass

**Completed:** January 26, 2026

---

### Task 11: Increase PinInfo Close Button Size ✅ COMPLETED

**Issue:** Close button padding `p-1` may be too small for touch

**Files Modified:**
- `src/components/maps/PinInfo.tsx`

**Changes Applied:**
- Changed from `p-1` to `p-2 min-h-touch min-w-touch flex items-center justify-center`
- Improved aria-label from "Close" to "Close activity info"
- Added `aria-hidden="true"` to SVG icon
- Added `data-testid="pin-info-close"`

**Verification:**
- [x] Close button easily tappable on mobile (44x44 minimum)
- [x] All tests pass

**Completed:** January 26, 2026

---

### Task 12: Show Last Synced Timestamp ✅ COMPLETED

**Issue:** No indication of when data was last synced

**Files Modified:**
- `src/app/page.tsx`

**Changes Applied:**
- Sync status now shows relative time ("Just now", "5m ago", "2h ago", etc.)
- Added `<time>` element with proper `datetime` attribute for semantics
- Added `title` attribute showing full timestamp on hover
- Added `aria-live="polite"` for screen reader announcements
- Added `data-testid="sync-status"`
- Used existing `formatLastSyncTime` helper from sync-store

**Verification:**
- [x] Timestamp visible in header
- [x] Updates after sync
- [x] All tests pass

**Completed:** January 26, 2026

---

## P3: Low Priority

### Task 13: Add Page Transition Animations

**Issue:** No animations between page navigations

**Options:**
- Use `framer-motion` for page transitions
- CSS-only fade transitions
- Next.js App Router built-in transitions

**Effort:** 1-2 hours

---

### Task 14: Preserve Scroll Position on Back Navigation

**Issue:** Scroll position lost when navigating back

**Solution:** Use Next.js scroll restoration or custom scroll position store

**Effort:** 30 minutes

---

### Task 15: Add Current Time Indicator to Timeline

**Issue:** No visual marker for current time on schedule

**Design:** Horizontal line with time label positioned at current time

**Effort:** 1 hour

---

### Task 16: Map Auto-Fit to Show All Pins

**Issue:** Initial map view may not show all activities for the day

**Solution:** Calculate bounds from activity coordinates, use `fitBounds()`

**Effort:** 30 minutes

---

## Verification Checklist

After completing P0, P1, and P2 tasks:

- [x] All Playwright tests pass (74/74 passing)
- [x] No axe-core violations on any page
- [x] VoiceOver can navigate all pages
- [x] Keyboard navigation works throughout
- [x] Design System compliance verified
- [x] Touch targets meet 44x44 minimum
- [x] ARIA roles properly implemented

---

## Progress Summary

| Priority | Tasks | Status |
|----------|-------|--------|
| P0 (Critical) | 2 | ✅ Completed |
| P1 (High) | 5 | ✅ Completed |
| P2 (Medium) | 5 | ✅ Completed |
| P3 (Low) | 4 | Pending |

**Completed:** January 26, 2026

**Remaining:**
- Tasks 13-16 (P3): Nice-to-have enhancements for post-launch
  - Page transition animations
  - Scroll position preservation
  - Current time indicator on timeline
  - Map auto-fit to show all pins

---

*Generated by Claude Code UX Audit*
