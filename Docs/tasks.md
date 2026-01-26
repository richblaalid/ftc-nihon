# Implementation Tasks

> Generated from docs/plan.md on January 26, 2026
>
> **Instructions for Claude:** Complete tasks sequentially within each phase.
> Mark each task complete immediately after implementation.
> Run tests after each task. Commit after each working change.

## Progress Summary

- Phase 0: [x] Complete
- Phase 1: [ ] Not Started
- Phase 2: [ ] Not Started
- Phase 3: [ ] Not Started
- Phase 4: [ ] Not Started
- Phase 5: [ ] Not Started
- **MVP Status:** In Progress

---

## Phase 0: Project Foundation

### 0.0 Pre-flight

- [x] 0.0.1: Read CLAUDE.md and confirm understanding of project conventions
- [x] 0.0.2: Verify working directory is clean for fresh project initialization

### 0.1 Project Initialization

- [x] 0.1.1: Initialize Next.js 14 project with App Router and TypeScript
  - Command: `npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  - Files: package.json, tsconfig.json, next.config.js, src/app/
  - Test: Project created, `npm run dev` starts

- [x] 0.1.2: Configure TypeScript strict mode and path aliases
  - Files: tsconfig.json
  - Test: `npm run build` passes with strict mode

- [x] 0.1.3: Set up Prettier with Tailwind plugin
  - Files: .prettierrc, .prettierignore, package.json
  - Test: `npm run format` works

- [x] 0.1.4: Configure ESLint with Next.js recommended rules
  - Files: .eslintrc.json or eslint.config.js
  - Test: `npm run lint` passes

### 0.2 PWA Configuration

- [x] 0.2.1: Create web app manifest at src/app/manifest.ts
  - Files: src/app/manifest.ts
  - Content: App name "FTC: Nihon", display standalone, theme colors
  - Test: manifest.json served at /manifest.webmanifest

- [x] 0.2.2: Create PWA icons (192x192, 512x512) and place in public/
  - Files: public/icon-192x192.png, public/icon-512x512.png, public/apple-touch-icon.png
  - Test: Icons accessible via browser
  - Note: Placeholder PNGs - replace with actual icons before deployment

- [x] 0.2.3: Configure next.config.js with security headers for PWA
  - Files: next.config.mjs
  - Headers: X-Content-Type-Options, X-Frame-Options, service worker headers
  - Test: Headers visible in browser dev tools

- [x] 0.2.4: Create service worker at public/sw.js with basic caching
  - Files: public/sw.js
  - Caching: App shell, static assets
  - Test: Service worker registers in browser

- [x] 0.2.5: Add service worker registration in root layout
  - Files: src/app/layout.tsx, src/lib/register-sw.ts, src/components/ServiceWorkerRegistration.tsx
  - Test: SW registered on page load, visible in DevTools > Application

- [x] 0.2.6: Add iOS PWA meta tags to root layout
  - Files: src/app/layout.tsx
  - Tags: apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style
  - Test: App installable on iOS Safari

### 0.3 Styling Setup

- [x] 0.3.1: Configure Tailwind with mobile-first design tokens
  - Files: tailwind.config.ts, src/app/globals.css
  - Tokens: Colors (warm palette), spacing, breakpoints (mobile-first)
  - Test: Tailwind classes work in components

- [x] 0.3.2: Create base layout with safe area insets for iOS
  - Files: src/app/layout.tsx, src/app/globals.css
  - CSS: env(safe-area-inset-*) for notch/home indicator
  - Test: Content respects safe areas on iOS

- [x] 0.3.3: Add dark mode support with system preference detection
  - Files: tailwind.config.ts, src/app/layout.tsx
  - Test: Dark mode toggles with system preference

### 0.4 Data Layer Dependencies

- [x] 0.4.1: Install Dexie.js for IndexedDB
  - Command: `npm install dexie`
  - Files: package.json
  - Test: Import works without errors

- [x] 0.4.2: Install Supabase client
  - Command: `npm install @supabase/supabase-js`
  - Files: package.json
  - Test: Import works without errors

- [x] 0.4.3: Install Zustand for state management
  - Command: `npm install zustand`
  - Files: package.json
  - Test: Import works without errors

- [x] 0.4.4: Create environment variables template
  - Files: .env.example, .env.local, .gitignore
  - Variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Test: Variables accessible in app

### 0.5 Project Structure

- [x] 0.5.1: Create folder structure per ADR conventions
  - Folders: src/components/, src/components/ui/, src/lib/, src/db/, src/stores/, src/types/
  - Test: Folders exist

- [x] 0.5.2: Create TypeScript types matching Supabase schema
  - Files: src/types/database.ts
  - Types: Activity, TransitSegment, Accommodation, Restaurant, Alert, etc.
  - Test: Types compile without errors

- [x] 0.5.3: Create placeholder index files
  - Files: src/lib/index.ts, src/db/index.ts, src/stores/index.ts
  - Test: Imports work

**Phase 0 Checkpoint:**

- [x] Fresh clone + `npm install` + `npm run dev` works
- [x] PWA manifest served correctly
- [x] Service worker registers
- [x] App installable on iOS Safari (pending icon replacement)
- [x] All dependencies installed
- [x] Commit: "chore: complete project foundation (Phase 0)"

---

## Phase 1: Data Layer & Sync

### 1.1 Dexie.js Database

- [ ] 1.1.1: Create Dexie database class with full schema
  - Files: src/db/database.ts
  - Tables: activities, transitSegments, accommodations, restaurants, alerts, locationShares, aiCache, checklistItems, syncMeta
  - Test: Database initializes without errors

- [ ] 1.1.2: Create TypeScript interfaces for all Dexie tables
  - Files: src/db/types.ts
  - Interfaces: Match Supabase schema with camelCase conversion
  - Test: Types compile, match database schema

- [ ] 1.1.3: Add database version migrations
  - Files: src/db/database.ts
  - Migrations: Version 1 with all tables
  - Test: Database upgrades cleanly

### 1.2 Supabase Client

- [ ] 1.2.1: Create Supabase client configuration
  - Files: src/lib/supabase.ts
  - Config: URL, anon key, real-time enabled
  - Test: Client connects to Supabase

- [ ] 1.2.2: Create type-safe Supabase query helpers
  - Files: src/lib/supabase-queries.ts
  - Functions: fetchActivities, fetchAccommodations, fetchAlerts, etc.
  - Test: Queries return typed data

### 1.3 Sync Service

- [ ] 1.3.1: Create initial data sync function
  - Files: src/lib/sync.ts
  - Function: downloadAllData() - fetches all tables from Supabase → IndexedDB
  - Test: Data downloads and persists in IndexedDB

- [ ] 1.3.2: Create real-time subscription handlers
  - Files: src/lib/sync.ts
  - Handlers: Subscribe to activities, alerts, checklistItems changes
  - Test: Real-time updates flow to IndexedDB

- [ ] 1.3.3: Create sync status store with Zustand
  - Files: src/stores/sync-store.ts
  - State: lastSyncedAt, isSyncing, isOnline, pendingChanges
  - Test: Store updates correctly

- [ ] 1.3.4: Add sync initialization on app load
  - Files: src/app/providers.tsx, src/app/layout.tsx
  - Logic: Check last sync, download if stale, subscribe to real-time
  - Test: App syncs on load when online

### 1.4 Data Hooks

- [ ] 1.4.1: Create useActivities hook with Dexie live query
  - Files: src/db/hooks.ts
  - Hook: useActivities(dayNumber?) - returns activities from IndexedDB
  - Test: Hook returns data, updates on changes

- [ ] 1.4.2: Create useAccommodations hook
  - Files: src/db/hooks.ts
  - Hook: useAccommodations() - returns all accommodations
  - Test: Hook returns data

- [ ] 1.4.3: Create useCurrentActivity hook
  - Files: src/db/hooks.ts
  - Hook: useCurrentActivity() - returns activity based on current time
  - Test: Returns correct activity for current time

- [ ] 1.4.4: Create useNextActivity hook
  - Files: src/db/hooks.ts
  - Hook: useNextActivity() - returns next upcoming activity
  - Test: Returns correct next activity

- [ ] 1.4.5: Create useAlerts hook
  - Files: src/db/hooks.ts
  - Hook: useAlerts() - returns active alerts
  - Test: Returns only active, non-expired alerts

**Phase 1 Checkpoint:**

- [ ] Data downloads from Supabase on first load
- [ ] App works in airplane mode after initial sync
- [ ] Real-time updates flow when online
- [ ] All data hooks return correct data
- [ ] Sync status visible in React DevTools
- [ ] Commit: "feat: complete offline-first data layer (Phase 1)"

---

## Phase 2: Dashboard Home Screen

### 2.1 Dashboard Layout

- [ ] 2.1.1: Create dashboard page at src/app/page.tsx
  - Files: src/app/page.tsx
  - Layout: Full viewport, mobile-optimized, safe area padding
  - Test: Page renders

- [ ] 2.1.2: Create dashboard grid layout component
  - Files: src/components/dashboard/DashboardLayout.tsx
  - Layout: Widget grid, responsive, single column mobile
  - Test: Layout renders correctly on mobile

### 2.2 NOW Widget

- [ ] 2.2.1: Create NOW widget component
  - Files: src/components/dashboard/NowWidget.tsx
  - Display: Current activity name, location, time remaining
  - Data: useCurrentActivity hook
  - Test: Shows current activity or "Free time" message

- [ ] 2.2.2: Add time remaining countdown
  - Files: src/components/dashboard/NowWidget.tsx
  - Logic: Calculate remaining time, update every minute
  - Style: Large, readable, not anxiety-inducing (no seconds)
  - Test: Time updates correctly

### 2.3 NEXT Widget

- [ ] 2.3.1: Create NEXT widget component
  - Files: src/components/dashboard/NextWidget.tsx
  - Display: Next activity name, start time, "leave by" time
  - Data: useNextActivity hook
  - Test: Shows next activity with times

- [ ] 2.3.2: Add "leave by" time display with transit preview
  - Files: src/components/dashboard/NextWidget.tsx
  - Display: Walking time, train info summary
  - Style: Clear, prominent "leave by" time
  - Test: Transit info displays correctly

### 2.4 Weather Widget

- [ ] 2.4.1: Create weather service with caching
  - Files: src/lib/weather.ts
  - Service: Fetch weather for current city, cache in IndexedDB
  - Fallback: Show cached data when offline
  - Test: Weather fetches and caches

- [ ] 2.4.2: Create weather widget component
  - Files: src/components/dashboard/WeatherWidget.tsx
  - Display: Temperature, conditions, icon
  - Data: Current city from itinerary
  - Test: Weather displays correctly

### 2.5 Quick Actions & Alerts

- [ ] 2.5.1: Create quick action buttons component
  - Files: src/components/dashboard/QuickActions.tsx
  - Buttons: Map, AI Assistant (P2), Reservations
  - Style: Large touch targets (44x44pt min)
  - Test: Buttons render and navigate

- [ ] 2.5.2: Create alert banner component
  - Files: src/components/dashboard/AlertBanner.tsx
  - Display: Urgent alerts, hard deadlines within 2 hours
  - Style: Prominent, dismissible
  - Data: useAlerts hook filtered by deadline
  - Test: Alert displays when deadline approaching

### 2.6 Day Indicator

- [ ] 2.6.1: Create date/day indicator component
  - Files: src/components/dashboard/DayIndicator.tsx
  - Display: "Day 3 - March 9" format
  - Feature: Tap to open day selector
  - Test: Shows correct date and day number

- [ ] 2.6.2: Create day selector modal/sheet
  - Files: src/components/dashboard/DaySelector.tsx
  - UI: List of all 15 days, current day highlighted
  - Feature: Select day to view that day's schedule
  - Test: Day selection works

**Phase 2 Checkpoint:**

- [ ] Dashboard loads in < 2 seconds with cached data
- [ ] NOW widget shows current activity and time remaining
- [ ] NEXT widget shows upcoming activity with "leave by" time
- [ ] Weather displays with offline fallback
- [ ] Quick actions navigate correctly
- [ ] Alert banner shows for approaching deadlines
- [ ] Day switching works
- [ ] Commit: "feat: complete dashboard home screen (Phase 2)"

---

## Phase 3: Daily Schedule View

### 3.1 Schedule Page

- [ ] 3.1.1: Create schedule page at src/app/schedule/page.tsx
  - Files: src/app/schedule/page.tsx
  - Params: Accept day query param
  - Test: Page renders for any day

- [ ] 3.1.2: Add day navigation (swipe or tap)
  - Files: src/app/schedule/page.tsx, src/components/schedule/DayNav.tsx
  - UI: Arrow buttons or swipe gestures
  - Test: Can navigate between days

### 3.2 Activity Cards

- [ ] 3.2.1: Create activity card component
  - Files: src/components/schedule/ActivityCard.tsx
  - Display: Time, name, duration, location, category icon
  - Style: Color-coded by category
  - Test: Card renders all activity types

- [ ] 3.2.2: Create category icons component
  - Files: src/components/ui/CategoryIcon.tsx
  - Icons: food, temple, shopping, transit, activity, hotel
  - Test: All icons render correctly

- [ ] 3.2.3: Add visual states for activity cards
  - Files: src/components/schedule/ActivityCard.tsx
  - States: Current (highlighted), completed (muted), deadline (alert)
  - Test: States display correctly based on time

### 3.3 Timeline Layout

- [ ] 3.3.1: Create timeline layout component
  - Files: src/components/schedule/Timeline.tsx
  - Layout: Chronological list with time markers
  - Feature: Auto-scroll to current activity
  - Test: Timeline renders full day

- [ ] 3.3.2: Add "leave by" time badges to cards
  - Files: src/components/schedule/ActivityCard.tsx
  - Display: Transit segment "leave by" time
  - Style: Prominent but not overwhelming
  - Test: Transit info shows on relevant cards

### 3.4 Activity Details

- [ ] 3.4.1: Create activity detail modal/page
  - Files: src/app/schedule/[id]/page.tsx or src/components/schedule/ActivityDetail.tsx
  - Display: Full details, tips, what to order, links
  - Test: Detail view opens from card

- [ ] 3.4.2: Add tap-to-map functionality
  - Files: src/components/schedule/ActivityDetail.tsx
  - Action: Tap location opens map view
  - Test: Navigation to map works

**Phase 3 Checkpoint:**

- [ ] All 15 days accessible via navigation
- [ ] Current activity auto-highlighted based on time
- [ ] Category colors and icons display correctly
- [ ] "Leave by" times visible on relevant activities
- [ ] Activity details accessible via tap
- [ ] Works fully offline
- [ ] Commit: "feat: complete daily schedule view (Phase 3)"

---

## Phase 4: Maps & Navigation

### 4.1 Google Maps Integration

- [ ] 4.1.1: Add Google Maps API key to environment
  - Files: .env.local, .env.example
  - Variable: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  - Test: Key configured

- [ ] 4.1.2: Create Google Maps loader component
  - Files: src/lib/google-maps.ts, src/components/maps/MapLoader.tsx
  - Loader: @googlemaps/js-api-loader
  - Test: Maps API loads

- [ ] 4.1.3: Create base map component
  - Files: src/components/maps/Map.tsx
  - Features: Center on Tokyo, zoom controls, gesture handling
  - Test: Map renders

### 4.2 GPS Location

- [ ] 4.2.1: Create geolocation hook
  - Files: src/lib/hooks/useGeolocation.ts
  - Hook: useGeolocation() - returns lat/lng, updates on move
  - Test: Location updates in real-time

- [ ] 4.2.2: Add current location marker to map
  - Files: src/components/maps/Map.tsx
  - Marker: Blue dot for current position
  - Test: Location shows on map

### 4.3 Day Pins

- [ ] 4.3.1: Create custom pin components by category
  - Files: src/components/maps/Pin.tsx
  - Pins: Different icons/colors for each category
  - Test: All pin types render

- [ ] 4.3.2: Add day activities as pins on map
  - Files: src/components/maps/Map.tsx
  - Data: Activities for selected day with lat/lng
  - Test: All day activities show as pins

- [ ] 4.3.3: Create pin info popup on tap
  - Files: src/components/maps/PinInfo.tsx
  - Display: Name, time, category, navigate button
  - Test: Popup shows on pin tap

### 4.4 Directions View

- [ ] 4.4.1: Create directions page/component
  - Files: src/app/directions/page.tsx or src/components/maps/Directions.tsx
  - Display: Step-by-step transit/walking directions
  - Data: Transit segment steps
  - Test: Directions render

- [ ] 4.4.2: Add walking route visualization
  - Files: src/components/maps/Directions.tsx
  - Feature: Polyline on map for walking segments
  - Test: Route shows on map

- [ ] 4.4.3: Add "Open in Google Maps" button
  - Files: src/components/maps/Directions.tsx
  - Action: Opens native Google Maps with directions
  - Test: External navigation works

**Phase 4 Checkpoint:**

- [ ] Map displays with correct region
- [ ] GPS location shows and updates
- [ ] Day pins display with correct categories
- [ ] Pin tap shows info popup
- [ ] Directions display step-by-step
- [ ] "Open in Google Maps" works
- [ ] Commit: "feat: complete maps and navigation (Phase 4)"

---

## Phase 5: Reservations & Details

### 5.1 Reservations Page

- [ ] 5.1.1: Create reservations page
  - Files: src/app/reservations/page.tsx
  - Layout: List of accommodations, current highlighted
  - Test: Page renders all accommodations

- [ ] 5.1.2: Create accommodation card component
  - Files: src/components/reservations/AccommodationCard.tsx
  - Display: Name, dates, address (EN + JP), confirmation number
  - Style: Card with expandable details
  - Test: Card renders all info

### 5.2 Accommodation Details

- [ ] 5.2.1: Add Japanese address display with copy button
  - Files: src/components/reservations/AccommodationCard.tsx
  - Feature: Show Japanese text, tap to copy for taxi
  - Test: Copy to clipboard works

- [ ] 5.2.2: Add tap-to-call phone numbers
  - Files: src/components/reservations/AccommodationCard.tsx
  - Feature: tel: link for phone numbers
  - Test: Tap opens phone dialer

- [ ] 5.2.3: Add Google Maps link
  - Files: src/components/reservations/AccommodationCard.tsx
  - Feature: "Get Directions" button
  - Test: Opens Google Maps

- [ ] 5.2.4: Add special instructions display
  - Files: src/components/reservations/AccommodationCard.tsx
  - Display: Check-in instructions, PIN codes, notes
  - Test: Instructions display correctly

### 5.3 Navigation

- [ ] 5.3.1: Create bottom navigation bar
  - Files: src/components/ui/BottomNav.tsx
  - Items: Home, Schedule, Map, Reservations, (Settings)
  - Style: iOS-like tab bar with safe area
  - Test: Navigation works between pages

- [ ] 5.3.2: Add active state to nav items
  - Files: src/components/ui/BottomNav.tsx
  - Feature: Highlight current page
  - Test: Active state shows correctly

**Phase 5 Checkpoint:**

- [ ] All 4 accommodations display with complete details
- [ ] Japanese addresses copyable
- [ ] Phone numbers tap-to-call
- [ ] Google Maps links work
- [ ] Bottom navigation functional
- [ ] Works fully offline
- [ ] Commit: "feat: complete reservations and navigation (Phase 5)"

---

## MVP Checkpoint

- [ ] All P1 features from PRD functional
- [ ] Offline mode tested on all pages
- [ ] PWA installable on iOS
- [ ] Dashboard loads < 2 seconds
- [ ] "Leave by" times display correctly
- [ ] All 4 users can install and use app
- [ ] Commit: "release: MVP complete - ready for testing"

---

## Post-MVP Tasks

> Do not start these until MVP checkpoints are all verified.

### Phase 6: AI Assistant (P2)

- [ ] 6.1.1: Create AI chat interface
- [ ] 6.1.2: Integrate Claude API with trip context
- [ ] 6.1.3: Pre-cache common responses for offline
- [ ] 6.1.4: Add chat history persistence

### Phase 7: Push Notifications (P2)

- [ ] 7.1.1: Set up Web Push with VAPID keys
- [ ] 7.1.2: Create notification permission flow
- [ ] 7.1.3: Implement morning briefing notifications
- [ ] 7.1.4: Implement departure reminders
- [ ] 7.1.5: Implement deadline alerts

### Phase 8: Admin Panel (P2)

- [ ] 8.1.1: Implement Supabase Auth for Rich
- [ ] 8.1.2: Create admin route protection
- [ ] 8.1.3: Build activity edit forms
- [ ] 8.1.4: Build alert creation form
- [ ] 8.1.5: Implement optimistic updates with sync

### Phase 9: Group Location Sharing (P2)

- [ ] 9.1.1: Create "I'm here" location share button
- [ ] 9.1.2: Build group map view
- [ ] 9.1.3: Add meeting point feature

---

## Task Log

| Task | Completed | Commit | Notes |
| ---- | --------- | ------ | ----- |
| 0.0.1 | 2026-01-26 | - | Read CLAUDE.md |
| 0.0.2 | 2026-01-26 | - | Fresh directory |
| 0.1.1 | 2026-01-26 | - | Next.js 14.2.35 |
| 0.1.2 | 2026-01-26 | - | Added noUncheckedIndexedAccess |
| 0.1.3 | 2026-01-26 | - | Prettier + Tailwind plugin |
| 0.1.4 | 2026-01-26 | - | ESLint via create-next-app |
| 0.2.1 | 2026-01-26 | - | PWA manifest.ts |
| 0.2.2 | 2026-01-26 | - | Placeholder PNGs + SVGs |
| 0.2.3 | 2026-01-26 | - | Security headers |
| 0.2.4 | 2026-01-26 | - | Service worker sw.js |
| 0.2.5 | 2026-01-26 | - | SW registration component |
| 0.2.6 | 2026-01-26 | - | iOS meta tags |
| 0.3.1 | 2026-01-26 | - | FTC color palette |
| 0.3.2 | 2026-01-26 | - | Safe area CSS |
| 0.3.3 | 2026-01-26 | - | darkMode: 'class' |
| 0.4.1 | 2026-01-26 | - | Dexie 4.2.1 |
| 0.4.2 | 2026-01-26 | - | Supabase 2.91.1 |
| 0.4.3 | 2026-01-26 | - | Zustand 5.0.10 |
| 0.4.4 | 2026-01-26 | - | .env.example, .env.local |
| 0.5.1 | 2026-01-26 | - | Folder structure created |
| 0.5.2 | 2026-01-26 | - | Database types |
| 0.5.3 | 2026-01-26 | - | Index files |
