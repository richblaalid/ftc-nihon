# Implementation Tasks

> Generated from docs/plan.md on January 26, 2026
>
> **Instructions for Claude:** Complete tasks sequentially within each phase.
> Mark each task complete immediately after implementation.
> Run tests after each task. Commit after each working change.

## Progress Summary

- Phase 0: [x] Complete
- Phase 1: [x] Complete
- Phase 2: [x] Complete
- Phase 3: [x] Complete
- Phase 4: [x] Complete
- Phase 5: [x] Complete
- **MVP Status:** Complete
- Phase 5.5: [x] Complete - Quick Utility Features
- Phase 6: [ ] In Progress - AI Assistant + Tour Guide
- Phase 7: [ ] Not Started - Push Notifications
- Phase 8: [ ] Not Started - Admin Panel
- Phase 9: [ ] Not Started - Group Location Sharing

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

- [x] 1.1.1: Create Dexie database class with full schema
  - Files: src/db/database.ts
  - Tables: activities, transitSegments, accommodations, restaurants, alerts, locationShares, aiCache, checklistItems, syncMeta
  - Test: Database initializes without errors

- [x] 1.1.2: Create TypeScript interfaces for all Dexie tables
  - Files: src/db/types.ts
  - Interfaces: Match Supabase schema with camelCase conversion
  - Test: Types compile, match database schema

- [x] 1.1.3: Add database version migrations
  - Files: src/db/database.ts
  - Migrations: Version 1 with all tables
  - Test: Database upgrades cleanly

### 1.2 Supabase Client

- [x] 1.2.1: Create Supabase client configuration
  - Files: src/lib/supabase.ts
  - Config: URL, anon key, real-time enabled
  - Test: Client connects to Supabase

- [x] 1.2.2: Create type-safe Supabase query helpers
  - Files: src/lib/supabase-queries.ts
  - Functions: fetchActivities, fetchAccommodations, fetchAlerts, etc.
  - Test: Queries return typed data

### 1.3 Sync Service

- [x] 1.3.1: Create initial data sync function
  - Files: src/lib/sync.ts
  - Function: downloadAllData() - fetches all tables from Supabase → IndexedDB
  - Test: Data downloads and persists in IndexedDB

- [x] 1.3.2: Create real-time subscription handlers
  - Files: src/lib/sync.ts
  - Handlers: Subscribe to activities, alerts, checklistItems changes
  - Test: Real-time updates flow to IndexedDB

- [x] 1.3.3: Create sync status store with Zustand
  - Files: src/stores/sync-store.ts
  - State: lastSyncedAt, isSyncing, isOnline, pendingChanges
  - Test: Store updates correctly

- [x] 1.3.4: Add sync initialization on app load
  - Files: src/app/providers.tsx, src/app/layout.tsx
  - Logic: Check last sync, download if stale, subscribe to real-time
  - Test: App syncs on load when online

### 1.4 Data Hooks

- [x] 1.4.1: Create useActivities hook with Dexie live query
  - Files: src/db/hooks.ts
  - Hook: useActivities(dayNumber?) - returns activities from IndexedDB
  - Test: Hook returns data, updates on changes

- [x] 1.4.2: Create useAccommodations hook
  - Files: src/db/hooks.ts
  - Hook: useAccommodations() - returns all accommodations
  - Test: Hook returns data

- [x] 1.4.3: Create useCurrentActivity hook
  - Files: src/db/hooks.ts
  - Hook: useCurrentActivity() - returns activity based on current time
  - Test: Returns correct activity for current time

- [x] 1.4.4: Create useNextActivity hook
  - Files: src/db/hooks.ts
  - Hook: useNextActivity() - returns next upcoming activity
  - Test: Returns correct next activity

- [x] 1.4.5: Create useAlerts hook
  - Files: src/db/hooks.ts
  - Hook: useAlerts() - returns active alerts
  - Test: Returns only active, non-expired alerts

**Phase 1 Checkpoint:**

- [x] Data downloads from Supabase on first load
- [x] App works in airplane mode after initial sync
- [x] Real-time updates flow when online
- [x] All data hooks return correct data
- [x] Sync status visible in React DevTools
- [x] Commit: "feat: complete offline-first data layer (Phase 1)"

---

## Phase 2: Dashboard Home Screen

### 2.1 Dashboard Layout

- [x] 2.1.1: Create dashboard page at src/app/page.tsx
  - Files: src/app/page.tsx
  - Layout: Full viewport, mobile-optimized, safe area padding
  - Test: Page renders

