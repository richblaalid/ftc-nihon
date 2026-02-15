# Transit Enhancement Plan

> Leveraging verified transit data from `Docs/japan trip details/transit-segments-verified.ts`

## Current State

The app currently has:
- **TransitSegment type** in `src/types/database.ts` - basic transit info linked to activities
- **Transit seed data** in `src/db/seed-data.ts` - manually created transit segments
- **TransitCard component** - newly implemented, shows transit info before activities

## Verified Data Assets

The `transit-segments-verified.ts` file contains **41 verified transit segments** with:

| Feature | Current Seed Data | Verified Data |
|---------|------------------|---------------|
| Google Maps URLs | ❌ None | ✅ Deep links for every segment |
| Train line colors | ❌ None | ✅ Hex colors (#F15A22 for JR Chuo, etc.) |
| Platform info | ❌ None | ✅ "Platforms 7-8", "A1 Exit" |
| Exit info | ❌ Basic | ✅ "Exit 1 → Kaminarimon Gate" |
| Cost tracking | ❌ None | ✅ ¥ amounts per segment |
| Pass coverage | ❌ None | ✅ "Hakone Free Pass", "IC Card" |
| Family tips | ❌ None | ✅ Kid-specific advice |
| Hard deadlines | ❌ Basic | ✅ Explicit flags |
| Coordinates | ❌ None | ✅ Origin + destination lat/lng |
| Japanese names | ❌ Partial | ✅ Complete with kanji |

## Integration Strategy

### Option A: Replace Current Transit Seed Data (Recommended)
Replace `transitSegments` in `seed-data.ts` with data migrated from the verified file.

**Pros:**
- Single source of truth
- Cleaner codebase
- Easier maintenance

**Cons:**
- Need to map verified segments to existing activity IDs
- One-time migration effort

### Option B: Create Separate Transit Segments Table
Create a new `verifiedTransitSegments` table that stores the route-based segments.

**Pros:**
- No migration needed
- Keep existing activity-linked transit working
- More flexible routing (origin → destination vs. activity-linked)

**Cons:**
- Two transit systems to maintain
- More complex queries

### Option C: Hybrid Approach
Use verified data as the source, generate activity-linked segments during seed.

## Recommended Implementation Plan

### Phase 1: Schema Enhancement
**Enhance TransitSegment type to support new fields**

1. Add new fields to `TransitSegment` interface:
   ```typescript
   // New fields
   googleMapsUrl?: string;
   estimatedCostYen?: number;
   coveredByPass?: string;
   familyTip?: string;
   isHardDeadline?: boolean;
   originCoords?: { lat: number; lng: number };
   destinationCoords?: { lat: number; lng: number };
   ```

2. Enhance `TransitStep` interface:
   ```typescript
   // New fields
   lineColor?: string;
   platform?: string;
   exitInfo?: string;
   distance?: string;
   ```

### Phase 2: Seed Data Migration
**Replace current transit data with verified data**

1. Map each verified segment to its destination activity ID
2. Generate new `transitSegments` array from verified data
3. Increment DATA_VERSION to trigger reseed

### Phase 3: TransitCard Enhancement
**Update TransitCard to display new data**

1. Add "Open in Maps" button using `googleMapsUrl`
2. Display cost info with pass coverage indicator
3. Show train line colors in step instructions
4. Add platform/exit information
5. Display family tips when available

### Phase 4: Transit Detail View
**Create dedicated transit detail page**

1. New route: `/schedule/transit/[id]`
2. Full-screen map with route visualization
3. Complete step-by-step with all details
4. Cost breakdown
5. Alternative route suggestions

## Task Breakdown

### 1. Schema Enhancement (Types)
- [ ] 1.1 Add new fields to `TransitSegment` interface
- [ ] 1.2 Add new fields to `TransitStep` interface
- [ ] 1.3 Update Dexie database schema if needed

### 2. Seed Data Migration
- [ ] 2.1 Create mapping file: verified segment ID → activity ID
- [ ] 2.2 Write migration script to transform verified data
- [ ] 2.3 Replace `transitSegments` in seed-data.ts
- [ ] 2.4 Increment DATA_VERSION
- [ ] 2.5 Test seed with new data

### 3. TransitCard Enhancement
- [ ] 3.1 Add Google Maps button to TransitCard
- [ ] 3.2 Display cost info (¥ and pass coverage)
- [ ] 3.3 Add train line colors to step indicators
- [ ] 3.4 Show platform/exit info in expanded view
- [ ] 3.5 Add family tip callout when available

### 4. Transit Detail View (Future)
- [ ] 4.1 Create `/schedule/transit/[id]` route
- [ ] 4.2 Design full transit detail UI
- [ ] 4.3 Integrate with Google Maps SDK
- [ ] 4.4 Add route alternatives

## Key Data Mappings

The verified data uses origin → destination format. To link to activities:

| Verified Segment | Destination Activity |
|-----------------|---------------------|
| transit-d2-01 | day2-sensoji |
| transit-d3-01 | day3-ghibli |
| transit-d4-01 | day4-tsukiji |
| transit-d5-01 | day5-teamlab |
| etc. | etc. |

## Priority Features

### High Priority (Trip Launch)
1. Google Maps deep links - one-tap navigation
2. Platform/exit info - critical for navigation
3. Hard deadline indicators - don't miss timed entries

### Medium Priority (Nice to Have)
4. Train line colors - visual identification
5. Cost tracking - budget awareness
6. Family tips - helpful but not critical

### Low Priority (Post-Launch)
7. Full transit detail page
8. Route alternatives
9. Real-time transit updates

## Technical Considerations

### Google Maps URLs
The verified data provides URLs in this format:
```
https://www.google.com/maps/dir/?api=1&origin=ORIGIN&destination=DESTINATION&travelmode=MODE
```

This format opens Google Maps with directions ready. Works on both iOS and Android.

### Cost Tracking
Could aggregate daily/total transit costs:
- Show ¥ spent on transit per day
- Highlight pass savings (Hakone Free Pass covers ¥X)
- Help with cash/IC card planning

### Platform Data
The verified data includes validated platform info:
- "Platforms 7-8" for JR trains
- "A1 Exit" for metro stations
- Exit directions like "Exit 1 → Kaminarimon Gate"

This is critical for first-time visitors navigating Japanese stations.
