# FTC: Nihon - Claude Code Instructions

## Project Overview

FTC: Nihon is an offline-first Progressive Web App (PWA) serving as a travel concierge for the Finer Things Club's Japan trip (March 6-21, 2026). The app provides real-time schedule management, navigation assistance, and trip information for 4 adults traveling with 3 children across Tokyo, Hakone, Kyoto, and Osaka. Launch deadline: March 1, 2026.

## Key Documents

| Document | Purpose |
| -------- | ------- |
| [docs/plan.md](docs/plan.md) | Technical implementation plan |
| [docs/tasks.md](docs/tasks.md) | Current task list and progress |
| [Docs/product_docs/PRDs/FTC_Nihon_PRD.md](Docs/product_docs/PRDs/FTC_Nihon_PRD.md) | Product Requirements Document |
| [Docs/product_docs/ADRs/FTC_Nihon_ADRs.md](Docs/product_docs/ADRs/FTC_Nihon_ADRs.md) | Architecture Decision Records (10 ADRs) |
| [Docs/product_docs/FTC_Nihon_Design_System.md](Docs/product_docs/FTC_Nihon_Design_System.md) | Brand & Design System |
| [Docs/product_docs/FTC_Nihon_Supabase_Schema.sql](Docs/product_docs/FTC_Nihon_Supabase_Schema.sql) | Supabase PostgreSQL schema (8 tables) |

## Technology Stack

| Layer | Technology | ADR |
| ----- | ---------- | --- |
| Runtime | Node.js 20+ | - |
| Framework | Next.js 14 (App Router) | ADR-003 |
| Language | TypeScript, strict mode | - |
| Styling | Tailwind CSS | ADR-003 |
| State | Zustand | ADR-003 |
| Offline DB | Dexie.js (IndexedDB) - PRIMARY | ADR-007 |
| Sync Layer | Supabase (PostgreSQL + real-time) | ADR-007 |
| Auth | Supabase Auth (admin only) | ADR-010 |
| Maps | Google Maps JavaScript API | ADR-004 |
| PWA | Service Worker + Workbox | ADR-001, ADR-002 |
| Hosting | Vercel | ADR-008 |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Dashboard home
│   ├── schedule/           # Daily schedule views
│   ├── map/                # Map views
│   ├── reservations/       # Accommodations
│   └── manifest.ts         # PWA manifest
├── components/
│   ├── ui/                 # Primitive/shared components
│   ├── dashboard/          # Dashboard widgets
│   ├── schedule/           # Schedule components
│   ├── maps/               # Map components
│   └── reservations/       # Reservation components
├── db/
│   ├── database.ts         # Dexie.js database class
│   ├── types.ts            # Database types
│   └── hooks.ts            # React hooks for data
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── sync.ts             # Sync service
│   └── utils.ts            # Utility functions
├── stores/
│   └── sync-store.ts       # Zustand stores
└── types/
    └── database.ts         # TypeScript types
public/
├── sw.js                   # Service worker
├── icon-192x192.png        # PWA icons
└── icon-512x512.png
```

## Available Commands

### Development

```bash
npm run dev        # Start dev server (localhost:4000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run format     # Format with Prettier
```

### Dev Server Restart (Port-Specific)

**IMPORTANT:** This project runs on port 4000. To restart the dev server without affecting other projects:

```bash
lsof -ti:4000 | xargs kill 2>/dev/null; npm run dev
```

Never use `pkill -f "next dev"` as it kills ALL Next.js dev servers on the machine.

### Database

```bash
# Supabase CLI (if installed)
supabase start     # Start local Supabase
supabase db reset  # Reset and seed database
```

### Claude Code Skills

```
/plan              # View/generate implementation plan
/execute           # Execute next task from docs/tasks.md
/execute 0.1.1     # Execute specific task
```

## Design System

**Full spec:** [Docs/product_docs/FTC_Nihon_Design_System.md](Docs/product_docs/FTC_Nihon_Design_System.md)

### Brand Personality
- Adventurous, Playful, Curious, Foodie
- Balance point: 4/7 on playful ↔ polished scale
- "Premium travel app with soul"

### Color Themes

**Light Mode - "Sunset Adventure"**
- Background: `cream-50` (#FFFBF7) warm cream
- Primary accent: `coral-500` (#F46B55)
- Secondary: `amber-500` (#F5B800)
- Text: `#2D2420` warm charcoal