- [x] 2.1.2: Create dashboard grid layout component
  - Files: src/components/dashboard/DashboardLayout.tsx
  - Layout: Widget grid, responsive, single column mobile
  - Test: Layout renders correctly on mobile

### 2.2 NOW Widget

- [x] 2.2.1: Create NOW widget component
  - Files: src/components/dashboard/NowWidget.tsx
  - Display: Current activity name, location, time remaining
  - Data: useCurrentActivity hook
  - Test: Shows current activity or "Free time" message

- [x] 2.2.2: Add time remaining countdown
  - Files: src/components/dashboard/NowWidget.tsx
  - Logic: Calculate remaining time, update every minute
  - Style: Large, readable, not anxiety-inducing (no seconds)
  - Test: Time updates correctly

### 2.3 NEXT Widget

- [x] 2.3.1: Create NEXT widget component
  - Files: src/components/dashboard/NextWidget.tsx
  - Display: Next activity name, start time, "leave by" time
  - Data: useNextActivity hook
  - Test: Shows next activity with times

- [x] 2.3.2: Add "leave by" time display with transit preview
  - Files: src/components/dashboard/NextWidget.tsx
  - Display: Walking time, train info summary
  - Style: Clear, prominent "leave by" time
  - Test: Transit info displays correctly

### 2.4 Weather Widget

- [x] 2.4.1: Create weather service with caching
  - Files: src/lib/weather.ts
  - Service: Fetch weather for current city, cache in IndexedDB
  - Fallback: Show cached data when offline
  - Test: Weather fetches and caches

- [x] 2.4.2: Create weather widget component
  - Files: src/components/dashboard/WeatherWidget.tsx
  - Display: Temperature, conditions, icon
  - Data: Current city from itinerary
  - Test: Weather displays correctly

### 2.5 Quick Actions & Alerts

- [x] 2.5.1: Create quick action buttons component
  - Files: src/components/dashboard/QuickActions.tsx
  - Buttons: Map, AI Assistant (P2), Reservations
  - Style: Large touch targets (44x44pt min)
  - Test: Buttons render and navigate

- [x] 2.5.2: Create alert banner component
  - Files: src/components/dashboard/AlertBanner.tsx
  - Display: Urgent alerts, hard deadlines within 2 hours
  - Style: Prominent, dismissible
  - Data: useAlerts hook filtered by deadline
  - Test: Alert displays when deadline approaching

### 2.6 Day Indicator

- [x] 2.6.1: Create date/day indicator component
  - Files: src/components/dashboard/DayIndicator.tsx
  - Display: "Day 3 - March 9" format
  - Feature: Tap to open day selector
  - Test: Shows correct date and day number

- [x] 2.6.2: Create day selector modal/sheet
  - Files: src/components/dashboard/DaySelector.tsx
  - UI: List of all 15 days, current day highlighted
  - Feature: Select day to view that day's schedule
  - Test: Day selection works

**Phase 2 Checkpoint:**

- [x] Dashboard loads in < 2 seconds with cached data
- [x] NOW widget shows current activity and time remaining
- [x] NEXT widget shows upcoming activity with "leave by" time
- [x] Weather displays with offline fallback
- [x] Quick actions navigate correctly
- [x] Alert banner shows for approaching deadlines
- [x] Day switching works
- [x] Commit: "feat: complete dashboard home screen (Phase 2)"

---

## Phase 3: Daily Schedule View

### 3.1 Schedule Page

- [x] 3.1.1: Create schedule page at src/app/schedule/page.tsx
  - Files: src/app/schedule/page.tsx
  - Params: Accept day query param
  - Test: Page renders for any day

- [x] 3.1.2: Add day navigation (swipe or tap)
  - Files: src/app/schedule/page.tsx, src/components/schedule/DayNav.tsx
  - UI: Arrow buttons or swipe gestures
  - Test: Can navigate between days

### 3.2 Activity Cards

- [x] 3.2.1: Create activity card component
  - Files: src/components/schedule/ActivityCard.tsx
  - Display: Time, name, duration, location, category icon
  - Style: Color-coded by category
  - Test: Card renders all activity types

- [x] 3.2.2: Create category icons component
  - Files: src/components/ui/CategoryIcon.tsx
  - Icons: food, temple, shopping, transit, activity, hotel
  - Test: All icons render correctly

