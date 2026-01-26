# FTC: Nihon - Architecture Decision Records

## Document Information
- **Version:** 1.0
- **Created:** January 25, 2026
- **Last Updated:** January 25, 2026
- **Status:** Approved

---

## ADR Index

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

---

## ADR-001: PWA vs Native App

### Status
**Accepted**

### Context
We need to build a mobile travel companion app for 4 adults (all iPhone 13 Pro+ with latest iOS) traveling to Japan. Timeline is 6 weeks to deployment with iterative testing throughout.

Options considered:
1. **Progressive Web App (PWA)**
2. **Native iOS App (React Native or Swift)**
3. **Hybrid approach (PWA + Native)**

### Decision
**Build a Progressive Web App (PWA)**

### Rationale

| Factor | PWA | Native App |
|--------|-----|------------|
| Development time | 1-2 weeks | 3-5 weeks |
| App Store approval | Not needed | 1-7 days, rejection risk |
| Distribution | Share URL, tap "Add to Home" | TestFlight or App Store |
| Updates | Instant (refresh) | Requires new build + distribution |
| Offline support | Good (Service Worker) | Excellent |
| Push notifications | Supported iOS 16.4+ ✅ | Full support |
| Risk of not being ready | Low | Medium-High |
| Cost | $0 | $99/year Apple Developer |

**Key factors:**
1. **Timeline risk:** 6 weeks is tight for native with App Store uncertainty
2. **All users on iOS 16.4+:** PWA push notifications now supported
3. **Update flexibility:** Can iterate and fix issues instantly
4. **Simpler distribution:** Text a link vs. TestFlight invitation flow
5. **"Erin test":** Simpler installation process

### Consequences
- **Positive:** Faster development, instant updates, no App Store risk
- **Negative:** Slightly less native feel (85% vs 100%), iOS notification setup requires user opt-in
- **Mitigation:** Design for iOS conventions, test notification flow early

### Alternatives Rejected
- **Native app:** Too much timeline risk, complexity for marginal UX gain
- **Hybrid:** Unnecessary complexity, PWA sufficient for requirements

---

## ADR-002: Offline-First Architecture

### Status
**Accepted**

### Context
Users will experience intermittent connectivity in:
- Tokyo subway tunnels
- Rural Hakone mountains  
- Countryside day trip (Ine/Amanohashidate)
- Data conservation scenarios

Core features must work without internet. User's top concern: "It won't work offline when we need it."

### Decision
**Implement offline-first architecture with Service Worker caching**

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   UI Layer  │  │  Service    │  │   IndexedDB     │ │
│  │   (React)   │◄─┤   Worker    │◄─┤   (Local Data)  │ │
│  └─────────────┘  └──────┬──────┘  └─────────────────┘ │
│                          │                              │
│                          ▼                              │
│                   ┌──────────────┐                      │
│                   │   Network    │                      │
│                   │  (Optional)  │                      │
│                   └──────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### Caching Strategy

| Content Type | Strategy | Storage |
|--------------|----------|---------|
| App shell (HTML/CSS/JS) | Cache first | Service Worker Cache |
| Itinerary data | Cache first, background sync | IndexedDB |
| Map tiles | Pre-cached on install | Service Worker Cache |
| Transit data | Pre-calculated, cached | IndexedDB |
| Images/icons | Cache first | Service Worker Cache |
| AI responses | Network only, fallback to pre-cached | IndexedDB (common Q&A) |

### Offline Feature Matrix

| Feature | Offline | Notes |
|---------|---------|-------|
| Dashboard | ✅ Full | All data cached locally |
| Schedule | ✅ Full | Complete itinerary in IndexedDB |
| Maps | ✅ Full | Pre-downloaded tiles for all regions |
| GPS location | ✅ Full | Device capability, no network needed |
| Directions | ✅ Full | Pre-cached routes for all segments |
| Reservations | ✅ Full | Static data, always available |
| AI Assistant | ⚠️ Partial | Pre-cached top 20 Q&A, else "no connection" |
| Live transit | ❌ No | Falls back to pre-calculated times |
| Admin edits | ❌ No | Queued for sync when online |
| Location sharing | ❌ No | Requires real-time sync |

### Pre-Download on Install
When user "installs" PWA to home screen, immediately cache:
1. All app assets
2. Complete itinerary JSON
3. Map tiles for: Tokyo, Hakone, Kyoto, Osaka
4. Pre-calculated transit data
5. Pre-cached AI responses for common questions
6. All images and icons

