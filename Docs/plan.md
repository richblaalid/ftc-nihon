# Technical Implementation Plan

> Generated from Docs/product_docs/PRDs/FTC_Nihon_PRD.md and Docs/product_docs/ADRs/ on January 26, 2026
> Last updated: January 26, 2026

## Overview

FTC: Nihon is an offline-first Progressive Web App (PWA) serving as a travel concierge for the Finer Things Club's Japan trip (March 6-21, 2026). The app provides real-time schedule management, navigation assistance, and trip information for 4 adults traveling with 3 children across Tokyo, Hakone, Kyoto, and Osaka. The core architecture treats the network as an enhancement—IndexedDB is the primary data source, Supabase provides sync.

## Architecture Summary

The system follows an offline-first architecture (ADR-002) using Next.js 14 with App Router (ADR-003) deployed as a PWA (ADR-001). Data flows from Supabase → IndexedDB on initial load, then the app reads exclusively from IndexedDB for offline operation. Admin edits sync via Supabase real-time to all devices (ADR-007, ADR-010).

### Key Components

| Component | Responsibility | Key Technologies |
| --------- | -------------- | ---------------- |
| PWA Shell | App container, offline capability, push notifications | Next.js 14, Workbox, Service Worker |
| Data Layer | Offline storage, sync with Supabase | Dexie.js (IndexedDB), Supabase JS Client |
| State Management | UI state, sync status | Zustand |
| Dashboard | NOW/NEXT widgets, weather, alerts | React Server Components, Client Components |
| Schedule View | Daily timeline, activity cards | React, Tailwind CSS |
| Maps | GPS location, day pins, directions | Google Maps JavaScript API |
| Admin Panel | Real-time itinerary editing | Supabase Auth, React Forms |

### Data Flow

```
INITIAL LOAD (requires internet once):
Supabase PostgreSQL → Full data download → IndexedDB (Dexie.js)

NORMAL USAGE (works offline):
User opens app → Dexie.js (IndexedDB) → Zustand → React UI
                  ↑
                  No internet needed!

ADMIN EDIT (Rich only):
Edit form → Dexie.js (optimistic) → Supabase → Real-time broadcast → Other devices

BACKGROUND SYNC (when online):
Supabase real-time subscriptions → Update IndexedDB → UI refreshes
```

## Implementation Phases

### Phase 0: Project Foundation

**Goal:** Runnable Next.js 14 PWA skeleton with dev tooling and data layer setup
**Timeline:** PRD Phase 1 foundation

- Initialize Next.js 14 project with App Router and TypeScript
- Configure PWA: manifest.ts, service worker, security headers
- Set up Tailwind CSS with mobile-first design tokens
- Configure ESLint, Prettier, TypeScript strict mode
- Set up Dexie.js database with TypeScript schema matching Supabase
- Configure Supabase client with real-time subscriptions
- Create Zustand stores for app state and sync status
- Verify: `npm run dev`, `npm run build`, PWA installable on iOS

### Phase 1: Data Layer & Sync

**Goal:** Complete offline-first data architecture with Supabase sync
**Depends on:** Phase 0

- Implement Dexie.js schema matching all 8 Supabase tables
- Create sync service: initial data download from Supabase
- Implement real-time subscription handlers for live updates
- Build sync status tracking (last synced, pending changes)
- Create data hooks for React components (useActivities, useAccommodations, etc.)
- Verify: App loads data, works in airplane mode, syncs when online

### Phase 2: Dashboard Home Screen

**Goal:** Widget-based home screen with NOW/NEXT and weather
**Depends on:** Phase 1

- Build responsive dashboard layout (mobile-first, iOS optimized)
- Implement NOW widget: current activity with time remaining
- Implement NEXT widget: upcoming activity with "leave by" time
- Add weather widget (OpenWeather API or similar, with offline cache)
- Create quick action buttons (Map, AI Assistant, Reservations)
- Build alert banner system for hard deadlines
- Add date/day indicator with day-switching
- Verify: Dashboard loads < 2 seconds, auto-updates, works offline

### Phase 3: Daily Schedule View

**Goal:** Full timeline view of activities with transit info
**Depends on:** Phase 2