- [x] 3.2.3: Add visual states for activity cards
  - Files: src/components/schedule/ActivityCard.tsx
  - States: Current (highlighted), completed (muted), deadline (alert)
  - Test: States display correctly based on time

### 3.3 Timeline Layout

- [x] 3.3.1: Create timeline layout component
  - Files: src/components/schedule/Timeline.tsx
  - Layout: Chronological list with time markers
  - Feature: Auto-scroll to current activity
  - Test: Timeline renders full day

- [x] 3.3.2: Add "leave by" time badges to cards
  - Files: src/components/schedule/ActivityCard.tsx
  - Display: Transit segment "leave by" time
  - Style: Prominent but not overwhelming
  - Test: Transit info shows on relevant cards

### 3.4 Activity Details

- [x] 3.4.1: Create activity detail modal/page
  - Files: src/app/schedule/[id]/page.tsx or src/components/schedule/ActivityDetail.tsx
  - Display: Full details, tips, what to order, links
  - Test: Detail view opens from card

- [x] 3.4.2: Add tap-to-map functionality
  - Files: src/components/schedule/ActivityDetail.tsx
  - Action: Tap location opens map view
  - Test: Navigation to map works

**Phase 3 Checkpoint:**

- [x] All 15 days accessible via navigation
- [x] Current activity auto-highlighted based on time
- [x] Category colors and icons display correctly
- [x] "Leave by" times visible on relevant activities
- [x] Activity details accessible via tap
- [x] Works fully offline
- [x] Commit: "feat: complete daily schedule view (Phase 3)"

---

## Phase 4: Maps & Navigation

### 4.1 Google Maps Integration

- [x] 4.1.1: Add Google Maps API key to environment
  - Files: .env.local, .env.example
  - Variable: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  - Test: Key configured

- [x] 4.1.2: Create Google Maps loader component
  - Files: src/lib/google-maps.ts, src/components/maps/MapLoader.tsx
  - Loader: @googlemaps/js-api-loader
  - Test: Maps API loads

- [x] 4.1.3: Create base map component
  - Files: src/components/maps/Map.tsx
  - Features: Center on Tokyo, zoom controls, gesture handling
  - Test: Map renders

### 4.2 GPS Location

- [x] 4.2.1: Create geolocation hook
  - Files: src/lib/hooks/useGeolocation.ts
  - Hook: useGeolocation() - returns lat/lng, updates on move
  - Test: Location updates in real-time

- [x] 4.2.2: Add current location marker to map
  - Files: src/components/maps/Map.tsx
  - Marker: Blue dot for current position
  - Test: Location shows on map

### 4.3 Day Pins

- [x] 4.3.1: Create custom pin components by category
  - Files: src/components/maps/Pin.tsx
  - Pins: Different icons/colors for each category
  - Test: All pin types render

- [x] 4.3.2: Add day activities as pins on map
  - Files: src/components/maps/Map.tsx
  - Data: Activities for selected day with lat/lng
  - Test: All day activities show as pins

- [x] 4.3.3: Create pin info popup on tap
  - Files: src/components/maps/PinInfo.tsx
  - Display: Name, time, category, navigate button
  - Test: Popup shows on pin tap

### 4.4 Directions View

- [x] 4.4.1: Create directions page/component
  - Files: src/app/directions/page.tsx or src/components/maps/Directions.tsx
  - Display: Step-by-step transit/walking directions
  - Data: Transit segment steps
  - Test: Directions render

- [x] 4.4.2: Add walking route visualization
  - Files: src/components/maps/Directions.tsx
  - Feature: Polyline on map for walking segments
  - Test: Route shows on map

- [x] 4.4.3: Add "Open in Google Maps" button
  - Files: src/components/maps/Directions.tsx
  - Action: Opens native Google Maps with directions
  - Test: External navigation works

**Phase 4 Checkpoint:**

- [x] Map displays with correct region
- [x] GPS location shows and updates
- [x] Day pins display with correct categories
- [x] Pin tap shows info popup
- [x] Directions display step-by-step
- [x] "Open in Google Maps" works
- [x] Commit: "feat: complete maps and navigation (Phase 4)"

---

## Phase 5: Reservations & Details

### 5.1 Reservations Page

- [x] 5.1.1: Create reservations page
  - Files: src/app/reservations/page.tsx
  - Layout: List of accommodations, current highlighted
  - Test: Page renders all accommodations

- [x] 5.1.2: Create accommodation card component
  - Files: src/components/reservations/AccommodationCard.tsx
  - Display: Name, dates, address (EN + JP), confirmation number
  - Style: Card with expandable details
  - Test: Card renders all info

