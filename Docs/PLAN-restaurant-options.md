# Restaurant Options Feature - Implementation Plan

> Generated: January 27, 2026
> Feature: Restaurant meal planning with options, selection, and route integration

## Overview

This feature adds dynamic restaurant selection to the daily schedule, allowing users to:
1. See a "Restaurant Options" card in the schedule for each meal time
2. Browse multiple restaurant recommendations for each meal
3. View detailed restaurant information (map, details, metadata)
4. Select a restaurant as their planned choice for that meal
5. Swap selections if plans change
6. See selected restaurants integrated into the day's route

## Data Analysis

### Restaurant JSON Structure (Japan_Restaurants_MapReady.json)

The JSON contains **rich restaurant data** with:

```typescript
interface RestaurantOption {
  id: string;                    // Unique identifier
  name: string;                  // English name
  nameJapanese: string;          // Japanese name (for taxis/locals)
  type: string;                  // Cuisine type (Ramen, Tempura, etc.)
  coordinates: { lat, lng };     // GPS for map pins
  address: string;               // English address
  addressJapanese: string;       // Japanese address
  nearestStation: string;        // Transit info
  phone: string;                 // Tap-to-call
  hours: string;                 // Operating hours
  priceRange: string;            // ¥ price indicator
  kidFriendly: boolean;          // Important for family
  notes: string;                 // Tips and highlights
  assignedMeals: [{              // Day/meal assignments
    day: number,
    date: string,
    meal: string,               // breakfast|lunch|dinner|snack
    priority: 'primary' | 'alternative' | 'INCLUDED'
  }];
}
```

### Meal Plan Structure

The `mealPlanByDay` array provides daily meal assignments:
- Primary restaurant recommendation
- Alternative options
- Notes for meals without specific restaurants (hotel breakfast, etc.)

## Architecture Decisions

### 1. Data Storage

**Decision:** Extend existing `Restaurant` type and add new `MealSelection` table

- Add new fields to Restaurant type for rich data
- Create `MealSelection` table to track user choices
- Store in IndexedDB (Dexie) for offline-first operation
- No Supabase sync needed for selections (personal device data)

### 2. UI Flow

```
Schedule Page (Day View)
    │
    ├── Activity Cards (existing)
    │
    └── RestaurantOptionsCard (new)
            │
            └── [Click] → RestaurantOptionsPage
                            │
                            ├── Map with all options
                            ├── List of restaurant cards
                            │
                            └── [Click card] → RestaurantDetailPage
                                                │
                                                ├── Full details
                                                ├── Map with single pin
                                                └── [Select] → Updates MealSelection
```

### 3. Route Integration

When a restaurant is selected:
1. It appears as a regular activity in the schedule
2. "Leave by" times calculated based on position
3. User can see how to get there and to next location

## Component Hierarchy

```
src/
├── components/
│   └── restaurants/
│       ├── RestaurantOptionsCard.tsx    # Card shown in schedule
│       ├── RestaurantList.tsx           # List view with filters
│       ├── RestaurantCard.tsx           # Individual restaurant card
│       ├── RestaurantDetail.tsx         # Full detail view
│       └── RestaurantMap.tsx            # Map showing options
│
├── app/
│   └── restaurants/
│       ├── page.tsx                     # Main restaurants page
│       ├── [meal]/page.tsx              # Options for specific meal
│       └── [meal]/[id]/page.tsx         # Restaurant detail
│
├── db/
│   └── database.ts                      # Add MealSelection table
│
├── types/
│   └── database.ts                      # Add RestaurantOption type
│
└── stores/
    └── meal-selection-store.ts          # Selection state management
```

## Implementation Phases

### Phase R.1: Data Layer (Foundation)

**Goal:** Schema updates and data seeding for restaurant options

1. **R.1.1** - Extend Restaurant type with full metadata
   - Files: `src/types/database.ts`
   - Add: coordinates, nameJapanese, nearestStation, hours, type, priceRange, notes