**Dark Mode - "Bold & Spicy"**
- Background: `indigo-950` (#0D1117) deep indigo-black
- Primary accent: `vermillion-500` (#E53935)
- Secondary: `orange-500` (#F58220)
- Accent: `gold-500` (#FFD700)
- Text: `#F5F5F5` off-white

### Typography

| Use | Font | Example Class |
|-----|------|---------------|
| Display/Headlines | Reggae One | `font-display text-display-md` |
| Body/UI | Urbanist | `font-sans` (default) |
| Code | Geist Mono | `font-mono` |

**Reggae One rules:**
- Use sparingly - splash screen, day headers, location titles
- Never for body text or UI
- Minimum size: 24px
- Always uppercase or title case

### Category Colors

| Category | Light | Dark | Usage |
|----------|-------|------|-------|
| Food | coral-500 | vermillion-500 | `.pill-food`, `.text-category-food` |
| Temple | purple (#7C3AED) | light purple | `.pill-temple` |
| Shopping | amber-500 | gold-500 | `.pill-shopping` |
| Transit | blue (#2563EB) | light blue | `.pill-transit` |
| Activity | teal (#059669) | light teal | `.pill-activity` |
| Hotel | violet (#8B5CF6) | light violet | `.pill-hotel` |

### Component Classes

```css
/* Cards */
.card                   /* Base card with shadow */
.activity-card          /* Card with left color bar */

/* Buttons */
.btn-primary            /* Coral/Vermillion filled */
.btn-secondary          /* Outlined */
.btn-ghost              /* Text only */

/* Pills/Tags */
.pill                   /* Base pill */
.pill-food, .pill-temple, etc.  /* Category-colored */

/* Shadows */
.shadow-theme-sm/md/lg  /* Mode-aware shadows */
```

### Animation Guidelines
- Duration: 150ms (fast), 250ms (normal), 400ms (slow)
- Easing: ease-out for enter, ease-in for exit
- Respect `prefers-reduced-motion`
- Card press: scale 0.98 for 100ms

### Accessibility
- Min touch target: 44x44pt (`.min-h-touch .min-w-touch`)
- Min body text: 16px
- WCAG 2.1 AA contrast (4.5:1 normal, 3:1 large)
- Never rely on color alone for meaning

## Design Principles

1. **Offline-First** - Core features work with zero connectivity. Test in airplane mode.
2. **Glanceable** - Answer "Where should I be?" in < 3 seconds. No scrolling for critical info.
3. **Stress-Reducing** - Proactive alerts, generous buffers, no anxiety-inducing countdowns.
4. **Better Than Paper** - If PDF is faster, the feature has failed.
5. **Erin Test** - Validate UX against least tech-savvy user.

## Code Conventions

### General

- Use ES modules (import/export)
- Prefer named exports over default exports
- Use early returns to reduce nesting
- Maximum file length: 300 lines

### TypeScript

- Strict mode enabled - no `any` types
- Define interfaces for all props and parameters
- Use `type` for unions, `interface` for object shapes
- Prefer `unknown` over `any`

### React

- Functional components only
- Props interface named `{Component}Props`
- Server Components by default (App Router)
- Client Components marked with `'use client'`

### Data Access

- **NEVER read directly from Supabase in components**
- Always use Dexie.js hooks (useActivities, etc.)
- Supabase is sync layer only, not primary data source

### Git

- Commit after each completed task
- Format: `type(scope): description (task-id)`
- Types: feat, fix, refactor, test, docs, chore
- Example: `feat(dashboard): add NOW widget (2.2.1)`

## Architecture Decisions

Key decisions documented in ADRs:

- **ADR-001**: PWA over native → ADR-001
- **ADR-002**: Offline-first architecture → ADR-002
- **ADR-003**: Next.js 14 with App Router → ADR-003
- **ADR-004**: Google Maps for mapping → ADR-004
- **ADR-007**: Dexie.js + Supabase for data → ADR-007

## Current Focus

See [docs/tasks.md](docs/tasks.md) for current implementation status.

**Current Phase:** Phase 1 (Data Layer & Sync)
**MVP Status:** In Progress

## Session Protocol

### Starting a Session

1. Read this file (CLAUDE.md)
2. Read docs/tasks.md to find next incomplete task
3. State which task you'll work on
4. State your implementation approach
5. Wait for approval before writing code

### During Implementation

1. Work on ONE task at a time
2. Write code following conventions above
3. Run `npm run lint` and `npm run build`
4. If errors occur, fix before continuing
5. Mark task complete in docs/tasks.md immediately

### Completing a Task

1. Ensure build passes
2. Mark task as complete in docs/tasks.md
3. Update Task Log with date and commit hash
4. Commit with descriptive message
5. Stop and report what you did

### If Uncertain

- Ask clarifying questions before implementing
- Reference ADRs for architectural guidance
- When in doubt, prefer simpler solutions
- Check docs/plan.md for phase goals

## Do NOT

- Modify multiple tasks without approval
- Skip linting or type checking
- Make architectural changes not covered by ADRs
- Install new dependencies without discussing first
- Create files outside the defined structure
- Use `any` types in TypeScript
- Read from Supabase directly in components (use Dexie hooks)
- Write code that doesn't match existing patterns

## Environment Variables

Required variables (create .env.local from .env.example):

```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY= # Google Maps API key (Phase 4)
```

Optional variables:

```
NEXT_PUBLIC_WEATHER_API_KEY=     # Weather API key (Phase 2)
```

## Troubleshooting

### PWA not installing on iOS

- Ensure manifest.ts exports valid manifest
- Check apple-mobile-web-app-capable meta tag
- Test in Safari, not Chrome

### Offline mode not working

- Check Service Worker registration in DevTools
- Verify IndexedDB has data
- Test after initial sync completes

### Data not syncing

- Check Supabase real-time connection
- Verify network connectivity
- Check browser console for errors

## Key Constraints

- All users on iOS 16.4+ Safari
- 44x44pt minimum touch targets
- ~50MB total cache size
- Free tier limits: Supabase 500MB/50K req, Google Maps $200 credit