### 5.2 Accommodation Details

- [x] 5.2.1: Add Japanese address display with copy button
  - Files: src/components/reservations/AccommodationCard.tsx
  - Feature: Show Japanese text, tap to copy for taxi
  - Test: Copy to clipboard works

- [x] 5.2.2: Add tap-to-call phone numbers
  - Files: src/components/reservations/AccommodationCard.tsx
  - Feature: tel: link for phone numbers
  - Test: Tap opens phone dialer

- [x] 5.2.3: Add Google Maps link
  - Files: src/components/reservations/AccommodationCard.tsx
  - Feature: "Get Directions" button
  - Test: Opens Google Maps

- [x] 5.2.4: Add special instructions display
  - Files: src/components/reservations/AccommodationCard.tsx
  - Display: Check-in instructions, PIN codes, notes
  - Test: Instructions display correctly

### 5.3 Navigation

- [x] 5.3.1: Create bottom navigation bar
  - Files: src/components/ui/BottomNav.tsx
  - Items: Home, Schedule, Map, Reservations, (Settings)
  - Style: iOS-like tab bar with safe area
  - Test: Navigation works between pages

- [x] 5.3.2: Add active state to nav items
  - Files: src/components/ui/BottomNav.tsx
  - Feature: Highlight current page
  - Test: Active state shows correctly

**Phase 5 Checkpoint:**

- [x] All 4 accommodations display with complete details
- [x] Japanese addresses copyable
- [x] Phone numbers tap-to-call
- [x] Google Maps links work
- [x] Bottom navigation functional
- [x] Works fully offline
- [x] Commit: "feat: complete reservations and navigation (Phase 5)"

---

## MVP Checkpoint

- [x] All P1 features from PRD functional
- [x] Offline mode tested on all pages
- [x] PWA installable on iOS
- [x] Dashboard loads < 2 seconds
- [x] "Leave by" times display correctly
- [ ] All 4 users can install and use app
- [ ] Commit: "release: MVP complete - ready for testing"

---

## Phase 5.5: Quick Utility Features

> High-value utility features that enhance daily usability. All work offline.

### 5.5.1 Google Translate Link

- [x] 5.5.1.1: Add Google Translate to Quick Actions
  - Files: src/components/dashboard/QuickActions.tsx
  - Action: Opens Google Translate app (if installed) or website
  - URL: `https://translate.google.com/?sl=auto&tl=en&op=translate` (or deep link to app)
  - Test: Button visible, opens Google Translate correctly on iOS

### 5.5.2 Currency Converter

- [x] 5.5.2.1: Create exchange rate service with daily caching
  - Files: src/lib/currency.ts
  - API: Free exchange rate API (e.g., exchangerate-api.com or similar)
  - Cache: Store rate in IndexedDB with timestamp, refresh if > 24 hours old
  - Fallback: Use last cached rate when offline
  - Test: Rate fetches and caches correctly

- [x] 5.5.2.2: Create currency converter modal component
  - Files: src/components/ui/CurrencyConverter.tsx
  - UI: Input field, swap button for direction, converted amount display
  - Features: Two-way conversion (JPY ↔ USD), numeric keypad friendly
  - Style: Modal triggered from Quick Actions, large touch targets
  - Test: Conversion calculates correctly both directions

- [x] 5.5.2.3: Add currency converter to Quick Actions
  - Files: src/components/dashboard/QuickActions.tsx
  - Action: Opens CurrencyConverter modal
  - Icon: Currency/yen symbol
  - Test: Button opens modal, conversion works

- [x] 5.5.2.4: Add exchange rate display to converter
  - Files: src/components/ui/CurrencyConverter.tsx
  - Display: Current rate and "Last updated" timestamp
  - Indicator: Show when using cached/offline rate
  - Test: Rate and timestamp display correctly

### 5.5.3 Context-Aware Japanese Phrases

- [x] 5.5.3.1: Create phrases database schema and types
  - Files: src/db/database.ts, src/db/types.ts, src/types/database.ts
  - Schema: phrases table with id, category, context, english, romaji, japanese, sortOrder
  - Categories: restaurant, transit, shopping, temple, hotel, emergency
  - Test: Schema compiles, migrations work

