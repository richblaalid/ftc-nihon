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

### Task 7: Replace Hardcoded Colors in Map.tsx

**Issue:** Map component uses hardcoded hex colors instead of CSS variables

**Files to Modify:**
- `src/components/maps/Map.tsx`

**Changes:**
1. Category colors (lines 32-37) - extract to CSS variables or use Tailwind classes
2. Info window colors (lines 175-176) - use theme-aware values
3. User location marker (line 219) - use CSS variable

**Verification:**
- [ ] Pin colors consistent with design system
- [ ] Info window text readable in both light/dark mode

**Effort:** 30 minutes

---

## P2: Medium Priority

### Task 8: Add Dialog Role to DaySelector Modal

**Issue:** Modal missing `role="dialog"` and `aria-modal="true"`

**Files to Modify:**
- `src/components/dashboard/DaySelector.tsx`

**Change:**
```tsx
// Add to modal container
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="day-selector-title"
  ...
>
```

**Verification:**
- [ ] Screen reader announces modal correctly

**Effort:** 5 minutes

---

### Task 9: Add Tablist Role to DayNav

**Issue:** Day navigation tabs missing proper ARIA roles

**Files to Modify:**
- `src/components/schedule/DayNav.tsx`

**Changes:**
```tsx
// Add to container
<div role="tablist" aria-label="Day navigation">

// Add to each day button
<button
  role="tab"
  aria-selected={day === currentDay}
  ...
>
```

**Verification:**
- [ ] Screen reader announces tab selection

**Effort:** 10 minutes

---

### Task 10: Add Test IDs to Components

**Issue:** Missing `data-testid` attributes for automated testing

**Files to Modify:**
- `src/components/dashboard/QuickActions.tsx`
- `src/components/schedule/DayNav.tsx`
- `src/components/schedule/ActivityCard.tsx`

**Add:**
```tsx
data-testid="quick-actions"
data-testid="day-nav"
data-testid="activity-card"
```

**Verification:**
- [ ] Playwright tests can find elements

**Effort:** 5 minutes

---

### Task 11: Increase PinInfo Close Button Size

**Issue:** Close button padding `p-1` may be too small for touch

**Files to Modify:**
- `src/components/maps/PinInfo.tsx`

**Change:**
```tsx
// Before
<button className="p-1 ...">

// After
<button className="p-2 min-h-touch min-w-touch ...">
```

**Verification:**
- [ ] Close button easily tappable on mobile

**Effort:** 2 minutes

---

### Task 12: Show Last Synced Timestamp

**Issue:** No indication of when data was last synced

**Files to Modify:**
- `src/app/page.tsx`

**Add:**
```tsx
{lastSyncedAt && (
  <span className="text-xs text-foreground-secondary">
    Synced {formatRelativeTime(lastSyncedAt)}
  </span>
)}
```

**Verification:**
- [ ] Timestamp visible in header
- [ ] Updates after sync

**Effort:** 15 minutes

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

After completing P0 and P1 tasks:

- [ ] All Playwright tests pass (`npm run test:e2e`)
- [ ] No axe-core violations on any page
- [ ] VoiceOver can navigate all pages
- [ ] Keyboard navigation works throughout
- [ ] Design System compliance verified

---

## Effort Summary

| Priority | Tasks | Total Effort |
|----------|-------|--------------|
| P0 (Critical) | 2 | ~10 minutes |
| P1 (High) | 5 | ~50 minutes |
| P2 (Medium) | 5 | ~40 minutes |
| P3 (Low) | 4 | ~3 hours |

**Recommended Approach:**
1. Fix P0 tasks immediately (10 min)
2. Fix P1 tasks in next sprint (1 hour)
3. P2/P3 tasks can be addressed post-launch

---

*Generated by Claude Code UX Audit*
