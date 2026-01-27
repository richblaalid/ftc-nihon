# Restaurant Options Feature - Implementation Tasks

> Generated from docs/PLAN-restaurant-options.md on January 27, 2026
>
> **Instructions for Claude:** Complete tasks sequentially within each phase.
> Mark each task complete immediately after implementation.
> Run `npm run lint` and `npm run build` after each task. Commit after each working change.

## Progress Summary

- Phase R.1: [x] Data Layer
- Phase R.2: [x] Schedule Integration
- Phase R.3: [x] Restaurant Options Page
- Phase R.4: [ ] Restaurant Detail Page
- Phase R.5: [ ] Selection & Route Integration
- Phase R.6: [ ] Polish & UX

---

## Phase R.1: Data Layer (Foundation)

### R.1.1 Extend Restaurant Type with Full Metadata

- [x] R.1.1.1: Update Restaurant interface in database types
  - Files: `src/types/database.ts`
  - Add: nameJapanese, type (cuisine), coordinates, addressJapanese, nearestStation, phone, hours, priceRange, notes
  - Test: TypeScript compiles without errors

- [x] R.1.1.2: Add MealAssignment interface
  - Files: `src/types/database.ts`
  - Interface: { day: number, date: string, meal: MealType, priority: 'primary' | 'alternative' | 'INCLUDED' }
  - Add assignedMeals field to Restaurant (JSON serialized)
  - Test: Types compile

### R.1.2 Create MealSelection Table

- [x] R.1.2.1: Add MealSelection interface
  - Files: `src/types/database.ts`
  - Interface: { id, dayNumber, meal, restaurantId, selectedAt, createdAt, updatedAt }
  - Test: Types compile

- [x] R.1.2.2: Add mealSelections table to Dexie schema
  - Files: `src/db/database.ts`
  - Version bump: 2 → 3
  - Indexes: id, [dayNumber+meal] for lookups
  - Test: Database initializes without errors

### R.1.3 Seed Restaurant Data from JSON

- [x] R.1.3.1: Create restaurant data transformer
  - Files: `src/db/seed-restaurants.ts`
  - Function: transformJsonToRestaurants(json) → Restaurant[]
  - Handle: Flatten city arrays, generate IDs, map fields
  - Test: Function transforms sample data correctly

- [x] R.1.3.2: Create seed function for restaurants
  - Files: `src/db/seed-restaurants.ts`
  - Function: seedRestaurantsFromJson()
  - Load JSON, transform, bulk insert to Dexie
  - Test: Data appears in IndexedDB

- [x] R.1.3.3: Integrate seeding into app initialization
  - Files: `src/db/seed-data.ts` (restaurants array updated with enriched data)
  - Existing seed system handles restaurant seeding
  - Test: Fresh app load populates restaurant data

### R.1.4 Create Data Hooks for Restaurant Options

- [x] R.1.4.1: Create useRestaurantOptionsForMeal hook
  - Files: `src/db/hooks.ts`
  - Params: dayNumber, meal
  - Returns: { primary: Restaurant, alternatives: Restaurant[], isIncluded: boolean }
  - Test: Hook returns correct restaurants for day 2 dinner

- [x] R.1.4.2: Create useMealSelection hook
  - Files: `src/db/hooks.ts`
  - Params: dayNumber, meal
  - Returns: MealSelection | null
  - Test: Hook returns selection if exists

- [x] R.1.4.3: Create useSelectedRestaurant hook
  - Files: `src/db/hooks.ts`
  - Params: dayNumber, meal
  - Returns: Restaurant | null (full details if selected)
  - Test: Hook returns restaurant when selection exists

- [x] R.1.4.4: Create useSetMealSelection hook/function
  - Files: `src/db/hooks.ts`
  - Functions: setMealSelection(), clearMealSelection()
  - Action: Upsert/delete MealSelection record
  - Test: Selection persists after page reload

**Phase R.1 Checkpoint:**
- [x] Restaurant types include all JSON fields
- [x] MealSelection table exists in Dexie
- [x] Restaurant data seeded from JSON (via seed-data.ts)
- [x] Hooks return correct data
- [x] Commit: "feat(db): add restaurant options data layer (R.1)"

---

## Phase R.2: Schedule Integration

### R.2.1 Create RestaurantOptionsCard Component

- [x] R.2.1.1: Create base RestaurantOptionsCard component
  - Files: `src/components/restaurants/RestaurantOptionsCard.tsx`
  - Props: dayNumber, meal, options, selection
  - Display: Meal type header, selection status, primary recommendation
  - Style: Card with food category color, pill-food style
  - Test: Component renders with mock data

