# UX/Accessibility/Brand Audit Plan

> Generated on January 26, 2026
> Last updated: January 26, 2026

## Overview

This plan defines a comprehensive usability, accessibility, and brand alignment audit for FTC: Nihon. The audit will use Playwright for automated accessibility testing and manual review against the Design System (`Docs/product_docs/FTC_Nihon_Design_System.md`) to identify interface problems, brand inconsistencies, and areas for immediate improvement.

## Audit Scope

### Pages to Audit
| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/` | NOW/NEXT widgets, weather, quick actions |
| Schedule | `/schedule` | Daily timeline, day selector, activity cards |
| Activity Detail | `/schedule/[id]` | Individual activity details |
| Map | `/map` | Interactive map with pins, directions |
| Reservations | `/reservations` | Accommodation cards, booking details |

### Components to Audit
| Category | Components |
|----------|------------|
| Dashboard | NowWidget, NextWidget, WeatherWidget, QuickActions, AlertBanner, DayIndicator, DaySelector |
| Schedule | Timeline, ActivityCard, DayNav |
| Maps | Map, Pin, PinInfo, Directions |
| Reservations | AccommodationCard |
| UI Core | BottomNav, CategoryIcon |
| Layout | DashboardLayout, providers |

## Audit Categories

### 1. Accessibility (WCAG 2.1 AA)

**Automated Testing with Playwright + axe-core:**
- Color contrast ratios (4.5:1 normal text, 3:1 large text)
- Touch target sizes (minimum 44x44pt)
- Focus management and keyboard navigation
- ARIA labels and roles
- Heading hierarchy
- Alt text for images
- Form label associations

**Manual Verification:**
- Screen reader compatibility
- `prefers-reduced-motion` support
- Focus visibility
- Color-only information (semantic colors)

### 2. Brand Alignment (Design System Compliance)

**Colors:**
- Light mode: Coral (#F46B55) primary, Amber (#F5B800) secondary, cream backgrounds
- Dark mode: Vermillion (#E53935) primary, Orange (#F58220) secondary, indigo backgrounds
- Semantic colors for success/warning/error/info
- Category colors for activity types

**Typography:**
- Reggae One for display text (≥24px, sparingly used)
- Urbanist for body/UI (all weights 300-700)
- Correct type scale application
- Minimum 16px body text

**Spacing & Layout:**
- 8px base grid system
- Correct border radius scale (4-24px)
- Shadow usage per mode
- Card and component padding

**Components:**
- Button styles (primary, secondary, ghost)
- Card designs with category accent bars
- Input field styling
- Pills/tags with category colors
- Navigation bar height and blur

### 3. Usability & UX

**Information Architecture:**
- "Where should I be?" answerable in <3 seconds
- Logical navigation flow
- Clear visual hierarchy
- Progressive disclosure

**Interaction Design:**
- Touch-friendly targets
- Clear affordances
- Loading states
- Error handling
- Empty states
- Pull-to-refresh behavior

**Performance Perception:**
- Skeleton loading
- Optimistic updates
- Transition smoothness

**Offline Experience:**
- Offline indicators
- Cached data display
- Sync status visibility

### 4. Mobile-First / iOS Optimization

**PWA Requirements:**
- Safe area handling (notch, home indicator)
- Status bar integration
- Smooth scrolling
- Overscroll behavior
- Touch responsiveness

**iOS 16.4+ Considerations:**
- PWA push notification readiness
- Home screen add experience
- Standalone mode behavior

## Implementation Phases

### Phase 1: Automated Accessibility Testing Setup

**Goal:** Playwright + axe-core integration for automated a11y scans

- Install Playwright and @axe-core/playwright
- Create base test fixtures for each page
- Implement axe scan for all routes
- Generate accessibility violation report
- Verify: All pages have baseline a11y test coverage

### Phase 2: Design System Token Audit

**Goal:** Document all deviations from Design System

- Extract current color usage from components
- Compare against Design System color tokens
- Audit typography usage (font families, sizes, weights)
- Check spacing and layout values
- Document all deviations in audit report

### Phase 3: Component-Level UX Audit

**Goal:** Detailed review of each component

- Dashboard components (NOW/NEXT widgets, weather, etc.)
- Schedule components (timeline, activity cards, day nav)
- Map components (map, pins, directions)
- Reservation components (accommodation cards)
- Core UI components (bottom nav, category icons)

### Phase 4: Page-Level Flow Audit

**Goal:** End-to-end user journey review

- Dashboard first-load experience
- Day navigation and schedule browsing
- Activity detail drill-down
- Map interaction and directions
- Reservation information access

### Phase 5: Audit Report & Prioritization

**Goal:** Consolidated findings with action items

- Critical issues (blocking usability)
- High-priority issues (brand misalignment, a11y failures)
- Medium-priority issues (UX improvements)
- Low-priority issues (polish items)
- Recommendations prioritized by impact/effort

## Audit Methodology

### Playwright Test Structure

```typescript
// tests/audit/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audit', () => {
  test('Dashboard has no a11y violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
  // ... per-page tests
});
```

### Design System Comparison Approach

1. Extract current values from source code
2. Compare against Design System document
3. Flag discrepancies with severity
4. Propose remediation

### UX Heuristic Evaluation

Apply Nielsen's 10 Usability Heuristics:
1. Visibility of system status
2. Match between system and real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognize/recover from errors
10. Help and documentation

## Deliverables

| Artifact | Location | Purpose |
|----------|----------|---------|
| A11y Test Suite | `tests/audit/` | Automated accessibility checks |
| Audit Report | `Docs/ux-audit-report.md` | Full findings with screenshots |
| Issue List | `Docs/ux-audit-tasks.md` | Prioritized remediation tasks |
| Design Tokens | `Docs/design-token-diff.md` | Current vs. expected values |

## Success Criteria

**Audit Complete When:**
- [ ] All pages have Playwright a11y tests
- [ ] axe-core reports 0 critical violations
- [ ] Design System comparison documented
- [ ] Component-level issues catalogued
- [ ] Page flow issues catalogued
- [ ] Prioritized remediation plan created

## Dependencies

| Dependency | Purpose | Installation |
|------------|---------|--------------|
| @playwright/test | E2E testing framework | `npm i -D @playwright/test` |
| @axe-core/playwright | A11y testing | `npm i -D @axe-core/playwright` |

## References

- Design System: `Docs/product_docs/FTC_Nihon_Design_System.md`
- PRD: `Docs/product_docs/PRDs/FTC_Nihon_PRD.md`
- ADRs: `Docs/product_docs/ADRs/FTC_Nihon_ADRs.md`
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/

## Notes for Implementation

- Run all tests in mobile viewport (iPhone 13 Pro: 390x844)
- Test both light and dark modes
- Capture screenshots for visual comparison
- Document exact line numbers for code issues
- Prioritize fixes that impact "Erin Test" (least technical user)