2. **R.1.2** - Add RestaurantOption type and MealAssignment
   - Files: `src/types/database.ts`
   - New types for the enriched JSON structure

3. **R.1.3** - Create MealSelection table in Dexie
   - Files: `src/db/database.ts`
   - Table: `mealSelections` with dayNumber, meal, restaurantId

4. **R.1.4** - Create seed script for restaurant data
   - Files: `src/db/seed-restaurants.ts`
   - Load and transform JSON data into IndexedDB

5. **R.1.5** - Create data hooks for restaurant options
   - Files: `src/db/hooks.ts`
   - Hooks: `useRestaurantOptionsForMeal()`, `useMealSelection()`, `useSelectedRestaurant()`

### Phase R.2: Schedule Integration

**Goal:** Restaurant options card in daily schedule

1. **R.2.1** - Create RestaurantOptionsCard component
   - Files: `src/components/restaurants/RestaurantOptionsCard.tsx`
   - Shows meal type, selection status, primary recommendation
   - Links to options page

2. **R.2.2** - Create meal slot calculation logic
   - Files: `src/lib/meal-slots.ts`
   - Determine meal times based on day schedule
   - Position cards between activities

3. **R.2.3** - Integrate RestaurantOptionsCard into Timeline
   - Files: `src/components/schedule/Timeline.tsx`
   - Insert cards at appropriate meal times
   - Show "Selected: [Restaurant]" or "Tap to choose"

### Phase R.3: Restaurant Options Page

**Goal:** List page showing all options for a meal

1. **R.3.1** - Create restaurant options page route
   - Files: `src/app/restaurants/[meal]/page.tsx`
   - URL: `/restaurants/day-2-dinner` or similar

2. **R.3.2** - Create RestaurantList component
   - Files: `src/components/restaurants/RestaurantList.tsx`
   - List of RestaurantCard components
   - Filter by kid-friendly, distance (if user location)

3. **R.3.3** - Create RestaurantCard component
   - Files: `src/components/restaurants/RestaurantCard.tsx`
   - Compact card with: name, type, price, kid-friendly badge
   - Selection state indicator

4. **R.3.4** - Create RestaurantMap component
   - Files: `src/components/restaurants/RestaurantMap.tsx`
   - Shows all options as pins
   - Shows user location for comparison
   - Tap pin to highlight in list

### Phase R.4: Restaurant Detail Page

**Goal:** Full detail view with selection capability

1. **R.4.1** - Create restaurant detail page route
   - Files: `src/app/restaurants/[meal]/[id]/page.tsx`
   - URL: `/restaurants/day-2-dinner/tsunahachi`

2. **R.4.2** - Create RestaurantDetail component
   - Files: `src/components/restaurants/RestaurantDetail.tsx`
   - Full info: name (EN/JP), type, hours, price, notes
   - Map with single pin
   - Tap-to-call, tap-to-copy address

3. **R.4.3** - Add selection functionality
   - Files: `src/components/restaurants/RestaurantDetail.tsx`, `src/stores/meal-selection-store.ts`
   - "Select for this meal" button
   - Confirmation/change flow

4. **R.4.4** - Create Zustand store for selections
   - Files: `src/stores/meal-selection-store.ts`
   - Track: { dayNumber, meal, restaurantId, selectedAt }
   - Persist to IndexedDB

### Phase R.5: Selection & Route Integration

**Goal:** Selected restaurants appear in schedule with routing

1. **R.5.1** - Create SelectedRestaurantCard component
   - Files: `src/components/restaurants/SelectedRestaurantCard.tsx`
   - Different appearance from options card
   - Shows: name, time estimate to get there, "Change" button

2. **R.5.2** - Integrate selected restaurants into schedule
   - Files: `src/components/schedule/Timeline.tsx`
   - Replace options card with selected restaurant card
   - Position based on typical meal times