- [x] 5.5.3.2: Populate phrases database with initial content
  - Files: src/db/seed-phrases.ts (or Supabase seed)
  - Content: 8-12 phrases per category (~60 total)
  - Categories:
    - Restaurant: ordering, allergies, party size, payment, compliments
    - Transit: directions, platforms, confirmation
    - Shopping: price, sizes, payment
    - Temple/Shrine: etiquette, photos, greetings
    - Hotel: reservations, breakfast, checkout
    - Emergency: help, medical, lost items
  - Test: Phrases load from database

- [x] 5.5.3.3: Create usePhrases hook
  - Files: src/db/hooks.ts
  - Hook: usePhrases(category?) - returns phrases filtered by category
  - Hook: usePhrasesByContext(activityCategory) - maps activity category to phrase categories
  - Test: Hooks return correct phrases

- [x] 5.5.3.4: Create PhraseCard component
  - Files: src/components/ui/PhraseCard.tsx
  - Display: English phrase, Romaji (pronunciation), Japanese characters
  - Features: Tap to expand/copy, "Show to staff" large text mode
  - Style: Clean card with clear typography hierarchy
  - Test: Card displays all three text formats correctly

- [x] 5.5.3.5: Create PhraseList component with category tabs
  - Files: src/components/phrases/PhraseList.tsx
  - UI: Horizontal scrolling category tabs, list of PhraseCards
  - Features: Filter by category, expand all option
  - Test: Category filtering works

- [x] 5.5.3.6: Create contextual phrases preview component
  - Files: src/components/phrases/ContextualPhrases.tsx
  - Display: 2-3 most relevant phrases for current activity type
  - Features: "See all phrases" button to expand full list
  - Logic: Map activity category to phrase categories (food→restaurant, temple→temple, etc.)
  - Test: Preview shows relevant phrases based on activity

- [x] 5.5.3.7: Add phrases preview to activity detail page
  - Files: src/app/schedule/[id]/page.tsx or src/components/schedule/ActivityDetail.tsx
  - Integration: Show ContextualPhrases component below activity details
  - Condition: Only show for relevant categories (food, temple, shopping, hotel)
  - Test: Phrases appear contextually on activity details

- [x] 5.5.3.8: Create dedicated phrases page
  - Files: src/app/phrases/page.tsx
  - UI: Full PhraseList with all categories
  - Access: From "See all phrases" button or navigation
  - Test: All phrases accessible and browsable

**Phase 5.5 Checkpoint:**

- [x] Google Translate link works from dashboard
- [x] Currency converter fetches rate daily, works offline with cached rate
- [x] Two-way JPY ↔ USD conversion works
- [x] Phrases appear contextually on activity details
- [x] All 6 phrase categories populated and accessible
- [x] "Show to staff" large text mode works
- [x] All features work offline
- [x] Commit: "feat: complete quick utility features (Phase 5.5)"

---

## Post-MVP Tasks

> Do not start these until Phase 5.5 is complete.

### Phase 6: AI Assistant + Tour Guide

> Context-aware AI chat and location-based tour guide with audio playback.

#### 6.1 AI Chat Interface

- [x] 6.1.1: Create AI chat page and layout
  - Files: src/app/ai/page.tsx, src/components/ai/ChatLayout.tsx
  - UI: Chat message list, input field, send button
  - Style: iOS Messages-like interface, large touch targets
  - Test: Page renders, can type messages

- [x] 6.1.2: Create chat message components
  - Files: src/components/ai/ChatMessage.tsx, src/components/ai/ChatInput.tsx
  - Display: User messages (right), AI messages (left), timestamps
  - Features: Loading indicator while AI responds
  - Test: Messages display correctly

- [x] 6.1.3: Integrate Claude API with trip context
  - Files: src/lib/ai.ts, src/app/api/chat/route.ts
  - System prompt: Current location, time, activity, group composition, today's itinerary
  - Context injection: Dynamically build prompt based on current state
  - Model: Claude 3.5 Sonnet
  - Test: AI responds with context-aware answers

- [ ] 6.1.4: Add chat history persistence
  - Files: src/db/database.ts, src/db/types.ts, src/db/hooks.ts
  - Schema: chatHistory table with id, role, content, timestamp
  - Hook: useChatHistory() - returns chat messages
  - Retention: Keep last 50 messages, clear on request
  - Test: Chat history persists across sessions

- [ ] 6.1.5: Pre-cache common Q&A responses for offline
  - Files: src/db/seed-ai-cache.ts
  - Content: Top 20-30 anticipated questions with pre-generated responses
  - Categories: Etiquette, location history, practical tips, schedule questions
  - Matching: Fuzzy match user question to cached patterns
  - Test: Offline questions return cached responses

