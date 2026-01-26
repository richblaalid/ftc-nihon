# UX Audit Implementation Tasks

> Generated from Docs/ux-audit-plan.md on January 26, 2026
>
> **Instructions for Claude:** Complete tasks sequentially within each phase.
> Mark each task complete immediately after implementation.
> Run tests after each task. Commit after each working change.

## Progress Summary

- Phase 1: [x] Complete — Playwright + axe-core Setup
- Phase 2: [x] Complete — Design Token Audit
- Phase 3: [ ] Not Started — Component Audit
- Phase 4: [ ] Not Started — Page Flow Audit
- Phase 5: [ ] Not Started — Report & Prioritization
- **Audit Status:** In Progress (Phase 1 Complete)

---

## Phase 1: Automated Accessibility Testing Setup

### 1.0 Pre-flight

- [x] 1.0.1: Verify dev server can start on port 3001
  - Test: `npm run dev` starts without errors
- [x] 1.0.2: Verify current build passes
  - Test: `npm run build` completes successfully

### 1.1 Playwright Installation

- [x] 1.1.1: Install Playwright test framework
  - Files: package.json
  - Command: `npm i -D @playwright/test`
  - Test: Package installed in devDependencies

- [x] 1.1.2: Install Playwright browsers
  - Command: `npx playwright install chromium webkit`
  - Test: Browsers downloaded successfully

- [x] 1.1.3: Create Playwright configuration for mobile testing
  - Files: playwright.config.ts
  - Config: iPhone 13 Pro viewport (390x844), webkit browser, baseURL localhost:3001
  - Test: Config file created with correct settings

- [x] 1.1.4: Add Playwright test scripts to package.json
  - Files: package.json
  - Scripts: `"test:e2e": "playwright test"`, `"test:e2e:ui": "playwright test --ui"`
  - Test: Scripts added

### 1.2 axe-core Integration

- [x] 1.2.1: Install @axe-core/playwright
  - Files: package.json
  - Command: `npm i -D @axe-core/playwright`
  - Test: Package installed

- [x] 1.2.2: Create accessibility test fixture
  - Files: tests/audit/fixtures.ts
  - Content: AxeBuilder helper, common test setup
  - Test: File created with correct imports

- [x] 1.2.3: Create Dashboard accessibility test
  - Files: tests/audit/a11y/dashboard.spec.ts
  - Tests: axe scan on `/`, check for violations
  - Test: Test file created

- [x] 1.2.4: Create Schedule page accessibility test
  - Files: tests/audit/a11y/schedule.spec.ts
  - Tests: axe scan on `/schedule`, `/schedule?day=1`
  - Test: Test file created

- [x] 1.2.5: Create Map page accessibility test
  - Files: tests/audit/a11y/map.spec.ts
  - Tests: axe scan on `/map`
  - Test: Test file created

- [x] 1.2.6: Create Reservations page accessibility test
  - Files: tests/audit/a11y/reservations.spec.ts
  - Tests: axe scan on `/reservations`
  - Test: Test file created

### 1.3 Touch Target Audit Tests

- [x] 1.3.1: Create touch target size test utility
  - Files: tests/audit/utils/touch-targets.ts
  - Content: Function to measure element dimensions, assert ≥44x44pt
  - Test: Utility function created

- [x] 1.3.2: Add touch target tests for BottomNav
  - Files: tests/audit/touch/bottom-nav.spec.ts
  - Tests: All nav items ≥44x44pt, spacing ≥8px
  - Test: Test file created

- [x] 1.3.3: Add touch target tests for QuickActions
  - Files: tests/audit/touch/quick-actions.spec.ts
  - Tests: All action buttons ≥44x44pt
  - Test: Test file created

- [x] 1.3.4: Add touch target tests for DaySelector
  - Files: tests/audit/touch/day-selector.spec.ts
  - Tests: Day pills ≥44x44pt
  - Test: Test file created

### 1.4 Baseline Test Run

- [x] 1.4.1: Run all accessibility tests and document baseline
  - Command: `npm run test:e2e`
  - Output: Document all failures in Docs/ux-audit-report.md (a11y section)
  - Test: Test run completes, violations documented

**Phase 1 Checkpoint:**

- [x] Playwright + axe-core installed and configured
- [x] All pages have a11y test coverage
- [x] Touch target tests for key interactive elements
- [x] Baseline violations documented
- [ ] Commit: "test: add Playwright accessibility audit suite"

---

## Phase 2: Design System Token Audit

### 2.1 Color Token Extraction

- [x] 2.1.1: Extract color values from tailwind.config.ts
  - Files: Docs/design-token-diff.md (create)
  - Content: Table of current tailwind color definitions
  - Test: Token list extracted