- [x] R.2.1.2: Add selection state display
  - Files: `src/components/restaurants/RestaurantOptionsCard.tsx`
  - States: "Choose a restaurant", "Selected: [name]", "Included with hotel"
  - Test: All states render correctly

- [x] R.2.1.3: Add navigation to options page
  - Files: `src/components/restaurants/RestaurantOptionsCard.tsx`
  - Link: Navigate to `/restaurants/day-{X}-{meal}`
  - Test: Click navigates correctly

### R.2.2 Create Meal Slot Logic

- [x] R.2.2.1: Create getMealSlotsForDay function
  - Files: `src/lib/meal-slots.ts`
  - Input: dayNumber, activities
  - Output: Array of { meal, time, showOptions } slots
  - Logic: Determine meal times based on activity gaps
  - Test: Day 2 returns correct meal slots

- [x] R.2.2.2: Create shouldShowMealOptions function
  - Files: `src/lib/meal-slots.ts`
  - Input: dayNumber, meal, mealPlan
  - Output: boolean (false for "hotel breakfast", Hakone included meals)
  - Test: Returns false for day 7 dinner (ryokan included)

### R.2.3 Integrate into Schedule Timeline

- [x] R.2.3.1: Import and use meal slot logic in Timeline
  - Files: `src/components/schedule/Timeline.tsx`
  - Get meal slots for current day
  - Insert RestaurantOptionsCard at appropriate positions
  - Test: Cards appear between activities

- [x] R.2.3.2: Handle included meals display
  - Files: `src/components/schedule/Timeline.tsx`
  - Show "Included" variant for ryokan meals
  - Show "Hotel" note for breakfast-at-hotel
  - Test: Day 7-8 shows included meals correctly

**Phase R.2 Checkpoint:**
- [x] RestaurantOptionsCard renders in schedule
- [x] Meal slots calculated correctly per day
- [x] Included meals handled appropriately
- [x] Card links to options page
- [x] Commit: "feat(schedule): integrate restaurant options cards (R.2)"

---

## Phase R.3: Restaurant Options Page

### R.3.1 Create Options Page Route

- [x] R.3.1.1: Create restaurant options page
  - Files: `src/app/restaurants/[meal]/page.tsx`
  - URL params: meal (e.g., "day-2-dinner")
  - Parse params to get dayNumber and meal type
  - Test: Page loads at `/restaurants/day-2-dinner`

- [x] R.3.1.2: Add page header and navigation
  - Files: `src/app/restaurants/[meal]/page.tsx`
  - Back button, title ("Day 2 Dinner Options")
  - Test: Header displays correctly

### R.3.2 Create RestaurantList Component

- [x] R.3.2.1: Create RestaurantList component
  - Files: `src/components/restaurants/RestaurantList.tsx`
  - Props: restaurants[], selectedId, onSelect
  - Layout: Scrollable list with primary highlighted
  - Test: Component renders restaurant cards

- [x] R.3.2.2: Add kid-friendly filter toggle
  - Files: `src/components/restaurants/RestaurantList.tsx`
  - Toggle: "Show only kid-friendly"
  - Filter: Hide non-kid-friendly when enabled
  - Test: Filter works correctly

### R.3.3 Create RestaurantCard Component

- [x] R.3.3.1: Create RestaurantCard component
  - Files: `src/components/restaurants/RestaurantCard.tsx`
  - Props: restaurant, isSelected, isPrimary, onClick
  - Display: Name, type, price range, kid-friendly badge
  - Style: Card with selection indicator
  - Test: Card renders with all variants

- [x] R.3.3.2: Add visual differentiation for primary
  - Files: `src/components/restaurants/RestaurantCard.tsx`
  - Style: "Recommended" badge for primary option
  - Test: Primary card stands out visually

### R.3.4 Create RestaurantMap Component

- [x] R.3.4.1: Create RestaurantMap component
  - Files: `src/components/restaurants/RestaurantMap.tsx`
  - Props: restaurants[], selectedId, userLocation?, onPinClick
  - Display: Google Map with pins for each restaurant
  - Test: Map shows pins at correct locations

- [x] R.3.4.2: Add user location marker
  - Files: `src/components/restaurants/RestaurantMap.tsx`
  - Show blue dot for user's current position
  - Test: Location marker shows when available