**Estimated cache size:** 50-100 MB

### Consequences
- **Positive:** Reliable offline experience, user confidence
- **Negative:** Larger initial download, stale data possible if online sync fails
- **Mitigation:** Show "last updated" timestamp, manual refresh button

---

## ADR-003: Frontend Framework Selection

### Status
**Accepted**

### Context
Need a modern frontend framework that supports:
- PWA capabilities
- Offline-first patterns
- Fast development
- Good mobile experience
- Team familiarity (Claude Code implementation)

Options considered:
1. **Next.js (React)**
2. **Nuxt.js (Vue)**
3. **SvelteKit**
4. **Vanilla JS + Web Components**

### Decision
**Use Next.js 14 with App Router**

### Rationale
- **React ecosystem:** Largest ecosystem, most resources
- **Next.js features:** Built-in PWA support, excellent caching, static generation
- **Vercel deployment:** Seamless integration (user has Vercel account)
- **Developer experience:** Fast refresh, good TypeScript support
- **Offline patterns:** Works well with Workbox for Service Worker

### Tech Stack

```
Frontend:
├── Next.js 14 (App Router)
├── React 18
├── TypeScript
├── Tailwind CSS
├── Workbox (Service Worker)
└── Zustand (State management)

Mapping:
├── Mapbox GL JS (or Google Maps JS API)
└── Pre-cached tile sets

Data:
├── IndexedDB (Dexie.js wrapper)
└── JSON files (static itinerary)

AI:
└── Anthropic Claude API (Sonnet)

Deployment:
└── Vercel
```

### Consequences
- **Positive:** Modern stack, great DX, good PWA support, Vercel-optimized
- **Negative:** React complexity (mitigated by simple app structure)

---

## ADR-004: Map Provider Selection

### Status
**Accepted**

### Context
Need maps that:
- Work offline (cached tiles)
- Show GPS location
- Display custom pins
- Provide walking/transit directions
- Stay within budget ($0, using free tier)

Options considered:
1. **Google Maps JavaScript API**
2. **Mapbox GL JS**
3. **Leaflet + OpenStreetMap**

### Decision
**Use Google Maps JavaScript API with offline fallback strategy**

### Rationale

| Factor | Google Maps | Mapbox | Leaflet/OSM |
|--------|-------------|--------|-------------|
| Offline tiles | ❌ Not allowed (ToS) | ✅ Supported | ✅ Supported |
| Japan coverage | Excellent | Good | Good |
| Transit data | Excellent | Limited | None |
| Directions quality | Excellent | Good | Limited |
| Free tier | $200/month | $0-50k loads | Free |
| User familiarity | High | Low | Low |

**Hybrid approach:**
1. **Online:** Google Maps for best experience + live transit
2. **Offline fallback:** Pre-rendered static maps + cached route images

### Offline Strategy
Since Google Maps ToS prohibits tile caching:
1. Pre-generate static map images for key views
2. Cache route overview images for each transit segment
3. Store GPS coordinates for all locations
4. Provide "Open in Google Maps" for full navigation (requires internet)

For truly offline navigation:
- Pre-cached walking directions as text steps
- Compass bearing and distance to destination
- Works without map tiles

### Cost Estimate
Based on PRD usage estimates:
- Maps JavaScript loads: ~1,500 → ~$10.50
- Directions requests: ~300 → ~$1.50
- Places requests: ~100 → ~$1.70
- **Total: ~$14** (well within $200 free tier)

### Consequences
- **Positive:** Best maps quality, familiar to users, excellent transit
- **Negative:** Limited offline maps, dependent on Google
- **Mitigation:** Static fallback images, "Open in Google Maps" for complex nav

---

## ADR-005: AI Integration Strategy

### Status
**Accepted**

### Context
AI assistant should:
- Answer context-aware questions about locations
- Provide etiquette tips
- Suggest nearby alternatives
- Work gracefully when offline
- Stay within ~$5-15 budget for entire trip

### Decision
**Claude Sonnet API with context injection + pre-cached responses**

### Architecture