- [x] 2.1.2: Compare colors to Design System specification
  - Files: Docs/design-token-diff.md
  - Content: Side-by-side comparison, flag discrepancies
  - Reference: Docs/product_docs/FTC_Nihon_Design_System.md Section 3
  - Test: Comparison documented

- [x] 2.1.3: Grep for hardcoded colors in components
  - Command: Search for `#[0-9A-Fa-f]{3,6}`, `rgb(`, `hsl(`
  - Files: Docs/design-token-diff.md
  - Content: List of hardcoded colors with file locations
  - Test: Hardcoded colors documented

### 2.2 Typography Token Audit

- [x] 2.2.1: Extract font configurations from tailwind.config.ts and globals.css
  - Files: Docs/design-token-diff.md
  - Content: Current font-family, font-size, line-height settings
  - Test: Typography tokens extracted

- [x] 2.2.2: Compare typography to Design System specification
  - Files: Docs/design-token-diff.md
  - Reference: Docs/product_docs/FTC_Nihon_Design_System.md Section 4
  - Content: Verify Reggae One for display, Urbanist for body
  - Test: Comparison documented

- [x] 2.2.3: Audit Reggae One usage (display text only, ≥24px)
  - Files: Docs/design-token-diff.md
  - Content: All usages of font-display class, verify appropriateness
  - Test: Usage documented

### 2.3 Spacing & Layout Token Audit

- [x] 2.3.1: Verify 8px spacing grid compliance
  - Files: Docs/design-token-diff.md
  - Content: Document any non-8px-grid spacing values
  - Test: Spacing documented

- [x] 2.3.2: Audit border radius usage
  - Files: Docs/design-token-diff.md
  - Reference: Design System Section 5.2 (4/8/12/16/24px scale)
  - Test: Border radius audit complete

- [x] 2.3.3: Audit shadow usage per mode
  - Files: Docs/design-token-diff.md
  - Content: Verify light-mode vs dark-mode shadows
  - Test: Shadow audit complete

### 2.4 Component Style Audit

- [x] 2.4.1: Audit Button component styles
  - Files: Docs/design-token-diff.md
  - Reference: Design System Section 7.1
  - Content: Compare primary/secondary/ghost button specs
  - Test: Button audit complete

- [x] 2.4.2: Audit Card component styles
  - Files: Docs/design-token-diff.md
  - Reference: Design System Section 7.2
  - Content: Background, radius, padding, shadow, category accent bars
  - Test: Card audit complete

- [x] 2.4.3: Audit Navigation Bar styles
  - Files: Docs/design-token-diff.md
  - Reference: Design System Section 7.5
  - Content: Height 64px + safe area, blur, border, icon sizes
  - Test: Nav audit complete

**Phase 2 Checkpoint:**

- [x] All design tokens extracted and documented
- [x] Discrepancies flagged with severity
- [x] Docs/design-token-diff.md complete
- [ ] Commit: "docs: complete design token audit"

---

## Phase 3: Component-Level UX Audit

### 3.1 Dashboard Components

- [ ] 3.1.1: Audit NowWidget for brand alignment and UX
  - Files: src/components/dashboard/NowWidget.tsx
  - Check: Typography, colors, layout, "glanceable" requirement
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 3.1.2: Audit NextWidget for brand alignment and UX
  - Files: src/components/dashboard/NextWidget.tsx
  - Check: Typography, colors, layout, information hierarchy
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 3.1.3: Audit WeatherWidget for brand alignment and UX
  - Files: src/components/dashboard/WeatherWidget.tsx
  - Check: Icon style, data display, loading states
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 3.1.4: Audit QuickActions for touch targets and brand
  - Files: src/components/dashboard/QuickActions.tsx
  - Check: Button sizes, spacing, icons, labels
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 3.1.5: Audit AlertBanner for visibility and urgency
  - Files: src/components/dashboard/AlertBanner.tsx
  - Check: Semantic colors, contrast, icon usage
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 3.1.6: Audit DaySelector for usability
  - Files: src/components/dashboard/DaySelector.tsx
  - Check: Touch targets, active state, scroll behavior
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 3.1.7: Audit DayIndicator for clarity
  - Files: src/components/dashboard/DayIndicator.tsx
  - Check: Typography, current day highlight
  - Output: Add findings to Docs/ux-audit-report.md

### 3.2 Schedule Components

- [ ] 3.2.1: Audit ActivityCard for Design System compliance
  - Files: src/components/schedule/ActivityCard.tsx
  - Check: Category accent bar, time prominence, icon placement
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 3.2.2: Audit Timeline for visual clarity
  - Files: src/components/schedule/Timeline.tsx
  - Check: Time markers, current time indicator, spacing
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 3.2.3: Audit DayNav for navigation clarity
  - Files: src/components/schedule/DayNav.tsx
  - Check: Touch targets, state indicators, transitions
  - Output: Add findings to Docs/ux-audit-report.md