- [ ] 6.1.6: Add offline detection and graceful fallback
  - Files: src/lib/ai.ts, src/components/ai/ChatLayout.tsx
  - Logic: Check online status, try cache first, then API
  - UI: Show "offline mode" indicator, explain limitations
  - Test: Graceful degradation when offline

#### 6.2 AI Tour Guide

- [ ] 6.2.1: Pre-generate tour content for cultural sites
  - Files: src/db/seed-tour-content.ts, Supabase seed
  - Content: ~20 locations (temples, shrines, landmarks on itinerary)
  - Format: 2-3 paragraphs of history, significance, interesting facts
  - Storage: tourContent table in IndexedDB with locationId, title, content
  - Test: Tour content loads for cultural sites

- [ ] 6.2.2: Create city overview content
  - Files: src/db/seed-tour-content.ts
  - Cities: Tokyo, Hakone, Kyoto, Osaka
  - Content: Brief description, cultural facts, main attractions, local food specialties
  - Test: City overviews accessible

- [ ] 6.2.3: Create TourGuide component
  - Files: src/components/ai/TourGuide.tsx
  - UI: "Tell me about this place" button, expandable content area
  - Display: Title, content text, audio play button
  - Features: Loading state for live AI generation
  - Test: Component renders with content

- [ ] 6.2.4: Implement hybrid online/offline tour content
  - Files: src/lib/tour-guide.ts
  - Logic: Check online → if yes, generate fresh content via Claude → cache result
  - Fallback: If offline, serve pre-cached content
  - Caching: Store AI-generated content for future offline use
  - Test: Works both online and offline

- [ ] 6.2.5: Implement browser Text-to-Speech (TTS)
  - Files: src/lib/tts.ts, src/components/ai/TourGuide.tsx
  - API: Web Speech API (speechSynthesis)
  - Features: Play/pause/stop, speech rate control
  - Voice: Use device's Japanese-capable voice or English fallback
  - Test: TTS reads tour content aloud, works offline

- [ ] 6.2.6: Add Tour Guide to activity detail page
  - Files: src/app/schedule/[id]/page.tsx or src/components/schedule/ActivityDetail.tsx
  - Integration: Show TourGuide component for cultural site categories (temple, activity with landmarks)
  - Condition: Only show for locations with tour content
  - Test: Tour guide appears on cultural site activity details

- [ ] 6.2.7: Create city overview access point
  - Files: src/components/dashboard/CityOverview.tsx or integrate into existing component
  - Access: From dashboard or day header when in a new city
  - Display: City name, "About this city" button → TourGuide with city content
  - Test: City overviews accessible from dashboard

**Phase 6 Checkpoint:**

- [ ] AI chat responds with trip context
- [ ] Chat history persists across sessions
- [ ] Offline questions return cached responses
- [ ] Tour guide shows on cultural site activity details
- [ ] "Tell me about this place" generates or loads content
- [ ] TTS reads tour content aloud
- [ ] City overviews accessible for all 4 cities
- [ ] Online/offline hybrid works correctly
- [ ] Commit: "feat: complete AI assistant and tour guide (Phase 6)"

### Phase 7: Push Notifications

> Proactive reminders via PWA push notifications on iOS 16.4+.

- [ ] 7.1.1: Set up Web Push with VAPID keys
  - Files: src/lib/push.ts, environment variables
  - Setup: Generate VAPID key pair, configure in env
  - Test: Keys configured correctly

- [ ] 7.1.2: Create notification permission flow
  - Files: src/components/ui/NotificationPrompt.tsx, src/app/settings/page.tsx
  - UI: Explain value, request permission, handle denial gracefully
  - Fallback: In-app notification center if push denied
  - Test: Permission flow works on iOS Safari

- [ ] 7.1.3: Create notification scheduling service
  - Files: src/lib/notifications.ts, src/app/api/notifications/route.ts
  - Logic: Schedule notifications based on itinerary times
  - Storage: Track scheduled notifications in IndexedDB
  - Test: Notifications schedule correctly

- [ ] 7.1.4: Implement morning briefing notifications
  - Time: 8:00 AM JST daily
  - Content: Today's highlights, weather, hard deadlines
  - Test: Morning notification fires at correct time

- [ ] 7.1.5: Implement departure reminders
  - Time: 30 minutes before "leave by" time
  - Content: "Time to head to [destination]"
  - Test: Departure reminder fires correctly