- [x] R.3.4.3: Add selected pin highlighting
  - Files: `src/components/restaurants/RestaurantMap.tsx`
  - Larger/different pin for selected restaurant
  - Test: Selected pin visually distinct

### R.3.5 Wire Up Options Page

- [x] R.3.5.1: Connect page to data hooks
  - Files: `src/app/restaurants/[meal]/page.tsx`
  - Use: useRestaurantOptionsForMeal, useMealSelection
  - Test: Page shows real data from IndexedDB

- [x] R.3.5.2: Add map/list layout
  - Files: `src/app/restaurants/[meal]/page.tsx`
  - Layout: Map at top, scrollable list below
  - Mobile: Map takes ~40% height, list scrolls
  - Test: Layout works on mobile viewport

- [x] R.3.5.3: Connect pin click to list highlight
  - Files: `src/app/restaurants/[meal]/page.tsx`
  - Click pin → scroll list to that card
  - Click card → highlight pin on map
  - Test: Map/list interaction works

**Phase R.3 Checkpoint:**
- [x] Options page shows all restaurants for a meal
- [x] Map displays pins for each option
- [x] User location shows on map
- [x] List filters by kid-friendly
- [x] Map and list sync on selection
- [x] Commit: "feat(restaurants): add options page with map (R.3)"

---

## Phase R.4: Restaurant Detail Page

### R.4.1 Create Detail Page Route

- [ ] R.4.1.1: Create restaurant detail page
  - Files: `src/app/restaurants/[meal]/[id]/page.tsx`
  - URL params: meal, id (restaurant ID)
  - Test: Page loads at `/restaurants/day-2-dinner/tsunahachi`

- [ ] R.4.1.2: Add page header
  - Files: `src/app/restaurants/[meal]/[id]/page.tsx`
  - Back button, restaurant name
  - Test: Header displays correctly

### R.4.2 Create RestaurantDetail Component

- [ ] R.4.2.1: Create RestaurantDetail component
  - Files: `src/components/restaurants/RestaurantDetail.tsx`
  - Props: restaurant, isSelected, onSelect
  - Display: Full name (EN/JP), type, hours, price, notes
  - Test: Component renders all fields

- [ ] R.4.2.2: Add map section
  - Files: `src/components/restaurants/RestaurantDetail.tsx`
  - Single pin map with restaurant location
  - "Open in Google Maps" button
  - Test: Map shows correct location

- [ ] R.4.2.3: Add contact actions
  - Files: `src/components/restaurants/RestaurantDetail.tsx`
  - Tap-to-call phone number (tel: link)
  - Copy Japanese address button
  - Test: Phone call initiates, address copies

- [ ] R.4.2.4: Add selection button
  - Files: `src/components/restaurants/RestaurantDetail.tsx`
  - Button: "Select for [Meal]" or "Selected ✓"
  - Action: Call setMealSelection
  - Test: Selection persists after navigation

### R.4.3 Create Selection Store

- [ ] R.4.3.1: Create meal selection Zustand store
  - Files: `src/stores/meal-selection-store.ts`
  - State: { selections: Map<string, MealSelection> }
  - Actions: setSelection, clearSelection, getSelection
  - Persist: Sync to Dexie mealSelections table
  - Test: Store persists selections

- [ ] R.4.3.2: Wire up selection to detail page
  - Files: `src/app/restaurants/[meal]/[id]/page.tsx`
  - Use store actions for selection
  - Navigate back to options page after selection
  - Test: Full selection flow works

**Phase R.4 Checkpoint:**
- [ ] Detail page shows complete restaurant info
- [ ] Map shows restaurant location
- [ ] Tap-to-call works
- [ ] Copy address works
- [ ] Selection persists to IndexedDB
- [ ] Commit: "feat(restaurants): add detail page with selection (R.4)"

---

## Phase R.5: Selection & Route Integration

### R.5.1 Create SelectedRestaurantCard

- [ ] R.5.1.1: Create SelectedRestaurantCard component
  - Files: `src/components/restaurants/SelectedRestaurantCard.tsx`
  - Props: restaurant, meal, onChangeClick
  - Display: Name, cuisine type, "Change" button
  - Style: Different from options card (confirmed state)
  - Test: Component renders selected state

- [ ] R.5.1.2: Add time/distance estimate display
  - Files: `src/components/restaurants/SelectedRestaurantCard.tsx`
  - Show: Estimated walking time from previous location
  - Note: Simplified for MVP (static estimate)
  - Test: Time displays correctly

