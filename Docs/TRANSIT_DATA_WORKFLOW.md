# Transit Data Workflow

This document describes how transit data flows through the app and how to update it when the itinerary changes.

## Data Architecture

```
Docs/japan trip details/
├── transit-segments-verified.ts    # Research & verification source
├── Blaalid_Rowles_Transport_Guide.md  # Human-readable reference
└── Blaalid_Rowles_Updated_Itinerary.md

                    ↓ (manual sync)

src/db/seed-data.ts                 # App's canonical data source
    └── transitSegments[]           # Transit data loaded into IndexedDB
```

## Two Data Sources

### 1. `transit-segments-verified.ts` (Research Source)
**Location:** `Docs/japan trip details/transit-segments-verified.ts`

This is where you research and verify transit routes. It contains:
- Origin/destination with Japanese names separated (`originJp`, `destinationJp`)
- Coordinates for map links
- Step-by-step instructions verified against official sources
- Google Maps deep links
- Travel mode (train, walking, bus, etc.)

**Use this file for:**
- Initial route research
- Verifying routes against official transit sources
- Storing reference data that may change

### 2. `seed-data.ts` (App Source)
**Location:** `src/db/seed-data.ts`

This is the canonical source for the app. Data here gets loaded into IndexedDB.

**Key differences from verified data:**
- `activityId` links to specific activities
- Japanese embedded in station names (e.g., "Shinjuku Station 新宿駅")
- `leaveBy` times calculated from activity start times
- `bufferMinutes` for family travel padding

## TransitSegment Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `summary` | Quick one-liner for glanceable view | "JR Chuo → Ginza Line (~35 min, ¥340)" |
| `notes` | Additional context/tips | "Alternative: Walk from Oshiage Station" |
| `familyTip` | Kid-specific advice | "Asakusa is last stop - can't overshoot" |
| `estimatedCostYen` | Cost per person | 340 |
| `coveredByPass` | Pass that covers this | "Hakone Free Pass" |
| `googleMapsUrl` | Deep link for navigation | URL to Google Maps |
| `steps[]` | Detailed step-by-step | Walk, train, transfer instructions |

## Updating Transit Data

### When the itinerary changes:

1. **Update the verified data first** (optional but recommended)
   ```
   Docs/japan trip details/transit-segments-verified.ts
   ```
   - Research new routes on Google Maps
   - Verify against official transit sources (JR, Tokyo Metro, etc.)
   - Add coordinates, costs, and deep links

2. **Update seed-data.ts**
   ```
   src/db/seed-data.ts → transitSegments[]
   ```
   - Find or create the transit segment
   - Add/update all required fields
   - Ensure `activityId` matches the linked activity

3. **Re-seed the database**
   ```bash
   # In browser DevTools console:
   localStorage.setItem('force-reseed', 'true')
   # Then refresh the page
   ```

### Adding a new transit segment:

```typescript
// In src/db/seed-data.ts
{
  id: genId('transit'),
  activityId: 'day5-activity-id',  // Must match an activity
  leaveBy: '09:00',                 // When to leave previous location
  walkToStationMinutes: 5,
  stationName: 'Shinjuku Station 新宿駅',
  trainLine: 'JR Chuo Line',
  suggestedDeparture: '09:05',
  travelMinutes: 20,
  transfers: null,                  // or 'Transfer at Kanda 神田'
  arrivalStation: 'Mitaka 三鷹',
  walkToDestinationMinutes: 15,
  bufferMinutes: 10,
  steps: [
    { type: 'walk', instruction: '...', duration: 5, distance: '300m' },
    { type: 'train', instruction: '...', duration: 20, lineColor: '#F15A22' },
  ],
  summary: 'JR Chuo Line direct to Mitaka (~20 min, ¥220)',
  notes: 'Catch an express train if available',
  googleMapsUrl: 'https://www.google.com/maps/dir/...',
  estimatedCostYen: 220,
  coveredByPass: 'IC Card (Suica/Pasmo)',
  familyTip: 'Express trains skip some stations - faster but same price',
  createdAt: now,
  updatedAt: now,
}
```

### Step types:
- `walk` - Walking segment (include `distance`)
- `train` - Train segment (include `lineColor` hex code)
- `transfer` - Station transfer (include `exitInfo`)
- `bus` - Bus segment

## Future Improvements

1. **Automated sync script**: Create a script to merge verified data into seed-data.ts
2. **Admin UI**: Allow editing transit data in-app with sync to database
3. **Supabase sync**: Store transit data in Supabase and sync on demand

## Verification Sources

- [Japan-Guide.com](https://www.japan-guide.com) - Transit guides
- [Tokyo Metro](https://www.tokyometro.jp/en/) - Official station info
- [JR East](https://www.jreast.co.jp/e/) - JR line schedules
- [Hyperdia](https://www.hyperdia.com) - Route planning
- [Google Maps](https://maps.google.com) - Deep links and walking times