- [ ] 7.1.6: Implement deadline alerts
  - Time: 60 minutes before hard deadlines
  - Content: "[Activity] in 1 hour - head back!"
  - Test: Deadline alert fires correctly

- [ ] 7.1.7: Add notification preferences to settings
  - Files: src/app/settings/page.tsx
  - Options: Toggle each notification type on/off
  - Persistence: Store preferences in IndexedDB
  - Test: Preferences save and apply

**Phase 7 Checkpoint:**

- [ ] Push notifications work on iOS 16.4+ PWA
- [ ] Morning briefing fires at 8:00 AM JST
- [ ] Departure reminders fire 30 min before leave time
- [ ] Deadline alerts fire 60 min before deadlines
- [ ] Notification preferences configurable
- [ ] Commit: "feat: complete push notifications (Phase 7)"

### Phase 8: Admin Panel

> Mobile-friendly admin interface for Rich to edit itinerary in real-time.

- [ ] 8.1.1: Implement Supabase Auth for Rich
  - Files: src/lib/supabase-auth.ts, src/app/api/auth/route.ts
  - Method: Magic link (email) authentication
  - Setup: Create Rich's account in Supabase Auth dashboard
  - Test: Magic link login works

- [ ] 8.1.2: Create admin route protection
  - Files: src/middleware.ts or src/components/AdminGuard.tsx
  - Logic: Check auth state, redirect to login if not authenticated
  - Routes: /admin/* protected
  - Test: Unauthenticated users cannot access admin

- [ ] 8.1.3: Create admin dashboard
  - Files: src/app/admin/page.tsx, src/components/admin/AdminDashboard.tsx
  - UI: Links to edit activities, alerts, restaurants, checklist
  - Style: Mobile-first, large touch targets
  - Test: Dashboard renders for authenticated admin

- [ ] 8.1.4: Build activity edit forms
  - Files: src/app/admin/activities/page.tsx, src/components/admin/ActivityForm.tsx
  - Features: Edit time, name, details, tips, links
  - CRUD: Add new activity, edit existing, delete
  - Test: Activity edits save correctly

- [ ] 8.1.5: Build alert creation form
  - Files: src/app/admin/alerts/page.tsx, src/components/admin/AlertForm.tsx
  - Features: Create banner visible to all users, set type and expiry
  - Test: Alerts create and display to all users

- [ ] 8.1.6: Implement optimistic updates with sync
  - Files: src/lib/admin-sync.ts
  - Logic: Write to IndexedDB immediately, push to Supabase
  - Conflict: Handle sync failures, show retry option
  - Test: Edits appear instantly, sync to server

- [ ] 8.1.7: Add real-time sync to other devices
  - Files: src/lib/sync.ts (enhance existing)
  - Logic: Supabase real-time subscriptions push admin edits to all users
  - UI: Show "Updated" toast when content changes
  - Test: Edits appear on other devices within seconds

**Phase 8 Checkpoint:**

- [ ] Rich can log in via magic link
- [ ] Admin routes protected
- [ ] Can edit activity times and details
- [ ] Can create alerts visible to all users
- [ ] Edits sync to all devices in real-time
- [ ] Commit: "feat: complete admin panel (Phase 8)"

### Phase 9: Group Location Sharing

> Simple check-in system for group coordination when separated.

- [ ] 9.1.1: Create "I'm here" location share button
  - Files: src/components/ui/ShareLocationButton.tsx
  - Action: Captures current GPS, pushes to Supabase location_shares
  - UI: Confirmation toast, timestamp of share
  - Privacy: Only shares when user explicitly taps
  - Test: Location shares to database

- [ ] 9.1.2: Build group map view
  - Files: src/app/group/page.tsx, src/components/maps/GroupMap.tsx
  - Display: Map with pin for each adult's last shared location
  - Info: Name, timestamp of last share
  - Real-time: Supabase subscription updates pins live
  - Test: All 4 adults visible on map

- [ ] 9.1.3: Add meeting point feature
  - Files: src/components/maps/MeetingPoint.tsx
  - Features: Set a meeting point, show distance from each person
  - UI: Tap to set point, share with group
  - Test: Meeting point visible to all, distances calculate

- [ ] 9.1.4: Add group location to Quick Actions
  - Files: src/components/dashboard/QuickActions.tsx
  - Button: "Group" or "Find Everyone" → opens group map
  - Test: Quick access from dashboard

**Phase 9 Checkpoint:**

- [ ] "I'm here" shares location to group
- [ ] Group map shows all adults' locations
- [ ] Meeting point feature works
- [ ] Real-time updates when someone shares
- [ ] Commit: "feat: complete group location sharing (Phase 9)"

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
| 0.5.3 | 2026-01-26 | 0595810 | Index files |
| 1.1.1 | 2026-01-26 | - | Dexie FTCDatabase class |
| 1.1.2 | 2026-01-26 | - | db/types.ts with table maps |
| 1.1.3 | 2026-01-26 | - | Version 1 schema |
| 1.2.1 | 2026-01-26 | - | Supabase client config |
| 1.2.2 | 2026-01-26 | - | Query helpers with snake→camel |
| 1.3.1 | 2026-01-26 | - | downloadAllData sync |
| 1.3.2 | 2026-01-26 | - | Real-time subscriptions |
| 1.3.3 | 2026-01-26 | - | Zustand sync store |
| 1.3.4 | 2026-01-26 | - | Providers + layout |
| 1.4.1 | 2026-01-26 | - | useActivities hook |
| 1.4.2 | 2026-01-26 | - | useAccommodations hook |
| 1.4.3 | 2026-01-26 | - | useCurrentActivity hook |
| 1.4.4 | 2026-01-26 | - | useNextActivity hook |
| 1.4.5 | 2026-01-26 | - | useAlerts hook |
| 2.1.1 | 2026-01-26 | - | Dashboard page |
| 2.1.2 | 2026-01-26 | - | DashboardLayout component |
| 2.2.1 | 2026-01-26 | - | NowWidget component |
| 2.2.2 | 2026-01-26 | - | Time remaining countdown |
| 2.3.1 | 2026-01-26 | - | NextWidget component |
| 2.3.2 | 2026-01-26 | - | Leave by time display |
| 2.4.1 | 2026-01-26 | - | Weather service + caching |
| 2.4.2 | 2026-01-26 | - | WeatherWidget component |
| 2.5.1 | 2026-01-26 | - | QuickActions component |
| 2.5.2 | 2026-01-26 | - | AlertBanner component |
| 2.6.1 | 2026-01-26 | - | DayIndicator component |
| 2.6.2 | 2026-01-26 | - | DaySelector modal |
| 3.1.1 | 2026-01-26 | - | Schedule page |
| 3.1.2 | 2026-01-26 | - | DayNav component |
| 3.2.1 | 2026-01-26 | - | ActivityCard component |
| 3.2.2 | 2026-01-26 | - | CategoryIcon component |
| 3.2.3 | 2026-01-26 | - | Activity card states |
| 3.3.1 | 2026-01-26 | - | Timeline component |
| 3.3.2 | 2026-01-26 | - | Leave by badges |
| 3.4.1 | 2026-01-26 | - | Activity detail page |
| 3.4.2 | 2026-01-26 | - | Tap-to-map links |
| 4.1.1 | 2026-01-26 | 8d50526 | Google Maps API key |
| 4.1.2 | 2026-01-26 | 8d50526 | Maps loader utility |
| 4.1.3 | 2026-01-26 | 8d50526 | Map.tsx component |
| 4.2.1 | 2026-01-26 | 8d50526 | useGeolocation hook |
| 4.2.2 | 2026-01-26 | 8d50526 | User location marker |
| 4.3.1 | 2026-01-26 | 8d50526 | Pin.tsx component |
| 4.3.2 | 2026-01-26 | 8d50526 | Activity pins on map |
| 4.3.3 | 2026-01-26 | 8d50526 | PinInfo popup |
| 4.4.1 | 2026-01-26 | 8d50526 | Directions component |
| 4.4.2 | 2026-01-26 | 8d50526 | Walking route in Directions |
| 4.4.3 | 2026-01-26 | 8d50526 | Open in Google Maps button |
| 5.1.1 | 2026-01-26 | - | Reservations page |
| 5.1.2 | 2026-01-26 | - | AccommodationCard component |
| 5.2.1 | 2026-01-26 | - | Japanese address copy |
| 5.2.2 | 2026-01-26 | - | Tap-to-call phone |
| 5.2.3 | 2026-01-26 | - | Google Maps link |
| 5.2.4 | 2026-01-26 | - | Special instructions |
| 5.3.1 | 2026-01-26 | - | BottomNav component |
| 5.3.2 | 2026-01-26 | - | Active state nav items |
