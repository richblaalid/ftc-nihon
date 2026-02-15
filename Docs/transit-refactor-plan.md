# Transit Data Refactor Plan

## Problem Statement

Currently, transit information is duplicated across two data structures:
1. **Activity records** with `category: 'transit'` (32 items) - displayed as ActivityCard
2. **TransitSegment records** (23 items) - displayed as TransitCard

This creates visual duplication in the timeline where both cards appear for the same travel segment.

### Current State Example (Day 3 - Ghibli)

```
┌─────────────────────────────────────────┐
│ 🚃 ActivityCard: "Transit to Ghibli"   │  ← Activity (category='transit')
│    08:15 • 45min • Shinjuku → Kichijoji │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 🚃 TransitCard: Shinjuku → Kichijoji    │  ← TransitSegment
│    Leave by 8:15 AM • JR Chuo Line      │
│    [Expandable details...]              │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 🎬 ActivityCard: "Ghibli Museum"        │  ← Destination activity
│    09:00 • 180min                       │
└─────────────────────────────────────────┘
```

### Desired State

```
┌─────────────────────────────────────────┐
│ 🚃 TransitCard: "Transit to Ghibli"     │  ← Enhanced TransitCard only
│    Leave by 8:15 AM • 45min total       │
│    JR Chuo Line to Mitaka               │
│    [📍 View on Map] [💬 Travel Phrases] │
│    [Expandable details...]              │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 🎬 ActivityCard: "Ghibli Museum"        │  ← Destination activity
│    09:00 • 180min                       │
└─────────────────────────────────────────┘
```

---

## Data Analysis

### Transit Activities WITH TransitSegments (23)
These should be merged - TransitCard absorbs the Activity title and removes the ActivityCard.

| Day | Activity Name | TransitSegment Links To |
|-----|---------------|------------------------|
| 3 | Transit to Ghibli Museum | day3-ghibli |
| 3 | Train to Harajuku | day3-harajuku |
| 4 | Train to Tsukiji | day4-tsukiji |
| 4 | Train to Akihabara | day4-akihabara |
| ... | (20 more) | ... |

### Transit Activities WITHOUT TransitSegments (14)
These need different handling strategies.

| Day | Activity Name | Category | Proposed Handling |
|-----|---------------|----------|-------------------|
| 1 | Arrive Tokyo Haneda | arrival | Keep as Activity (timeline marker) |
| 1 | Airport Limousine Bus to Shinjuku | complex_transit | Create TransitSegment OR simplified card |
| 5 | Walk through Azabudai Hills | walk | Convert to walk indicator |
| 7 | Ropeway to Owakudani | hakone_pass | Simplified TransitCard with pass badge |
| 7 | Ropeway/Cable Car to Gora | hakone_pass | Simplified TransitCard with pass badge |
| 7 | Walk to Open-Air Museum | walk | Convert to walk indicator |
| 7 | Bus to Lake Area | hakone_pass | Simplified TransitCard with pass badge |
| 7 | Return to Ryokan | hakone_pass | Simplified TransitCard with pass badge |
| 8 | Walk to Fujinoma Machiya House | walk | Convert to walk indicator |
| 14 | 🦌 DEER ALARM - Start Walking! | fun_reminder | Keep as Activity (unique/fun) |
| 15 | Buffer at Shin-Osaka | buffer | Keep as Activity (buffer time) |
| 15 | Arrive Shinagawa | arrival | Keep as Activity (timeline marker) |
| 15 | At Gate / Pre-Boarding | buffer | Keep as Activity (buffer time) |
| 15 | Flight DL0120 Home | flight | Use FlightCard component |

---

## Implementation Plan

### Phase 1: Enhance TransitCard Component

#### 1.1 Add Title Display
- Add optional `title` prop to TransitCard
- Display title prominently when provided
- Fall back to "Transit to [arrivalStation]" if no title

#### 1.2 Add Quick Action Links
- "View on Map" link → Opens Google Maps with route
- "Travel Phrases" link → Links to `/phrases#travel` section

#### 1.3 Update TransitSegment Type
```typescript
interface TransitSegment {
  // Existing fields...

  // New fields
  title?: string;           // Activity name to display
  activityStartTime?: string; // For timeline positioning
}
```

### Phase 2: Update Timeline Rendering

#### 2.1 Modify Timeline.tsx Logic
Current flow:
1. Render ActivityCard for transit activity
2. Render TransitCard before destination activity

New flow:
1. Skip ActivityCard if activity has linked TransitSegment
2. Inject activity title into TransitCard
3. Render enhanced TransitCard only

#### 2.2 Handle Different Transit Types

```typescript
type TransitRenderType =
  | 'full'       // Has TransitSegment - render enhanced TransitCard
  | 'simplified' // Hakone pass transits - render simplified TransitCard
  | 'walk'       // Short walks - render walk indicator
  | 'keep'       // Arrivals/buffers - render as ActivityCard
  | 'flight';    // Flights - render FlightCard
```

### Phase 3: Data Migration

#### 3.1 Update seed-data.ts
- Add `title` field to existing TransitSegments from linked activities
- Create simplified TransitSegments for Hakone pass transits
- Mark walk activities with `transitType: 'walk'`
- Mark buffer/arrival activities with `transitType: 'keep'`

#### 3.2 Update Database Schema
- Add `title` column to transit_segments table
- Add `transit_type` column to activities table (optional, could use tags)

### Phase 4: Create Simplified TransitCard Variant

For Hakone Free Pass transits that don't need full routing:

```typescript
interface SimplifiedTransitProps {
  title: string;
  duration: number;
  mode: 'ropeway' | 'cable_car' | 'bus' | 'walk';
  coveredByPass?: string;
  startTime: string;
}
```

Renders as:
```
┌─────────────────────────────────────────┐
│ 🚠 Ropeway to Owakudani                 │
│    30min • ✓ Hakone Free Pass           │
└─────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/database.ts` | Add title, transitType to types |
| `src/components/schedule/TransitCard.tsx` | Add title display, quick action links |
| `src/components/schedule/SimplifiedTransitCard.tsx` | New component for pass transits |
| `src/components/schedule/WalkIndicator.tsx` | New component for walks |
| `src/components/schedule/Timeline.tsx` | Update rendering logic |
| `src/db/seed-data.ts` | Add titles to TransitSegments, mark transit types |
| `supabase/migrations/xxx_transit_title.sql` | Schema updates |

---

## Migration Steps

1. [ ] Create new components (SimplifiedTransitCard, WalkIndicator)
2. [ ] Update TransitCard with title and action links
3. [ ] Update TransitSegment type with title field
4. [ ] Update seed-data.ts with titles and transit types
5. [ ] Update Timeline.tsx rendering logic
6. [ ] Test all 16 days for correct rendering
7. [ ] Create database migration
8. [ ] Update Supabase sync logic

---

## Rollback Plan

If issues arise:
1. Revert Timeline.tsx to render both cards
2. Keep existing Activity records unchanged
3. New TransitCard props are optional - graceful degradation

---

## Success Criteria

- [ ] No visual duplication of transit information
- [ ] TransitCard shows descriptive title (e.g., "Transit to Ghibli Museum")
- [ ] Quick links to Map and Phrases work correctly
- [ ] Hakone pass transits render with simplified card
- [ ] Walks show as minimal indicators
- [ ] Timeline maintains correct chronological order
- [ ] All existing functionality preserved