### 3.3 Map Components

- [ ] 3.3.1: Audit Map component for usability
  - Files: src/components/maps/Map.tsx
  - Check: Loading states, error states, controls accessibility
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 3.3.2: Audit Pin component for visibility
  - Files: src/components/maps/Pin.tsx
  - Check: Size, category colors, contrast on map
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 3.3.3: Audit PinInfo component for readability
  - Files: src/components/maps/PinInfo.tsx
  - Check: Text size, layout, action buttons
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 3.3.4: Audit Directions component for clarity
  - Files: src/components/maps/Directions.tsx
  - Check: Step legibility, transit icons, time display
  - Output: Add findings to Docs/ux-audit-report.md

### 3.4 Reservation Components

- [ ] 3.4.1: Audit AccommodationCard for information display
  - Files: src/components/reservations/AccommodationCard.tsx
  - Check: Address display, check-in/out times, PIN visibility, copy actions
  - Output: Add findings to Docs/ux-audit-report.md

### 3.5 Core UI Components

- [ ] 3.5.1: Audit BottomNav for iOS compliance
  - Files: src/components/ui/BottomNav.tsx
  - Check: Safe area, height, touch targets, active states
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 3.5.2: Audit CategoryIcon for consistency
  - Files: src/components/ui/CategoryIcon.tsx
  - Check: Icon set consistency, category color application
  - Output: Add findings to Docs/ux-audit-report.md

**Phase 3 Checkpoint:**

- [ ] All components audited
- [ ] Issues categorized by severity
- [ ] Component-level findings in audit report
- [ ] Commit: "docs: complete component-level UX audit"

---

## Phase 4: Page-Level Flow Audit

### 4.1 Dashboard Page Flow

- [ ] 4.1.1: Audit Dashboard first-load experience
  - Route: `/`
  - Check: Time to "Where should I be?" answer (<3 seconds), loading states
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 4.1.2: Audit Dashboard information hierarchy
  - Route: `/`
  - Check: NOW vs NEXT prominence, weather placement, quick actions
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 4.1.3: Test Dashboard offline behavior
  - Route: `/` (with network disabled)
  - Check: Cached data display, sync status, error handling
  - Output: Add findings to Docs/ux-audit-report.md

### 4.2 Schedule Page Flow

- [ ] 4.2.1: Audit Schedule page navigation
  - Route: `/schedule`
  - Check: Day selection, URL state sync, transitions
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 4.2.2: Audit Schedule current activity highlighting
  - Route: `/schedule`
  - Check: Visual emphasis on current/next activity, auto-scroll
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 4.2.3: Audit Activity Detail drill-down
  - Route: `/schedule/[id]`
  - Check: Back navigation, content display, action buttons
  - Output: Add findings to Docs/ux-audit-report.md

### 4.3 Map Page Flow

- [ ] 4.3.1: Audit Map page initial state
  - Route: `/map`
  - Check: Initial zoom, user location, activity pins
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 4.3.2: Audit Map pin interaction flow
  - Route: `/map`
  - Check: Pin tap → info display → navigation action
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 4.3.3: Audit Directions flow
  - Route: `/map`
  - Check: Transit options, walking directions, ETA display
  - Output: Add findings to Docs/ux-audit-report.md

### 4.4 Reservations Page Flow

- [ ] 4.4.1: Audit Reservations page layout
  - Route: `/reservations`
  - Check: Accommodation list, date grouping, information density
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 4.4.2: Audit Reservation detail access
  - Route: `/reservations`
  - Check: PIN reveal, address copy, check-in time visibility
  - Output: Add findings to Docs/ux-audit-report.md

### 4.5 Cross-Page Navigation

- [ ] 4.5.1: Audit Bottom Navigation usability
  - Check: Active states, transitions, touch feedback
  - Output: Add findings to Docs/ux-audit-report.md

- [ ] 4.5.2: Audit page transition smoothness
  - Check: Animation timing, skeleton loading, state preservation
  - Output: Add findings to Docs/ux-audit-report.md

**Phase 4 Checkpoint:**

- [ ] All page flows audited
- [ ] User journey issues documented
- [ ] Cross-cutting concerns identified
- [ ] Commit: "docs: complete page flow UX audit"

---

## Phase 5: Audit Report & Prioritization

### 5.1 Report Compilation

- [ ] 5.1.1: Consolidate all findings into Docs/ux-audit-report.md
  - Sections: Executive Summary, Accessibility, Brand Alignment, Usability, Recommendations
  - Test: Report file complete