3. **R.5.3** - Calculate route efficiency display
   - Files: `src/lib/route-calculation.ts`
   - Show walking time from current/previous location
   - Show walking time to next location

4. **R.5.4** - Add "Change Selection" flow
   - Files: Multiple components
   - Allow swapping restaurant selection
   - Maintain history for analytics

### Phase R.6: Polish & UX

**Goal:** Refined user experience and edge cases

1. **R.6.1** - Handle special cases (ryokan included meals)
   - Show "Included with accommodation" for Hakone
   - Hide selection UI for included meals

2. **R.6.2** - Add empty/loading states
   - Skeleton loading for lists
   - Empty state for days without restaurant options

3. **R.6.3** - Add accessibility
   - ARIA labels, keyboard navigation
   - Screen reader support

4. **R.6.4** - Add animations and transitions
   - Card selection feedback
   - Map zoom transitions
   - List filtering animations

## Key UX Considerations

### Glanceability (PRD Principle)
- Options card shows primary recommendation prominently
- Selected restaurant visible at a glance in schedule
- Color coding: coral for food category

### Stress-Reducing (PRD Principle)
- Show alternatives clearly if primary is unavailable
- "Kids Welcome" badge prominent
- Distance/time estimates help decision-making

### Better Than Paper (PRD Principle)
- Maps show relative locations instantly
- Tap-to-call beats looking up numbers
- Selection persists and syncs with schedule

### Erin Test (PRD Principle)
- Large touch targets (44pt+)
- Clear primary action ("Select This Restaurant")
- Easy to change selection without confusion

## Database Schema Changes

### New: MealSelection Table

```typescript
interface MealSelection {
  id: string;              // `${dayNumber}-${meal}`
  dayNumber: number;
  meal: MealType;          // breakfast|lunch|dinner|snack
  restaurantId: string;
  selectedAt: string;      // ISO timestamp
  createdAt: string;
  updatedAt: string;
}
```

### Updated: Restaurant Type

```typescript
interface Restaurant {
  // Existing fields...

  // New fields from JSON:
  nameJapanese: string | null;
  type: string | null;           // Cuisine type
  coordinates: { lat: number; lng: number } | null;
  addressJapanese: string | null;
  nearestStation: string | null;
  phone: string | null;
  hours: string | null;
  priceRange: string | null;
  notes: string | null;

  // Assignment tracking
  assignedMeals: MealAssignment[] | null;  // JSON serialized
}

interface MealAssignment {
  day: number;
  date: string;
  meal: MealType;
  priority: 'primary' | 'alternative' | 'INCLUDED';
}
```

## File Impact Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Types | 0 | `src/types/database.ts` |
| Database | 1 | `src/db/database.ts`, `src/db/hooks.ts` |
| Components | 6 | `src/components/schedule/Timeline.tsx` |
| Pages | 3 | - |
| Stores | 1 | - |
| Utils | 2 | - |
| **Total** | **13** | **4** |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Large JSON increases initial load | Compress/minify, load lazily per day |
| Map performance with many pins | Cluster pins, limit to visible area |
| Selection conflicts (multi-user) | Each device stores own selections |
| Offline selection changes | IndexedDB-first, no sync required |

## Success Metrics

1. User can view restaurant options within 2 taps from schedule
2. Selection updates schedule instantly (optimistic UI)
3. Map shows relative position clearly
4. Works fully offline after initial data load
5. "Change selection" takes < 3 seconds

## Open Questions

1. Should we show restaurant options for breakfast when it's typically "hotel"?
   - Recommendation: Show note "Breakfast at hotel" without options card

2. How to handle multi-restaurant meals (Dotonbori street food)?
   - Recommendation: Show as single option with multiple stops in notes

3. Should selection sync across family members' devices?
   - Recommendation: No for MVP; each device independent

---

*This plan extends the existing MVP with a focused feature set. All phases maintain offline-first principles and existing design system conventions.*
