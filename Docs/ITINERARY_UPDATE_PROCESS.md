# Itinerary Update Process

> How to update the FTC: Nihon app with new or modified itinerary data.

---

## Quick Reference

| What Changed | File to Edit | Action After |
|--------------|--------------|--------------|
| Activities | `src/db/seed-data.ts` | Clear browser DB + refresh |
| Restaurants | `src/db/seed-data.ts` | Clear browser DB + refresh |
| Accommodations | `src/db/seed-data.ts` | Clear browser DB + refresh |
| Day info/titles | `src/db/seed-data.ts` | Clear browser DB + refresh |
| Transit segments | `src/db/seed-data.ts` | Clear browser DB + refresh |

---

## Option A: Direct Edit with Claude Code (Recommended)

### Step 1: Make Your Request
In Claude Code, describe your changes clearly:

```
Update the Day 5 dinner options to include:
1. Afuri Ramen (Ebisu) as primary
2. Ebisu Yokocho as alternative

Here are the details:
- Afuri: 35.6465, 139.7102, hours 11:00-23:00, $$
- Ebisu Yokocho: 35.6469, 139.7105, street food alley, $$
```

### Step 2: Claude Code Updates seed-data.ts
Claude will edit the appropriate sections in `src/db/seed-data.ts`.

### Step 3: Clear Browser Database
After the code changes, you need to clear the old data:

**In Chrome/Safari DevTools:**
1. Open DevTools (F12 or Cmd+Option+I)
2. Go to **Application** tab
3. In sidebar, find **IndexedDB**
4. Expand **ftc-nihon-db**
5. Right-click → **Delete database**
6. Refresh the page

**Or use the app's reset (if implemented):**
- Go to Settings → Reset Data

### Step 4: Verify Changes
1. Navigate to the relevant day in Schedule
2. Check that new restaurants appear
3. Verify times and details are correct

---

## Option B: AI-Assisted JSON Editing

### Step 1: Export Current Data
Copy the relevant section from `src/db/seed-data.ts`.

### Step 2: Use AI to Edit
1. Open ChatGPT, Claude, or similar
2. Paste the `AI_ITINERARY_EDITING_PROMPT.md` as context
3. Paste the current data section
4. Request your changes
5. Get back the edited JSON

### Step 3: Apply Changes to seed-data.ts
Either:
- Ask Claude Code to apply the changes
- Manually replace the section in the file

### Step 4: Clear Browser Database & Verify
Same as Option A, Steps 3-4.

---

## Option C: Manual Editing

### Finding the Right Section

**Activities by Day:**
```typescript
// Search for this pattern in seed-data.ts:
// Day X: [Day of Week], March [Date] - [Title]

// Example - find Day 5 activities:
// Day 5: Wednesday, March 11 - Akihabara & Ueno
```

**Restaurants:**
```typescript
// Search for:
export const restaurants: Restaurant[] = [
  // ... all restaurants listed here
```

**Day Info:**
```typescript
// Search for:
export const dayInfo: DayInfo[] = [
  // ... day metadata here
```

### Making Edits

**Adding a new activity:**
```typescript
// Add to the activities array in the correct day section:
{
  id: genId('act'),  // This auto-generates an ID
  dayNumber: 5,
  date: '2026-03-11',
  startTime: '14:00',
  durationMinutes: 90,
  name: 'Visit Akihabara Electronics',
  category: 'shopping',
  locationName: 'Yodobashi Camera Akihabara',
  locationAddress: '1-1 Hanaokacho, Chiyoda City, Tokyo',
  locationAddressJp: '〒101-0028 東京都千代田区花岡町1-1',
  locationLat: 35.6983,
  locationLng: 139.7731,
  googleMapsUrl: 'https://maps.google.com/?q=Yodobashi+Akihabara',
  websiteUrl: null,
  description: 'Massive electronics store - 8 floors',
  tips: 'Tax-free shopping available with passport',
  whatToOrder: null,
  backupAlternative: 'Bic Camera nearby',
  isHardDeadline: false,
  isKidFriendly: true,
  sortOrder: 5,  // Adjust based on position in day
  createdAt: now,
  updatedAt: now,
},
```