### R.5.2 Integrate Selected Restaurant into Timeline

- [ ] R.5.2.1: Update Timeline to show selected restaurants
  - Files: `src/components/schedule/Timeline.tsx`
  - Replace RestaurantOptionsCard with SelectedRestaurantCard when selected
  - Test: Selected restaurant shows in schedule

- [ ] R.5.2.2: Add "Change" navigation
  - Files: `src/components/schedule/Timeline.tsx`, `SelectedRestaurantCard.tsx`
  - "Change" button navigates to options page
  - Test: Can change selection from schedule

### R.5.3 Route Calculation (Simplified)

- [ ] R.5.3.1: Create simple distance calculation utility
  - Files: `src/lib/route-calculation.ts`
  - Function: getWalkingTimeEstimate(from, to) → minutes
  - Note: Use straight-line distance × 1.4 factor, 5 km/h
  - Test: Returns reasonable estimates

- [ ] R.5.3.2: Display route context in selected card
  - Files: `src/components/restaurants/SelectedRestaurantCard.tsx`
  - Show: "~X min walk from [Previous Activity]"
  - Test: Context displays correctly

**Phase R.5 Checkpoint:**
- [ ] Selected restaurant appears in schedule
- [ ] "Change" button works
- [ ] Walking time estimate shows
- [ ] Full selection flow end-to-end works
- [ ] Commit: "feat(schedule): integrate selected restaurants with route (R.5)"

---

## Phase R.6: Polish & UX

### R.6.1 Handle Special Cases

- [ ] R.6.1.1: Handle ryokan included meals
  - Files: `src/components/restaurants/RestaurantOptionsCard.tsx`, meal-slots.ts
  - Show: "Included with Yoshimatsu Ryokan" card variant
  - No selection UI for included meals
  - Test: Day 7-8 shows included correctly

- [ ] R.6.1.2: Handle hotel breakfast
  - Files: Multiple
  - Show: "Breakfast at [Hotel]" note card
  - Test: Hotel breakfast days display correctly

- [ ] R.6.1.3: Handle street food areas (Dotonbori, etc.)
  - Files: `src/components/restaurants/RestaurantDetail.tsx`
  - Show: "Street food area - multiple vendors" note
  - Test: Dotonbori displays as single selectable option

### R.6.2 Empty & Loading States

- [ ] R.6.2.1: Add loading skeletons to options page
  - Files: `src/app/restaurants/[meal]/page.tsx`
  - Skeleton: Card placeholders, map loading state
  - Test: Loading state displays while data loads

- [ ] R.6.2.2: Add empty state for no options
  - Files: `src/components/restaurants/RestaurantList.tsx`
  - State: "No restaurant options for this meal"
  - Test: Empty state renders when appropriate

### R.6.3 Accessibility

- [ ] R.6.3.1: Add ARIA labels to interactive elements
  - Files: All restaurant components
  - Labels: Buttons, cards, map pins
  - Test: Screen reader announces correctly

- [ ] R.6.3.2: Ensure keyboard navigation
  - Files: All restaurant components
  - Focus: Tab through cards and actions
  - Test: Can complete flow with keyboard only

### R.6.4 Visual Polish

- [ ] R.6.4.1: Add selection feedback animation
  - Files: `src/components/restaurants/RestaurantCard.tsx`
  - Animation: Brief scale/color pulse on selection
  - Test: Selection feels responsive

- [ ] R.6.4.2: Add map zoom transitions
  - Files: `src/components/restaurants/RestaurantMap.tsx`
  - Animation: Smooth zoom when selecting pin
  - Test: Map transitions smoothly

**Phase R.6 Checkpoint:**
- [ ] Special cases handled gracefully
- [ ] Loading states provide feedback
- [ ] Accessible to screen readers
- [ ] Animations feel polished
- [ ] Commit: "feat(restaurants): polish and edge cases (R.6)"

---

## Feature Completion Checkpoint

- [ ] User can see restaurant options in schedule
- [ ] User can browse options with map and list
- [ ] User can view full restaurant details
- [ ] User can select a restaurant for a meal
- [ ] Selection persists and shows in schedule
- [ ] User can change selection
- [ ] Works fully offline after data load
- [ ] All edge cases handled (included meals, hotel, street food)
- [ ] Commit: "feat: complete restaurant options feature"

---

## Task Log

| Task | Completed | Commit | Notes |
| ---- | --------- | ------ | ----- |
| - | - | - | - |