```
┌────────────────────────────────────────────────────────┐
│                  AI Assistant                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  User Question                                         │
│       │                                                │
│       ▼                                                │
│  ┌─────────────────┐    ┌─────────────────────────┐   │
│  │ Offline Check   │───▶│ Pre-cached Response DB  │   │
│  │ (Match attempt) │    │ (Top 50 Q&A pairs)      │   │
│  └────────┬────────┘    └─────────────────────────┘   │
│           │ No match                                   │
│           ▼                                            │
│  ┌─────────────────┐                                  │
│  │ Online Check    │                                  │
│  └────────┬────────┘                                  │
│           │                                            │
│     ┌─────┴─────┐                                     │
│     │ Online?   │                                     │
│     └─────┬─────┘                                     │
│    Yes    │    No                                     │
│     ▼     │     ▼                                     │
│  ┌────────┴───┐  ┌──────────────────────────────┐    │
│  │ Claude API │  │ "I need internet for that.   │    │
│  │ + Context  │  │  Here's what I know offline" │    │
│  └────────────┘  └──────────────────────────────┘    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### System Prompt Structure

```
You are the FTC: Nihon travel concierge for the Finer Things Club's 
Japan trip (March 6-21, 2026).

CURRENT CONTEXT:
- Date: {current_date}
- Time: {current_time} JST
- Location: {current_activity_location}
- Current activity: {current_activity_name}
- Next activity: {next_activity_name} at {next_activity_time}

TRIP CONTEXT:
- Group: 4 adults (Rich, Matt, Angie, Erin), 3 kids (Ben 12, Emma 9, Livy 11)
- Today's itinerary: {today_summary}
- Accommodation: {current_hotel}

CAPABILITIES:
- Location history, cultural context, etiquette tips
- Nearby restaurant/activity suggestions
- Schedule adjustment advice
- Basic Japanese phrases
- Japan travel practical tips

TONE: Warm, helpful, concise. Like a knowledgeable friend, not a tour guide robot.
```

### Pre-Cached Responses (Offline)
Generate and cache responses for anticipated questions:

1. Temple/shrine history for each visited location
2. Etiquette tips for: onsen, ryokan, temples, restaurants, trains
3. "What to do with extra time" for each neighborhood
4. Common Japanese phrases with context
5. Each day's "what should we skip if late" guidance
6. Restaurant backup recommendations
7. Kid-friendly alternatives for each area

**Storage:** ~50 Q&A pairs in IndexedDB, ~100KB total

### Cost Management
- Use Claude 3.5 Sonnet (best quality/cost ratio)
- Limit context window to essential info (~2,500 input tokens)
- Average response: ~400 output tokens
- Estimated: 300-600 queries × $0.018 = **$5-11 total**

### Consequences
- **Positive:** High-quality contextual responses, graceful offline fallback
- **Negative:** Requires internet for novel questions
- **Mitigation:** Comprehensive pre-cached Q&A covers 80% of use cases

---

## ADR-006: Notification Strategy

### Status
**Accepted**

### Context
Need to deliver proactive reminders:
- Morning briefings
- Departure reminders
- Hard deadline alerts
- Pre-trip reminders
- Weather alerts

All users on iPhone 13 Pro+ with iOS 16.4+ (PWA push supported).

Original plan included Telegram bot, but user prefers consolidated approach + already uses WhatsApp with group and guide (Mico).

### Decision
**PWA Push Notifications (no separate messaging bot)**

### Rationale
- iOS 16.4+ supports PWA push notifications ✅
- Eliminates need for separate Telegram app
- Keeps all trip info in one place
- WhatsApp remains for human coordination (group + Mico)
- Simpler architecture, fewer failure points

### Implementation

```
┌─────────────────────────────────────────────────────────┐
│              Notification System                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐      ┌─────────────────────────┐  │
│  │  Notification   │      │  Push Service           │  │
│  │  Scheduler      │─────▶│  (Web Push Protocol)    │  │
│  │  (Server)       │      │                         │  │
│  └─────────────────┘      └───────────┬─────────────┘  │
│                                       │                 │
│                                       ▼                 │
│                           ┌─────────────────────────┐  │
│                           │  Service Worker         │  │
│                           │  (On Device)            │  │
│                           └───────────┬─────────────┘  │
│                                       │                 │
│                                       ▼                 │
│                           ┌─────────────────────────┐  │
│                           │  iOS Notification       │  │
│                           │  (Lock screen, banner)  │  │
│                           └─────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Notification Types & Timing