- [ ] 5.1.2: Add screenshots for major issues
  - Location: Docs/ux-audit-screenshots/
  - Test: Screenshots captured for visual issues

- [ ] 5.1.3: Cross-reference with Design System
  - Content: Link each brand issue to specific Design System section
  - Test: References added

### 5.2 Issue Prioritization

- [ ] 5.2.1: Categorize issues by severity
  - Critical: Blocking usability, WCAG failures
  - High: Brand misalignment, poor UX patterns
  - Medium: Polish issues, inconsistencies
  - Low: Nice-to-haves, micro-interactions
  - Test: All issues categorized

- [ ] 5.2.2: Create prioritized remediation task list
  - Files: Docs/ux-remediation-tasks.md
  - Content: Ordered list with effort estimates
  - Test: Task list created

- [ ] 5.2.3: Identify quick wins (high impact, low effort)
  - Files: Docs/ux-audit-report.md
  - Content: "Quick Wins" section with top 5-10 items
  - Test: Quick wins identified

### 5.3 Recommendations

- [ ] 5.3.1: Write accessibility recommendations
  - Content: Fixes for all WCAG violations, ongoing testing strategy
  - Test: Section complete

- [ ] 5.3.2: Write brand alignment recommendations
  - Content: Token updates, component refactors needed
  - Test: Section complete

- [ ] 5.3.3: Write UX improvement recommendations
  - Content: User flow improvements, interaction patterns
  - Test: Section complete

**Phase 5 Checkpoint:**

- [ ] Docs/ux-audit-report.md complete with all sections
- [ ] Docs/ux-remediation-tasks.md created
- [ ] Docs/design-token-diff.md finalized
- [ ] All issues prioritized and actionable
- [ ] Commit: "docs: complete UX audit report and recommendations"

---

## Task Log

| Task  | Completed | Commit | Notes |
|-------|-----------|--------|-------|
| 1.0.1 |           |        |       |
| 1.0.2 |           |        |       |
| 1.1.1 |           |        |       |
| 1.1.2 |           |        |       |
| 1.1.3 |           |        |       |
| 1.1.4 |           |        |       |
| 1.2.1 |           |        |       |
| 1.2.2 |           |        |       |
| 1.2.3 |           |        |       |
| 1.2.4 |           |        |       |
| 1.2.5 |           |        |       |
| 1.2.6 |           |        |       |
| 1.3.1 |           |        |       |
| 1.3.2 |           |        |       |
| 1.3.3 |           |        |       |
| 1.3.4 |           |        |       |
| 1.4.1 |           |        |       |
| 2.1.1 |           |        |       |
| 2.1.2 |           |        |       |
| 2.1.3 |           |        |       |
| 2.2.1 |           |        |       |
| 2.2.2 |           |        |       |
| 2.2.3 |           |        |       |
| 2.3.1 |           |        |       |
| 2.3.2 |           |        |       |
| 2.3.3 |           |        |       |
| 2.4.1 |           |        |       |
| 2.4.2 |           |        |       |
| 2.4.3 |           |        |       |
| 3.1.1 |           |        |       |
| 3.1.2 |           |        |       |
| 3.1.3 |           |        |       |
| 3.1.4 |           |        |       |
| 3.1.5 |           |        |       |
| 3.1.6 |           |        |       |
| 3.1.7 |           |        |       |
| 3.2.1 |           |        |       |
| 3.2.2 |           |        |       |
| 3.2.3 |           |        |       |
| 3.3.1 |           |        |       |
| 3.3.2 |           |        |       |
| 3.3.3 |           |        |       |
| 3.3.4 |           |        |       |
| 3.4.1 |           |        |       |
| 3.5.1 |           |        |       |
| 3.5.2 |           |        |       |
| 4.1.1 |           |        |       |
| 4.1.2 |           |        |       |
| 4.1.3 |           |        |       |
| 4.2.1 |           |        |       |
| 4.2.2 |           |        |       |
| 4.2.3 |           |        |       |
| 4.3.1 |           |        |       |
| 4.3.2 |           |        |       |
| 4.3.3 |           |        |       |
| 4.4.1 |           |        |       |
| 4.4.2 |           |        |       |
| 4.5.1 |           |        |       |
| 4.5.2 |           |        |       |
| 5.1.1 |           |        |       |
| 5.1.2 |           |        |       |
| 5.1.3 |           |        |       |
| 5.2.1 |           |        |       |
| 5.2.2 |           |        |       |
| 5.2.3 |           |        |       |
| 5.3.1 |           |        |       |
| 5.3.2 |           |        |       |
| 5.3.3 |           |        |       |
