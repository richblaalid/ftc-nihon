# Unified Meal Card Refactor Plan

## Status: ✅ Complete (2026-02-16)

## Problem Statement

Currently, the schedule timeline displays **duplicate entries** for meals:
1. An `ActivityCard` for explicit food activities (e.g., "Breakfast", "Tsukiji Market")
2. A `RestaurantOptionsCard` for meal slots (e.g., "Breakfast options")

Both can appear simultaneously, causing confusion. Users see "Breakfast" AND "Breakfast options" cards when there should be a single, unified meal card.

## Solution: Unified Meal Card

Replace the dual-card system with a **single meal card per slot** that intelligently displays:

| Scenario | Card Displays |
|----------|---------------|
| Scheduled food activity exists | "🌅 Breakfast: Tsukiji Market" with activity details |
| No activity, has restaurant options | "🌅 Breakfast" with primary option, tap to see alternatives |
| Meal included (ryokan/hotel) | "🌅 Breakfast: Included" (grayed, no tap action) |
| No activity, no options | Skip rendering entirely |

---

## Architecture

### Data Flow

```
Activities (seed-data) ──┐
                         ├──► getMealSlotsForDay() ──► MealSlot[] ──► Timeline
DayInfo (meal plan) ─────┘                              │
                                                        ▼
                                               ┌─────────────────┐
                                               │ MealSlot now    │
                                               │ includes:       │
                                               │ - meal          │
                                               │ - suggestedTime │
                                               │ - showOptions   │
                                               │ - reason?       │
                                               │ + scheduledActivity? │ ◄── NEW
                                               └─────────────────┘
```

### Key Changes

1. **MealSlot type** - Add optional `scheduledActivity` field
2. **getMealSlotInfo()** - Detect existing food activities and attach them
3. **Timeline.tsx** - Filter out food ActivityCards that are "covered" by meal slots
4. **MealSlotCard** - Render unified card handling all scenarios

---

## Implementation Phases

### Phase 1: Enhance MealSlot Data Structure
**Files:** `src/lib/meal-slots.ts`, `src/types/database.ts`

- Add `scheduledActivity?: Activity` field to `MealSlot` interface
- Update `getMealSlotInfo()` to detect food activities in meal time range
- When food activity found: attach it to `scheduledActivity`, set `showOptions: false`

### Phase 2: Update Timeline Rendering Logic
**Files:** `src/components/schedule/Timeline.tsx`

- Track which activities are "covered" by meal slots
- Skip rendering ActivityCards for covered food activities
- Meal slots handle all food display

### Phase 3: Create Unified MealSlotCard Component
**Files:** `src/components/schedule/MealSlotCard.tsx` (new)

- Consolidate rendering logic from `MealSlotCard` wrapper in Timeline.tsx
- Handle three display modes:
  1. **Scheduled**: Show activity name, location, tips
  2. **Options**: Show primary recommendation, "Choose" badge, tap to select
  3. **Included**: Show "Included with accommodation" text

### Phase 4: Testing & Verification
- Test Day 2: Generic "Breakfast" → shows options
- Test Day 4: "Tsukiji Market" → shows scheduled activity
- Test Day 7: Ryokan → shows "Included"
- Test Day 11: Multiple meals with different scenarios

---

## Design Rules for Future Enhancements

### Rule 1: One Card Per Meal Slot
Every meal (breakfast, lunch, dinner) should have **exactly one card** in the timeline. Never show both an ActivityCard and a meal options card for the same meal period.

### Rule 2: Food Activities Take Precedence
If a `category: 'food'` activity exists within a meal's time range, it becomes the meal plan. The meal card shows this activity instead of restaurant options.

**Time Ranges:**
- Breakfast: 07:00 - 10:00
- Lunch: 11:30 - 14:00
- Dinner: 17:30 - 21:00

### Rule 3: MealSlot is the Single Source of Truth
The `MealSlot` object returned by `getMealSlotsForDay()` contains all information needed to render the meal card:
- `meal`: The meal type (breakfast/lunch/dinner)
- `suggestedTime`: When to position in timeline
- `showOptions`: Whether to show restaurant picker
- `reason`: Why options aren't shown (if applicable)
- `scheduledActivity`: The food activity covering this slot (if any)

### Rule 4: Explicit Over Implicit
Meal inclusion should be explicit:
- Ryokan meals: Hardcoded by day number (Days 6-8)
- Hotel breakfast: Requires "hotel breakfast" or "included" in meal plan note
- Generic "Breakfast" activities do NOT automatically suppress options

### Rule 5: Default Selection Behavior
When showing restaurant options:
- Primary restaurant (from `assignedMeals` with `priority: 'primary'`) is pre-selected visually
- User can tap to change selection
- No selection = primary is assumed for planning purposes

---

## Component API

### MealSlotCard Props
```typescript
interface MealSlotCardProps {
  dayNumber: number;
  slot: MealSlot;
  isPast: boolean;
}
```

### Enhanced MealSlot Type
```typescript
interface MealSlot {
  meal: MealType;
  suggestedTime: string;
  showOptions: boolean;
  reason?: string;
  scheduledActivity?: Activity; // NEW: attached food activity
}
```

---

## Migration Notes

- No database changes required (seed-data only)
- No DATA_VERSION increment needed (UI logic change only)
- Backward compatible: existing meal slots work unchanged
- `RestaurantOptionsCard` remains for restaurant detail pages

---

## Success Criteria

1. ✅ No duplicate meal entries in any day's timeline
2. ✅ Scheduled meals (Tsukiji, Yuzu-an, etc.) show as meal cards
3. ✅ Generic "Breakfast" activities still show restaurant options
4. ✅ Included meals (ryokan) show correctly
5. ✅ Tapping meal card navigates to restaurant selection page
6. ✅ Build passes with no TypeScript errors