| Type | Trigger | Time |
|------|---------|------|
| Morning briefing | Scheduled | 8:00 AM JST daily |
| Departure reminder | Time-based | 30 min before "leave by" |
| Hard deadline alert | Time-based | 60 min before deadline |
| Don't forget | Scheduled | As configured per item |
| Pre-trip | Scheduled | Day before important dates |
| Weather alert | API trigger | Morning if rain expected |

### User Opt-In Flow
1. First app launch: Explain value of notifications
2. Show iOS permission prompt
3. If denied: Provide in-app alternative (badge on home, banner in app)
4. Settings page to manage preferences

### Fallback for Notification Issues
- In-app notification center (viewable anytime)
- Badge indicator on app icon
- Alert banner on dashboard
- Manual "check reminders" function

### Consequences
- **Positive:** Single app for all trip needs, simpler architecture
- **Negative:** Depends on iOS PWA push working reliably
- **Mitigation:** Test extensively on all 4 devices before trip; in-app fallback

---

## ADR-007: Data Storage & Sync

### Status
**Accepted**

### Context
Need to store:
- Complete itinerary (15 days, ~100 activities)
- Accommodation details (4 properties)
- Restaurant data (~30 restaurants)
- Transit calculations (~50 segments)
- User preferences
- Admin edits (Rich only)

Must support offline-first with sync when online.

Options considered:
1. **IndexedDB + Vercel KV** - Simple key-value sync
2. **IndexedDB + Supabase** - PostgreSQL with real-time subscriptions

### Decision
**IndexedDB (via Dexie.js) for offline storage + Supabase for sync layer**

### Rationale for Supabase over Vercel KV

| Factor | Vercel KV | Supabase |
|--------|-----------|----------|
| Real-time sync | Manual polling | Built-in subscriptions ✅ |
| Admin auth | DIY password | Built-in Auth ✅ |
| Team familiarity | New | Known ✅ |
| Data querying | Simple get/set | Full SQL ✅ |
| Debugging | Limited | Dashboard UI ✅ |
| Future trips | Manual migration | Multi-trip ready ✅ |

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Client (PWA)                        │ │
│  │  ┌─────────────┐    ┌─────────────┐    ┌────────────┐ │ │
│  │  │   Dexie.js  │◄──▶│   Zustand   │◄──▶│   React    │ │ │
│  │  │ (IndexedDB) │    │   (State)   │    │    UI      │ │ │
│  │  │ ─────────── │    └─────────────┘    └────────────┘ │ │
│  │  │  PRIMARY    │                                       │ │
│  │  │  DATA       │  App ALWAYS reads from IndexedDB     │ │
│  │  │  SOURCE     │  Offline works 100%                   │ │
│  │  └──────┬──────┘                                       │ │
│  │         │                                              │ │
│  │         │ Sync when online (background)               │ │
│  │         ▼                                              │ │
│  └─────────┼──────────────────────────────────────────────┘ │
│            │                                                 │
│            ▼                                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Supabase                            │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │ │
│  │  │ PostgreSQL  │  │  Real-time  │  │     Auth      │  │ │
│  │  │   (Data)    │  │   (Sync)    │  │   (Admin)     │  │ │
│  │  │             │  │             │  │               │  │ │
│  │  │ Source of   │  │ Pushes      │  │ Rich's admin  │  │ │
│  │  │ truth for   │  │ changes to  │  │ access        │  │ │
│  │  │ sync        │  │ all devices │  │               │  │ │
│  │  └─────────────┘  └─────────────┘  └───────────────┘  │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Offline-First Principle

> **The app treats the network as an enhancement, not a requirement.**

- IndexedDB is the PRIMARY data source - app always reads from here
- Supabase is the SYNC layer - only used when online
- No signal? App works fully from IndexedDB
- Have signal? Sync happens in background

### Data Flow

**Initial Install (requires internet once):**
```
Supabase ──── full data download ────▶ IndexedDB
```

**Normal Usage (offline works!):**
```
User opens app ────▶ IndexedDB ────▶ UI renders
                     (on device)     No internet needed!
```

**Admin Edit (requires internet for Rich):**
```
Rich edits ──▶ IndexedDB ──▶ Supabase ──▶ Real-time push ──▶ Other devices
```

**Others Offline During Edit:**
```
Rich edits ──▶ Supabase stores change
                    ... later ...
Other device gets signal ──▶ Supabase syncs ──▶ IndexedDB updated
```

