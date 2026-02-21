# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FTC: Nihon is an offline-first PWA travel concierge for the Finer Things Club's Japan trip (March 6-21, 2026). 4 adults + 3 children across Tokyo, Hakone, Kyoto, and Osaka. Launch deadline: March 1, 2026.

## Commands

```bash
npm run dev          # Dev server on localhost:4000
npm run build        # Production build (also validates types)
npm run lint         # ESLint with --max-warnings 0
npm run typecheck    # TypeScript type checking only
npm run format       # Prettier format all files
npm run test:run     # Run Vitest once (use before commits)
npm test             # Vitest in watch mode
npm run test:e2e     # Playwright E2E tests (requires dev server on :4000)
```

**Restart dev server** (port-specific, won't kill other Next.js servers):
```bash
lsof -ti:4000 | xargs kill 2>/dev/null; npm run dev
```

**Run a single test file:**
```bash
npx vitest run src/lib/time-utils.test.ts
```

**Claude Code skills:**
```
/plan              # View/generate implementation plan
/execute           # Execute next task from docs/tasks.md
/execute 0.1.1     # Execute specific task
```

## Technology Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript (strict, noUncheckedIndexedAccess) |
| Styling | Tailwind CSS v4 (CSS-based config, no tailwind.config.ts) |
| State | Zustand with localStorage persistence |
| Offline DB | Dexie.js v4 (IndexedDB) — PRIMARY data source |
| Sync Layer | Supabase (PostgreSQL + real-time) — sync only, never read directly |
| AI Chat | Vercel AI SDK v6 (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`) |
| Animation | `motion` v12 (import from `motion/react`) |
| PWA | Vanilla service worker (`public/sw.js`, no Workbox) |
| Hosting | Vercel |

**Path alias:** `@/*` → `./src/*`

## Architecture

### Data Flow (Offline-First)

```
Supabase (cloud) → Sync → Dexie.js (IndexedDB) → useLiveQuery hooks → React components
                                                    ↑
                            Seed data (seed-data.ts) fills on first load / version bump
```

**Critical rule:** Components NEVER read from Supabase directly. Always use Dexie hooks from `src/db/hooks/`.

### Dexie Database

- **Database class:** `src/db/database.ts` — singleton exported as `db`, 20 tables, currently schema v5
- **Hooks directory:** `src/db/hooks/` — split into modules (`activities.ts`, `restaurants.ts`, `meal-selection.ts`, `accommodations.ts`, `trip.ts`, `utilities.ts`, `sync.ts`), re-exported from `src/db/hooks/index.ts`
- **All hooks use** `useLiveQuery` from `dexie-react-hooks` with `syncVersion` dependency for manual cache invalidation via `useSyncStore.incrementSyncVersion()`

### Seed Data System

**When modifying `src/db/seed-data.ts` or any seed file, you MUST increment `DATA_VERSION` in `src/db/seed.ts`.**

```typescript
// src/db/seed.ts — currently at version 32
export const DATA_VERSION = 32;
```

- Stored in `localStorage` as `ftc-nihon-data-version`
- `checkDataVersion()` runs on every app load from `providers.tsx`
- Selective reseed: updates phrases, checklist, transit, activities, dayInfo, tickets, restaurants
- `mealSelections` table is intentionally NEVER wiped during reseed (preserves user choices)
- Dev reset: `indexedDB.deleteDatabase('ftc-nihon-db')` in browser console, or `window.reseedDatabase()` in dev mode

### Zustand Stores

| Store | localStorage key | State |
|-------|-----------------|-------|
| `useSyncStore` | `ftc-sync-state` | `isOnline`, `syncVersion` (only syncVersion persisted) |
| `useAppStore` | `ftc-app-state` | `selectedDay`, `scheduleViewMode` (fully persisted) |

### API Routes

- `POST /api/chat` — Streams Claude responses via Vercel AI SDK. Edge runtime, 30s max.
- `POST /api/notifications` — Web Push via `web-push` library. Requires VAPID env vars.

### AI Chat (`/ai`)

Uses Vercel AI SDK v6 patterns:
- `useChat` from `@ai-sdk/react` with `DefaultChatTransport`
- Messages use `parts` array (not `content` string): `message.parts.filter(p => p.type === 'text').map(p => p.text).join('')`
- API route uses `streamText` + `convertToModelMessages` + `result.toUIMessageStreamResponse()`
- Offline: falls back to pre-cached Q&A from `seed-ai-cache.ts` injected directly into state
- Trip context (current activity, schedule, hotel) injected via `buildSystemPrompt()` in `src/lib/ai.ts`
- Chat history persisted to IndexedDB `chatMessages` table

### Tour Guide Feature

3-layer content system for 22 locations:
1. **Static content** — `src/db/seed-tour-content.ts` (rich narratives, city overviews)
2. **Dynamic IndexedDB** — `db.tourContent` table for cached/AI-generated content
3. **Audio** — Pre-generated MP3s in `/public/audio/tour-*.mp3` + `useAudioPlayer` hook

Activity-to-tour mapping: `ACTIVITY_TO_TOUR_MAPPING` in `src/lib/tour-guide.ts` (hardcoded dictionary).

### Service Worker

- **File:** `public/sw.js` — vanilla JS, cache name `ftc-nihon-v6` (increment to bust cache)
- **HTML requests:** Network-first, fallback to cache then `/`
- **Assets:** Stale-while-revalidate
- **Update flow:** `UpdateBanner.tsx` detects `registration.waiting` → user clicks Update → sends `SKIP_WAITING` message → reload
- **Cache warmer:** `src/lib/cache-warmer.ts` prefetches routes + schedule/restaurant pages 2s after app init

### Tailwind v4 Configuration

All design tokens and utility classes are defined in `src/app/globals.css` using Tailwind v4's CSS-based config:
- `@import 'tailwindcss'` — no `tailwind.config.ts`
- `@custom-variant dark` — supports both `.dark` class AND `prefers-color-scheme`
- `@theme {}` — custom color palettes (cream, coral, amber, indigo, vermillion, gold, etc.)
- `@utility card {}`, `@utility btn-primary {}`, `@utility pill-food {}` — component classes as v4 utilities

### Page Transitions

`src/app/template.tsx` wraps all pages in `PageTransition` using `motion/react`:
```tsx
import { motion, AnimatePresence } from 'motion/react';
```
Subtle fade + 8px vertical slide, 150ms duration. All other animations use Tailwind CSS transitions.

### Fonts

Loaded in `layout.tsx`:
- **Urbanist** — Google Fonts, body text (`font-sans`)
- **Reggae One** — Local file (`src/app/fonts/ReggaeOne-Regular.ttf`), display only (`font-display`)
- **Geist Mono** — Local file, monospace (`font-mono`)

### Time / Trip Date Logic

- `src/lib/trip-dates.ts` — `getTripDay()`, `isOnTrip()`, `getCityForDay()`, `TRIP_CITIES`
- `src/lib/time-utils.ts` — `getJapanTimeString()`, `parseTimeToMinutes()`, `minutesToTimeString()`
- `src/lib/utils.ts` — `getCurrentDate()`, `getJapanDateString()`
- All dates/times are Japan-timezone-first

## Key Documents

| Document | Purpose |
| -------- | ------- |
| [docs/tasks.md](docs/tasks.md) | Current task list and progress |
| [docs/plan.md](docs/plan.md) | Technical implementation plan |
| [Docs/AI_ITINERARY_EDITING_PROMPT.md](Docs/AI_ITINERARY_EDITING_PROMPT.md) | Rules for AI-assisted itinerary editing |
| [Docs/product_docs/FTC_Nihon_Design_System.md](Docs/product_docs/FTC_Nihon_Design_System.md) | Full brand & design system spec |
| [Docs/product_docs/ADRs/FTC_Nihon_ADRs.md](Docs/product_docs/ADRs/FTC_Nihon_ADRs.md) | Architecture Decision Records |
| [Docs/product_docs/PRDs/FTC_Nihon_PRD.md](Docs/product_docs/PRDs/FTC_Nihon_PRD.md) | Product Requirements Document |

## Design System (Quick Reference)

Full spec: [Docs/product_docs/FTC_Nihon_Design_System.md](Docs/product_docs/FTC_Nihon_Design_System.md)

**Light Mode** — warm cream bg (#FFFBF7), coral accent (#F46B55), amber secondary (#F5B800)
**Dark Mode** — deep indigo-black bg (#0D1117), vermillion accent (#E53935), gold (#FFD700)

**Category colors:** Food=coral, Temple=purple, Shopping=amber, Transit=blue, Activity=teal, Hotel=violet

**Transit rendering** via `transitRenderType` on activities:

| Value | Component | Use Case |
|-------|-----------|----------|
| `'full'` | TransitCard | Train journeys with steps |
| `'simplified'` | SimplifiedTransitCard | Scenic transit (ropeway, cable car, pirate ship, bus) |
| `'walk'` | WalkIndicator | Short walks |
| `'keep'` | ActivityCard | Buffer time |
| `'flight'` | ActivityCard | Flights |
| `null` | ActivityCard + TransitCard | Regular activity with transit |

**Meal slot logic:** Meals show "included" when ryokan days (Day 6 dinner, Day 7 breakfast/dinner, Day 8 breakfast), plan note contains "included"/"ryokan"/"yoshimatsu", or hotel breakfast. Otherwise `RestaurantOptionsCard` shows restaurant options.

## Code Conventions

- Named exports, no default exports
- Early returns, max 300 lines per file
- `type` for unions, `interface` for object shapes
- Props interface: `{Component}Props`
- Server Components by default; `'use client'` only when needed
- Commit format: `type(scope): description` — types: feat, fix, refactor, test, docs, chore

## Testing

- **Unit tests:** Co-located as `*.test.ts(x)`, also in `tests/unit/`
- **E2E tests:** `tests/audit/` directory, Playwright with iPhone 13 Pro viewport (390x844)
- **Test environment:** jsdom, setup in `tests/setup.tsx` (mocks Next.js navigation, IntersectionObserver, etc.)
- **Coverage thresholds:** branches 8%, functions 12%, lines 11%, statements 11%

## Environment Variables

Required:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

For push notifications:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=
```

Optional:
```
NEXT_PUBLIC_WEATHER_API_KEY=
```

## Session Protocol

1. Read this file, then `docs/tasks.md` for current status
2. State which task you'll work on and your approach
3. Wait for approval before writing code
4. Work on ONE task at a time
5. Run `npm run lint` and `npm run build` after changes
6. Mark task complete in `docs/tasks.md`, commit with descriptive message

## Do NOT

- Read from Supabase directly in components (use Dexie hooks)
- Use `any` types
- Install dependencies without discussing first
- Make architectural changes not covered by ADRs
- Modify multiple tasks without approval
- Skip linting or type checking
- Use `pkill -f "next dev"` (kills ALL Next.js servers; use port-specific kill)

## Key Constraints

- All users on iOS 16.4+ Safari
- 44x44pt minimum touch targets, 16px minimum body text
- ~50MB total cache size
- Free tier limits: Supabase 500MB/50K req, Google Maps $200 credit