**Adding a new restaurant:**
```typescript
// Add to the restaurants array:
{
  id: 'afuri-ebisu',
  name: 'AFURI',
  nameJapanese: 'アフリ',
  type: 'Ramen',
  address: '1-1-7 Ebisuminami, Shibuya City, Tokyo',
  addressJapanese: '〒150-0022 東京都渋谷区恵比寿南1-1-7',
  locationLat: 35.6465,
  locationLng: 139.7102,
  nearestStation: 'Ebisu Station',
  phone: null,
  hours: '11:00-23:00',
  priceRange: '$$',
  isKidFriendly: true,
  notes: 'Famous for yuzu shio ramen',
  googleMapsUrl: 'https://maps.google.com/?q=AFURI+Ebisu',
  websiteUrl: 'https://afuri.com',
  whatToOrder: 'Yuzu Shio Ramen, Char siu rice',
  backupAlternative: null,
  city: 'Tokyo',
  assignedMeals: JSON.stringify([
    { day: 5, date: '2026-03-11', meal: 'dinner', priority: 'primary' }
  ]),
  dayNumber: null,
  meal: null,
  createdAt: now,
  updatedAt: now,
},
```

**Modifying meal assignments:**
```typescript
// Find the restaurant and update assignedMeals:
assignedMeals: JSON.stringify([
  { day: 5, date: '2026-03-11', meal: 'dinner', priority: 'primary' },
  { day: 6, date: '2026-03-12', meal: 'lunch', priority: 'alternative' }
]),
```

---

## Verification Commands

After making changes, run these to ensure no errors:

```bash
# Check for TypeScript errors
npm run build

# Check for lint errors
npm run lint

# Start dev server and test
npm run dev
```

---

## Common Issues & Solutions

### "Restaurant not showing in schedule"
1. Check `assignedMeals` has the correct day number
2. Verify the meal type matches (lunch, dinner, etc.)
3. Clear IndexedDB and refresh

### "Activity times overlapping"
1. Check `startTime` and `durationMinutes` of adjacent activities
2. Ensure `sortOrder` reflects the correct sequence
3. Previous activity end = startTime + durationMinutes

### "Transit not showing"
1. Transit segment `activityId` must match an activity ID
2. Transit shows AFTER the referenced activity
3. Check `leaveBy` time is reasonable

### "Changes not appearing"
1. Make sure you saved the file
2. Clear IndexedDB (most common issue!)
3. Hard refresh the browser (Cmd+Shift+R)
4. Check dev server console for errors

---

## Database Reset Script

For a complete reset during development:

```bash
# In browser console:
indexedDB.deleteDatabase('ftc-nihon-db')

# Then refresh the page
location.reload()
```

---

## Bulk Updates from JSON

If you have a large JSON file with updates:

### Step 1: Validate JSON Structure
Ensure it matches the TypeScript types in `src/types/database.ts`.

### Step 2: Ask Claude Code to Merge
```
I have updated itinerary data in this JSON:
[paste JSON]

Please merge this into src/db/seed-data.ts, updating existing
items by ID and adding new items. Preserve any items not in
the JSON.
```

### Step 3: Review Diff
Claude Code will show you the changes. Review carefully before accepting.

### Step 4: Test
Clear browser DB and verify all changes appear correctly.

---

## Version Control

Always commit after significant changes:

```bash
git add src/db/seed-data.ts
git commit -m "data: update Day 5 dinner restaurants"
git push
```

This ensures you can revert if something breaks.

---

## During-Trip Updates

If updating while traveling:

1. Make changes via Claude Code or direct edit
2. Commit and push to GitHub
3. Vercel auto-deploys (usually < 1 minute)
4. On your phone: clear site data in browser settings
5. Reload the PWA

**Quick site data clear on iOS Safari:**
Settings → Safari → Advanced → Website Data → Find "ftc-nihon" → Delete

---

## Getting Help

If something isn't working:

1. Check the browser console for errors (DevTools → Console)
2. Verify the data structure matches TypeScript types
3. Ask Claude Code: "Why isn't [X] showing in the app?"
4. Review recent git changes: `git diff HEAD~3 src/db/seed-data.ts`