### Supabase Database Schema

```sql
-- ============================================
-- FTC: Nihon - Supabase Schema
-- ============================================

-- Activities (main itinerary)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INT,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'temple', 'shopping', 'transit', 'activity', 'hotel')),
  location_name TEXT,
  location_address TEXT,
  location_address_jp TEXT,
  location_lat DECIMAL(10, 7),
  location_lng DECIMAL(10, 7),
  google_maps_url TEXT,
  website_url TEXT,
  description TEXT,
  tips TEXT,
  what_to_order TEXT,
  backup_alternative TEXT,
  is_hard_deadline BOOLEAN DEFAULT FALSE,
  is_kid_friendly BOOLEAN DEFAULT TRUE,
  sort_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transit segments (pre-calculated directions)
CREATE TABLE transit_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  leave_by TIME NOT NULL,
  walk_to_station_minutes INT,
  station_name TEXT,
  train_line TEXT,
  suggested_departure TIME,
  travel_minutes INT,
  transfers TEXT,
  arrival_station TEXT,
  walk_to_destination_minutes INT,
  buffer_minutes INT DEFAULT 10,
  steps JSONB, -- Detailed step-by-step instructions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accommodations
CREATE TABLE accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  address_jp TEXT,
  check_in_time TIME,
  check_out_time TIME,
  confirmation_number TEXT,
  pin_code TEXT,
  phone TEXT,
  google_maps_url TEXT,
  instructions TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  sort_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurants (recommendations beyond itinerary)
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  google_maps_url TEXT,
  website_url TEXT,
  what_to_order TEXT,
  backup_alternative TEXT,
  is_kid_friendly BOOLEAN DEFAULT TRUE,
  day_number INT,
  meal TEXT CHECK (meal IN ('breakfast', 'lunch', 'dinner', 'snack')),
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin alerts (Rich can post announcements)
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'urgent')),
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Location sharing (optional group coordination)
CREATE TABLE location_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-cached AI responses (for offline)
CREATE TABLE ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_pattern TEXT NOT NULL,
  context_type TEXT, -- 'location', 'etiquette', 'schedule', 'phrase', etc.
  context_key TEXT,  -- e.g., 'sensoji', 'ryokan', 'day-05'
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist items (pre-trip and during trip)
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  due_time TIME,
  is_completed BOOLEAN DEFAULT FALSE,
  is_pre_trip BOOLEAN DEFAULT TRUE,
  sort_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_activities_day ON activities(day_number);
CREATE INDEX idx_activities_date ON activities(date);
CREATE INDEX idx_transit_activity ON transit_segments(activity_id);
CREATE INDEX idx_restaurants_day ON restaurants(day_number);
CREATE INDEX idx_alerts_active ON alerts(active) WHERE active = TRUE;
CREATE INDEX idx_checklist_due ON checklist_items(due_date);

-- ============================================
-- Enable Real-time subscriptions
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE location_shares;
ALTER PUBLICATION supabase_realtime ADD TABLE checklist_items;

-- ============================================
-- Row Level Security (RLS)
-- ============================================
-- For this app, all data is readable by anyone with app access
-- Only admin can write (enforced by app logic + Supabase Auth)

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE transit_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Read access for all authenticated users
CREATE POLICY "Allow read access" ON activities FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON transit_segments FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON accommodations FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON alerts FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON location_shares FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON ai_cache FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON checklist_items FOR SELECT USING (true);

-- Write access controlled via service role key (admin panel only)
-- App uses service role for admin operations after auth check

-- ============================================
-- Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON transit_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON accommodations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Client-Side Schema (Dexie.js / IndexedDB)

```typescript
// db.ts - Dexie database definition
import Dexie, { Table } from 'dexie';

