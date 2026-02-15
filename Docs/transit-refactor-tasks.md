# Transit Refactor Tasks

Related plan: [transit-refactor-plan.md](./transit-refactor-plan.md)

---

## Phase 1: Enhance TransitCard Component ✓

- [x] **1.1** Add `title` prop to TransitCard component ✓ 2026-02-15
  - Files: `src/components/schedule/TransitCard.tsx`
  - Display title prominently above route info when provided

- [x] **1.2** Add "View on Map" quick action link ✓ 2026-02-15
  - Files: `src/components/schedule/TransitCard.tsx`
  - Use existing `googleMapsUrl` prop
  - Show as inline link in collapsed view (not just expanded)

- [x] **1.3** Add "Travel Phrases" quick action link ✓ 2026-02-15
  - Files: `src/components/schedule/TransitCard.tsx`
  - Link to `/phrases#travel` section
  - Icon: speech bubble SVG

---

## Phase 2: Create Supporting Components ✓

- [x] **2.1** Create `SimplifiedTransitCard` component ✓ 2026-02-15
  - Files: `src/components/schedule/SimplifiedTransitCard.tsx`
  - Props: title, duration, mode, coveredByPass, startTime, isCompleted
  - Modes: ropeway, cable_car, bus, walk, pirate_ship
  - Compact design for scenic transit

- [x] **2.2** Create `WalkIndicator` component ✓ 2026-02-15
  - Files: `src/components/schedule/WalkIndicator.tsx`
  - Minimal design: 🚶 Walk to [destination] (Xmin)
  - Used for activities with transitRenderType='walk'

---

## Phase 3: Update Data Layer ✓

- [x] **3.1** Add `title` field to TransitSegment type ✓ 2026-02-15
  - Files: `src/types/database.ts`
  - Optional string field

- [x] **3.2** Add `transitRenderType` field to Activity type ✓ 2026-02-15
  - Files: `src/types/database.ts`
  - Enum: 'full' | 'simplified' | 'walk' | 'keep' | 'flight' | null

- [x] **3.3** Update seed-data.ts - Add titles to TransitSegments ✓ 2026-02-15
  - Files: `src/db/seed-data.ts`
  - Added title field to all 23 TransitSegments from linked Activity names

- [x] **3.4** Update seed-data.ts - Mark transit type on Activities ✓ 2026-02-15
  - Files: `src/db/seed-data.ts`
  - Added transitRenderType to all 32 transit activities
  - Mapped each to appropriate render type (full, simplified, walk, keep, flight)

---

## Phase 4: Update Timeline Rendering ✓

- [x] **4.1** Update Timeline.tsx to skip duplicate Activity cards ✓ 2026-02-15
  - Files: `src/components/schedule/Timeline.tsx`
  - Activities with transitRenderType='full' now render as TransitCard (no ActivityCard)

- [x] **4.2** Update Timeline.tsx to render SimplifiedTransitCard ✓ 2026-02-15
  - Files: `src/components/schedule/Timeline.tsx`
  - Activities with transitRenderType='simplified' render SimplifiedTransitCard
  - Auto-detects mode from activity name (ropeway, cable_car, pirate_ship, bus, walk)

- [x] **4.3** Update Timeline.tsx to render WalkIndicator ✓ 2026-02-15
  - Files: `src/components/schedule/Timeline.tsx`
  - Activities with transitRenderType='walk' render WalkIndicator

- [x] **4.4** Pass title from Activity to TransitCard ✓ 2026-02-15
  - Files: `src/components/schedule/Timeline.tsx`
  - TransitCard now receives activity name as title prop

---

## Phase 5: Database Migration

- [ ] **5.1** Create migration for transit_segments.title column
  - Files: `supabase/migrations/xxx_add_transit_title.sql`
  - ALTER TABLE transit_segments ADD COLUMN title TEXT;
  - Estimated: 5 min

- [ ] **5.2** Create migration for activities.transit_render_type column
  - Files: `supabase/migrations/xxx_add_transit_render_type.sql`
  - ALTER TABLE activities ADD COLUMN transit_render_type TEXT;
  - Estimated: 5 min

- [ ] **5.3** Update Dexie schema version
  - Files: `src/db/database.ts`
  - Add new fields to schema
  - Estimated: 10 min

---

## Phase 6: Testing & Verification

- [ ] **6.1** Test Day 3 (Ghibli) timeline rendering
  - Verify no duplicate cards
  - Verify TransitCard shows title
  - Estimated: 10 min

- [ ] **6.2** Test Day 7 (Hakone) simplified cards
  - Verify ropeway/cable car render correctly
  - Verify Hakone Free Pass badge shows
  - Estimated: 10 min

- [ ] **6.3** Test Day 15 (Departure) mixed rendering
  - Verify buffer activities stay as Activity cards
  - Verify flight uses FlightCard
  - Estimated: 10 min

- [ ] **6.4** Full 16-day visual regression test
  - Review all days for correct transit rendering
  - Estimated: 30 min

---

## Total Estimated Time: ~4 hours

### Priority Order
1. Phase 1 (TransitCard enhancements) - Quick wins
2. Phase 3 (Data layer) - Foundation for rendering changes
3. Phase 4 (Timeline rendering) - Core logic change
4. Phase 2 (Supporting components) - As needed
5. Phase 5 (Database migration) - After local testing
6. Phase 6 (Testing) - Throughout