- Build day selector (swipe or tap navigation)
- Create activity card component with category icons
- Implement timeline layout with time-based highlighting
- Add visual distinction for current/completed/deadline activities
- Display "leave by" times from transit_segments
- Link activities to detail views
- Verify: All 15 days accessible, current activity highlighted, offline works

### Phase 4: Maps & Navigation

**Goal:** Interactive maps with GPS and directions
**Depends on:** Phase 3

- Integrate Google Maps JavaScript API
- Implement GPS location tracking
- Create custom category pins (food, temple, shopping, etc.)
- Build day pins view showing all locations
- Implement walking route display
- Create directions view with step-by-step transit
- Add "Open in Google Maps" fallback
- Verify: GPS works, pins display, directions readable

### Phase 5: Reservations & Details

**Goal:** Hotel and restaurant information display
**Depends on:** Phase 3

- Build reservations wallet view
- Create accommodation cards (English + Japanese addresses)
- Implement tap-to-call phone numbers
- Add Google Maps links
- Display QR codes where applicable
- Build restaurant detail cards with "what to order" tips
- Verify: All 4 accommodations display, Japanese text copyable

### Phase 5.5: Quick Utility Features

**Goal:** High-value utility features that enhance daily usability
**Depends on:** Phase 5

- Add Google Translate link to Quick Actions (opens external app/site)
- Build currency converter: daily-cached exchange rate, two-way Yen ↔ USD
- Create context-aware Japanese phrase system tied to activity categories
- Build phrase display component with preview + expandable full list
- Populate phrase database for all 6 categories (restaurant, transit, shopping, temple, hotel, emergency)
- Verify: All utilities work offline, phrases appear contextually on activity details

---

## MVP Boundary

**MVP includes:** Phases 0-5 (P1 features from PRD)
**Post-MVP:** Quick Utilities (5.5), AI Assistant + Tour Guide (6), Push Notifications (7), Admin Panel (8), Group Location Sharing (9)

**MVP is complete when:**

- [x] Dashboard loads in < 2 seconds with cached data
- [x] "Now" activity updates automatically based on time
- [x] "Leave by" times displayed for all transit segments
- [x] All 15 days of itinerary accessible and navigable
- [x] GPS location shows on map with day pins
- [x] All 4 accommodations display with Japanese addresses
- [x] App works fully offline after initial data load
- [x] PWA installable on iOS 16.4+ devices
- [x] All Phase 0-5 checkpoints pass

## Post-MVP Phases

### Phase 6: AI Assistant + Tour Guide

**Goal:** Context-aware AI chat and location-based tour guide with audio
**Depends on:** Phase 5.5

- Create AI chat interface with trip context injection
- Integrate Claude API with system prompt (current location, time, group composition)
- Pre-cache common Q&A responses for offline fallback
- Add chat history persistence in IndexedDB
- Build "Tell me about this place" tour guide feature for cultural sites
- Pre-generate tour content for temples, shrines, landmarks (~20 locations)
- Create city overview content for Tokyo, Hakone, Kyoto, Osaka
- Implement hybrid online/offline: live AI when connected, cached content when offline
- Add browser Text-to-Speech (TTS) for audio playback of tour content
- Verify: AI chat responds with context, tour guide works offline, TTS plays correctly

### Phase 7: Push Notifications

**Goal:** Proactive reminders via PWA push notifications
**Depends on:** Phase 6

- Set up Web Push with VAPID keys
- Create notification permission flow
- Implement morning briefing notifications (8:00 AM JST)
- Implement departure reminders (30 min before "leave by")
- Implement hard deadline alerts (60 min before)
- Verify: Notifications work on iOS 16.4+ PWA

### Phase 8: Admin Panel

**Goal:** Mobile-friendly admin interface for Rich to edit itinerary
**Depends on:** Phase 6

- Implement Supabase Auth (magic link for Rich)
- Create admin route protection
- Build activity edit forms (time, details, tips)
- Build alert creation form
- Implement optimistic updates with Supabase sync
- Verify: Edits sync to all devices in real-time

### Phase 9: Group Location Sharing

**Goal:** Simple check-in system for group coordination
**Depends on:** Phase 8