export interface Activity {
  id: string;
  dayNumber: number;
  date: string;
  startTime: string;
  durationMinutes?: number;
  name: string;
  category: 'food' | 'temple' | 'shopping' | 'transit' | 'activity' | 'hotel';
  locationName?: string;
  locationAddress?: string;
  locationAddressJp?: string;
  locationLat?: number;
  locationLng?: number;
  googleMapsUrl?: string;
  websiteUrl?: string;
  description?: string;
  tips?: string;
  whatToOrder?: string;
  backupAlternative?: string;
  isHardDeadline: boolean;
  isKidFriendly: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface TransitSegment {
  id: string;
  activityId: string;
  leaveBy: string;
  walkToStationMinutes?: number;
  stationName?: string;
  trainLine?: string;
  suggestedDeparture?: string;
  travelMinutes?: number;
  transfers?: string;
  arrivalStation?: string;
  walkToDestinationMinutes?: number;
  bufferMinutes: number;
  steps?: TransitStep[];
  updatedAt: string;
}

export interface TransitStep {
  type: 'walk' | 'train' | 'transfer';
  instruction: string;
  duration: number;
  departure?: string;
}

export interface Accommodation {
  id: string;
  name: string;
  address: string;
  addressJp?: string;
  checkInTime?: string;
  checkOutTime?: string;
  confirmationNumber?: string;
  pinCode?: string;
  phone?: string;
  googleMapsUrl?: string;
  instructions?: string;
  startDate: string;
  endDate: string;
  sortOrder: number;
}

export interface Restaurant {
  id: string;
  name: string;
  address?: string;
  googleMapsUrl?: string;
  websiteUrl?: string;
  whatToOrder?: string;
  backupAlternative?: string;
  isKidFriendly: boolean;
  dayNumber?: number;
  meal?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  city?: string;
}

export interface Alert {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  active: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface LocationShare {
  id: string;
  userName: string;
  lat: number;
  lng: number;
  updatedAt: string;
}

export interface AiCache {
  id: string;
  questionPattern: string;
  contextType?: string;
  contextKey?: string;
  response: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  isCompleted: boolean;
  isPreTrip: boolean;
  sortOrder?: number;
}

export interface SyncMeta {
  id: string;
  tableName: string;
  lastSyncedAt: string;
}

class FtcNihonDB extends Dexie {
  activities!: Table<Activity>;
  transitSegments!: Table<TransitSegment>;
  accommodations!: Table<Accommodation>;
  restaurants!: Table<Restaurant>;
  alerts!: Table<Alert>;
  locationShares!: Table<LocationShare>;
  aiCache!: Table<AiCache>;
  checklistItems!: Table<ChecklistItem>;
  syncMeta!: Table<SyncMeta>;

  constructor() {
    super('ftc-nihon');
    this.version(1).stores({
      activities: 'id, dayNumber, date, category, sortOrder',
      transitSegments: 'id, activityId',
      accommodations: 'id, startDate, endDate, sortOrder',
      restaurants: 'id, dayNumber, meal, city',
      alerts: 'id, active, createdAt',
      locationShares: 'id, userName, updatedAt',
      aiCache: 'id, questionPattern, contextType, contextKey',
      checklistItems: 'id, dueDate, isCompleted, isPreTrip, sortOrder',
      syncMeta: 'id, tableName'
    });
  }
}

export const db = new FtcNihonDB();
```

### Sync Strategy

1. **Initial load:** Download complete data set on first visit
2. **Real-time sync:** Supabase subscriptions push changes instantly
3. **Background sync:** Check for updates when app becomes active
4. **Admin edit flow:**
   - Write to IndexedDB immediately (optimistic UI)
   - Push to Supabase
   - On success: other clients receive via real-time
   - On failure: revert IndexedDB, show error
5. **Offline queue:** Admin edits while offline queued in IndexedDB, synced when online

### Storage Estimates

| Data | Size |
|------|------|
| Itinerary (15 days) | ~50 KB |
| Transit segments | ~30 KB |
| Accommodations | ~5 KB |
| Restaurants | ~20 KB |
| Pre-cached AI responses | ~100 KB |
| Map tiles (4 regions) | ~50 MB |
| **Total** | **~50 MB** |

### Supabase Free Tier Limits

| Resource | Limit | Our Usage | Status |
|----------|-------|-----------|--------|
| Database size | 500 MB | ~1 MB | ✅ |
| API requests | 50K/month | ~5K | ✅ |
| Real-time connections | 200 concurrent | 4 | ✅ |
| Auth users | Unlimited | 1 (Rich admin) | ✅ |

### Consequences
- **Positive:** Real-time sync, proper auth, familiar to team, great debugging
- **Negative:** Additional service dependency (mitigated by offline-first design)
- **Mitigation:** App fully functional from IndexedDB; Supabase is enhancement only

---

## ADR-008: Hosting & Deployment

### Status
**Accepted**

### Context
Need reliable hosting that:
- Supports Next.js
- Handles PWA requirements
- Enables easy updates
- Stays within budget ($0-20/month)
- Provides good global performance (users in USA, app used in Japan)

### Decision
**Vercel (user's existing account)**

### Rationale
- **Next.js native:** Vercel built Next.js, optimal integration
- **Edge network:** Fast globally, including Japan
- **Free tier:** Sufficient for this app's traffic
- **Easy deploys:** Git push = deployed
- **PWA support:** Works out of the box
- **User has account:** No setup needed

### Deployment Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│   Vercel    │────▶│  Production │
│   (main)    │     │   Build     │     │   (Edge)    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       │ Push to main                          │ Instant deploy
       │                                       │
┌──────┴──────┐                        ┌──────┴──────┐
│  Developer  │                        │    Users    │
│  (Rich)     │                        │ (4 adults)  │
└─────────────┘                        └─────────────┘
```

### Environment Configuration

| Environment | URL | Purpose |
|-------------|-----|---------|
| Production | ftc-nihon.vercel.app | Live app |
| Preview | ftc-nihon-[branch].vercel.app | Testing branches |
| Local | localhost:3000 | Development |

### Vercel KV (for sync/admin)
- Free tier: 30K requests/month, 256MB storage
- More than sufficient for 4 users over 15 days
- Stores: admin edits, location shares, notification state

### Consequences
- **Positive:** Zero-config deployment, excellent performance, free
- **Negative:** Vendor lock-in (acceptable for this project)

---

## ADR-009: Transit Data Strategy

### Status
**Accepted**

### Context
User's key requirement: "Suggested times to leave hotel to get to station based on train schedules."

Need to provide:
- Pre-calculated "leave by" times
- Specific train departure times
- Travel duration estimates
- Walking times
- All working offline

### Decision
**Pre-calculated transit data with optional live recalculation**

### Approach

**Phase 1: Pre-calculation (Before Trip)**
1. Research actual train schedules for each route
2. Calculate optimal departure times based on itinerary
3. Build in 10-minute buffer for each segment
4. Store as static data in app

**Phase 2: Live Recalculation (Optional, Online)**
- "Recalculate" button queries Google Directions API
- Updates times based on current conditions
- Useful if running ahead/behind schedule

### Data Sources for Pre-Calculation
1. **Google Maps Directions API** - For accurate baseline
2. **Hyperdia / Jorudan** - Japan-specific train schedules
3. **Manual verification** - Spot-check critical segments

### Transit Segment Format

```json
{
  "from": "& Here Shinjuku Hotel",
  "to": "Senso-ji Temple",
  "leaveBy": "08:35",
  "steps": [
    {
      "type": "walk",
      "instruction": "Walk to Shinjuku Station (East Exit)",
      "duration": 14
    },
    {
      "type": "train",
      "instruction": "JR Chuo Line to Kanda",
      "departure": "08:52",
      "duration": 12
    },
    {
      "type": "transfer",
      "instruction": "Transfer to Tokyo Metro Ginza Line",
      "duration": 5
    },
    {
      "type": "train", 
      "instruction": "Ginza Line to Asakusa",
      "duration": 18
    },
    {
      "type": "walk",
      "instruction": "Walk to Senso-ji Temple",
      "duration": 3
    }
  ],
  "totalDuration": 52,
  "buffer": 10,
  "arriveBy": "09:30"
}
```

### Display Format

```
🚶 Leave hotel by: 8:35 AM
   ↓ 14 min walk to Shinjuku Station (East Exit)

🚃 Catch: 8:52 AM train
   JR Chuo Line → Kanda (12 min)
   ↓ Transfer to Ginza Line (5 min)
   Ginza Line → Asakusa (18 min)

📍 Arrive Asakusa: 9:27 AM
   ↓ 3 min walk to temple

✅ Buffer: 10 min cushion built in
```

### Consequences
- **Positive:** Reliable offline, specific actionable times
- **Negative:** Labor-intensive to calculate, static data may drift from reality
- **Mitigation:** Build generous buffers, provide recalculate option

---

## ADR-010: Admin Panel Architecture

### Status
**Accepted**

### Context
Rich (power user/admin) needs to make on-the-fly edits during the trip without:
- Code changes
- Git commits
- Laptop access

Must work from iPhone during travel.

### Decision
**In-app admin panel with Supabase Auth**

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Panel                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐                                   │
│  │  Supabase Auth  │  Magic link or password login     │
│  │  (Rich only)    │  Session persisted                │
│  └────────┬────────┘                                   │
│           │                                             │
│           ▼                                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Admin Dashboard                     │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │   │
│  │  │Edit Day │ │Add/Del  │ │ Alerts  │           │   │
│  │  │Schedule │ │Activity │ │& Notes  │           │   │
│  │  └─────────┘ └─────────┘ └─────────┘           │   │
│  │                                                  │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │   │
│  │  │Edit     │ │Edit     │ │Checklist│           │   │
│  │  │Restaurnt│ │Transit  │ │ Items   │           │   │
│  │  └─────────┘ └─────────┘ └─────────┘           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Features

| Feature | Description |
|---------|-------------|
| Edit activity time | Change start time for any activity |
| Edit activity details | Modify name, description, tips, links |
| Add activity | Insert new activity into any day |
| Remove activity | Delete activity from schedule |
| Add alert | Create banner visible to all users |
| Edit restaurant | Update recommendations, add new ones |
| Edit transit | Adjust "leave by" times if needed |
| Manage checklist | Mark items complete, add new items |

### Authentication with Supabase

**Setup:**
1. Create Rich's account in Supabase Auth
2. Use magic link (email) or password
3. Store session in localStorage
4. Check auth state on admin route access

**Flow:**
```
Rich taps "Admin" in settings
          │
          ▼
┌─────────────────────┐
│  Logged in?         │
└──────────┬──────────┘
     No    │    Yes
     ▼     │     ▼
┌──────────┴───┐  ┌──────────────────┐
│ Login screen │  │ Admin dashboard  │
│ (magic link) │  │                  │
└──────────────┘  └──────────────────┘
```

**Supabase Auth Benefits:**
- Secure session management
- Magic link = no password to remember
- Can add Matt as admin later (one line change)
- Proper logout/session expiry

### Real-Time Sync

When Rich makes an edit:
```
1. Update local IndexedDB (instant UI feedback)
2. Push to Supabase
3. Supabase real-time broadcasts to other devices
4. Other devices' IndexedDB updated automatically
5. UI reflects changes within seconds
```

### UI Requirements
- Mobile-first (iPhone optimized)
- Large tap targets (44x44 points minimum)
- Simple forms with smart defaults
- Confirmation before destructive actions
- Success/error toast feedback
- Offline indicator (edits queued)

### Offline Admin Edits
1. Rich makes edit while offline
2. Change saved to IndexedDB with `pendingSync: true`
3. UI shows "pending sync" indicator
4. When online: auto-push to Supabase
5. Confirmation shown when synced

### Consequences
- **Positive:** Secure auth, real-time sync, extendable to multiple admins
- **Negative:** Requires Supabase account setup for Rich
- **Mitigation:** Magic link auth is very simple; one-time setup

---

## Summary: Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    FTC: Nihon Tech Stack                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FRONTEND                                                   │
│  ├── Next.js 14 (App Router)                               │
│  ├── React 18                                               │
│  ├── TypeScript                                             │
│  ├── Tailwind CSS                                           │
│  ├── Zustand (state)                                        │
│  └── Workbox (PWA/offline)                                  │
│                                                             │
│  DATA                                                       │
│  ├── IndexedDB via Dexie.js (client - PRIMARY SOURCE)      │
│  └── Supabase (server - sync layer)                        │
│      ├── PostgreSQL (data storage)                         │
│      ├── Real-time (live sync)                             │
│      └── Auth (admin access)                               │
│                                                             │
│  MAPS                                                       │
│  └── Google Maps JavaScript API                             │
│                                                             │
│  AI                                                         │
│  └── Anthropic Claude API (Sonnet)                         │
│                                                             │
│  HOSTING                                                    │
│  └── Vercel (Edge Network)                                 │
│                                                             │
│  NOTIFICATIONS                                              │
│  └── Web Push (PWA native)                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Cost Summary

| Service | Free Tier | Our Usage | Cost |
|---------|-----------|-----------|------|
| Vercel | Generous | Low | $0 |
| Supabase | 500MB, 50K req | ~1MB, ~5K req | $0 |
| Anthropic API | Pay-per-use | ~400 queries | $5-15 |
| Google Maps API | $200/month credit | ~$14 usage | $0 |
| **Total** | | | **$5-15** |

---

*End of ADRs*