- Create "I'm here" location share button
- Build group map view showing all adults
- Add meeting point feature
- Verify: Location shares visible to all users

---

## External Dependencies

| Dependency | Purpose | Version | Documentation |
|------------|---------|---------|---------------|
| Next.js | React framework with App Router | 14.x | [nextjs.org/docs](https://nextjs.org/docs) |
| Dexie.js | IndexedDB wrapper | 4.x | [dexie.org](https://dexie.org) |
| @supabase/supabase-js | Supabase client | 2.x | [supabase.com/docs](https://supabase.com/docs) |
| Zustand | State management | 5.x | [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand) |
| Tailwind CSS | Utility-first CSS | 3.x | [tailwindcss.com](https://tailwindcss.com) |
| Google Maps API | Maps and directions | - | [developers.google.com/maps](https://developers.google.com/maps) |
| Workbox | Service Worker tooling | 7.x | [developer.chrome.com/docs/workbox](https://developer.chrome.com/docs/workbox) |

## Open Questions

- [ ] Weather API choice: OpenWeather (free tier) vs WeatherAPI vs hardcoded forecast?
- [ ] Map tile caching strategy for offline (Google ToS prohibits caching—need static image fallback)
- [ ] Service Worker generation: next-pwa vs Serwist vs manual Workbox?

## ADR References

| ADR | Title | Status |
|-----|-------|--------|
| ADR-001 | PWA vs Native App | Accepted |
| ADR-002 | Offline-First Architecture | Accepted |
| ADR-003 | Frontend Framework Selection | Accepted |
| ADR-004 | Map Provider Selection | Accepted |
| ADR-005 | AI Integration Strategy | Accepted |
| ADR-006 | Notification Strategy | Accepted |
| ADR-007 | Data Storage & Sync | Accepted |
| ADR-008 | Hosting & Deployment | Accepted |
| ADR-009 | Transit Data Strategy | Accepted |
| ADR-010 | Admin Panel Architecture | Accepted |

## PRD Alignment

This plan implements the following PRD sections:

- **Section 4.2.1**: Dashboard Home Screen → Phase 2
- **Section 4.2.2**: Daily Schedule View → Phase 3
- **Section 4.2.3**: Transit Integration → Phase 3 (data), Phase 4 (display)
- **Section 4.2.4**: Maps with GPS → Phase 4
- **Section 4.2.5**: Turn-by-Turn Directions → Phase 4
- **Section 4.2.6**: Reservations Display → Phase 5
- **Section 7.4-7.5**: Offline Architecture → Phase 0-1
- **Section 4.3.1**: AI Travel Concierge → Phase 6 (enhanced with Tour Guide)
- **Section 4.3.3**: Push Notifications → Phase 7
- **Section 4.3.5**: Admin Panel → Phase 8
- **Section 4.3.4**: Group Location Sharing → Phase 9
- **Section 4.4.1**: Japanese Phrase Helper → Phase 5.5 (enhanced with context-awareness)
- **New Feature**: Google Translate Link → Phase 5.5
- **New Feature**: Currency Converter → Phase 5.5
- **New Feature**: AI Tour Guide with Audio → Phase 6

## Notes for Implementation

### Design Principles (from PRD)

1. **Offline-First** - Core features work with zero connectivity. Test in airplane mode.
2. **Glanceable** - Answer "Where should I be?" in < 3 seconds. No scrolling for critical info.
3. **Stress-Reducing** - Proactive alerts, generous buffers, no anxiety-inducing countdowns.
4. **Better Than Paper** - If PDF is faster, the feature has failed.
5. **Erin Test** - Validate UX against least tech-savvy user.

### Key Constraints

- All users on iOS 16.4+ Safari (PWA optimized for this)
- 44x44pt minimum touch targets
- Pre-calculated transit times (live recalculation optional)
- ~50MB total cache size (data + map images)
- Free tier limits: Supabase 500MB/50K req, Google Maps $200 credit

### Integration Points

- Supabase real-time requires WebSocket connection
- Google Maps API key needed with domain restrictions
- Service Worker must cache app shell + data separately
- IndexedDB is primary—never read directly from Supabase in components
