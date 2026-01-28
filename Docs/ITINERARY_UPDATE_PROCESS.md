# Itinerary Update Process

> How to update the FTC: Nihon app with new or modified itinerary data.

---

## Quick Reference

**Single source of truth:** `src/db/seed-data.ts`

| What Changed | Action |
|--------------|--------|
| Activities | Edit `seed-data.ts` → Clear IndexedDB → Refresh |
| Restaurants | Edit `seed-data.ts` → Clear IndexedDB → Refresh |
| Days/Schedule | Edit `seed-data.ts` → Clear IndexedDB → Refresh |
| Transit | Edit `seed-data.ts` → Clear IndexedDB → Refresh |

---

## Workflow Options

### Option A: Claude Code Direct Edit (Recommended)

1. **Describe your changes clearly:**
   ```
   Add Afuri Ramen in Ebisu as an alternative dinner option for Day 5.
   GPS: 35.6465, 139.7102
   Hours: 11:00-23:00
   Price: ¥1,000-1,500
   ```

2. Claude Code will edit `src/db/seed-data.ts`

3. **Clear browser database** (see below)

4. **Refresh app** to see changes

5. **Commit:**
   ```bash
   git add src/db/seed-data.ts
   git commit -m "data: add Afuri Ramen for Day 5 dinner"
   ```

### Option B: AI-Assisted Editing (External AI)

1. **Copy the prompt:** Use `Docs/AI_ITINERARY_EDITING_PROMPT.md` as context

2. **Make your request** to ChatGPT/Claude

3. **Get TypeScript output** in this format:
   ```typescript
   // ADD TO restaurants array:
   {
     id: 'afuri-ebisu',
     name: 'AFURI',
     // ... full object
   }
   ```

4. **Apply in Claude Code:**
   ```
   Apply these changes to src/db/seed-data.ts:
   [paste the TypeScript]
   ```

5. **Clear browser database and refresh**

### Option C: Manual TypeScript Editing

1. **Open:** `src/db/seed-data.ts`

2. **Find the right array:** `activities`, `restaurants`, `dayInfo`, etc.

3. **Edit carefully:** Follow existing TypeScript patterns

4. **Verify:** `npm run build`

5. **Clear browser database and refresh**

---

## Clearing the Browser Database

The app uses IndexedDB which caches data. After editing `trip-itinerary.json`, you must clear this cache.

### Chrome DevTools Method
1. Open DevTools (F12 or Cmd+Option+I)
2. Go to **Application** tab
3. Expand **IndexedDB** in sidebar
4. Find **ftc-nihon**
5. Right-click → **Delete database**
6. Refresh the page

### Quick Console Method
```javascript
// Paste in browser console:
indexedDB.deleteDatabase('ftc-nihon'); location.reload();
```

### iOS Safari (during trip)
Settings → Safari → Advanced → Website Data → Find "ftc-nihon" → Delete

---

## TypeScript File Structure

```
src/db/seed-data.ts
├── activities[]        # All scheduled activities by day
├── accommodations[]    # Hotels and lodging
├── transitSegments[]   # Transit directions between activities
├── tripInfo[]          # Trip metadata, guide, emergency
├── flights[]           # Flight information
├── tickets[]           # Pre-purchased tickets (Ghibli, TeamLab)
├── dayInfo[]           # Day-by-day info (highlights, meals)
├── attractions[]       # Standalone attractions
├── shoppingLocations[] # Shopping spots
├── restaurants[]       # Restaurant options with meal assignments
├── phrases[]           # Japanese phrases
├── transportRoutes[]   # Common transport routes
└── checklistItems[]    # Pre-trip checklist
```

---

## Common Edits

### Add a Restaurant

Find the `restaurants` array and add:

```typescript
{
  id: 'restaurant-name-area',
  name: 'Restaurant Name',
  nameJapanese: '日本語名',
  type: 'Cuisine Type',
  city: 'Tokyo',
  district: 'Area Name',
  address: 'Full address',
  addressJapanese: '〒XXX-XXXX 日本語住所',
  locationLat: 35.XXXX,
  locationLng: 139.XXXX,
  nearestStation: 'Station Name',
  phone: '+81 XX-XXXX-XXXX',
  hours: '11:00-22:00',
  priceRange: '¥X,XXX-X,XXX',
  isKidFriendly: true,
  notes: 'Special notes',
  googleMapsUrl: 'https://maps.google.com/...',
  websiteUrl: null,
  whatToOrder: 'Recommended dishes',
  backupAlternative: null,
  assignedMeals: JSON.stringify([
    { day: 5, date: '2026-03-10', meal: 'dinner', priority: 'primary' }
  ]),
  dayNumber: 5,
  meal: 'dinner',
  createdAt: now,
  updatedAt: now,
},
```

### Add an Activity

Find the `activities` array and add in the appropriate day section:

```typescript
{
  id: genId('act'),
  dayNumber: 5,
  date: '2026-03-10',
  startTime: '14:00',
  durationMinutes: 90,
  name: 'Activity Name',
  category: 'activity',
  locationName: 'Location',
  locationAddress: 'Address',
  locationAddressJp: null,
  locationLat: 35.XXXX,
  locationLng: 139.XXXX,
  googleMapsUrl: null,
  websiteUrl: null,
  description: 'What you\'ll do',
  tips: 'Helpful tips',
  whatToOrder: null,
  backupAlternative: null,
  isHardDeadline: false,
  isKidFriendly: true,
  sortOrder: 3,
  createdAt: now,
  updatedAt: now,
},
```

### Change Meal Assignments

Find the restaurant and update its `assignedMeals`:

```typescript
assignedMeals: JSON.stringify([
  { day: 5, date: '2026-03-10', meal: 'dinner', priority: 'primary' },
  { day: 6, date: '2026-03-11', meal: 'lunch', priority: 'alternative' }
]),
```

### Update Activity Time

Find the activity by its position/name and change `startTime` and/or `durationMinutes`:

```typescript
// Find the Senso-ji activity in Day 2 section
startTime: '08:30',
durationMinutes: 150,
```

---

## Validation

After editing, always run:

```bash
npm run build
```

If there are JSON syntax errors, the build will fail with helpful messages.

---

## During-Trip Quick Updates

If updating while traveling:

1. Make changes to `trip-itinerary.json` via Claude Code
2. Commit and push to GitHub
3. Vercel auto-deploys (< 1 minute)
4. On phone: clear site data and reload PWA
5. New data appears immediately

---

## Troubleshooting

### Changes not appearing
1. Did you save the JSON file?
2. Did you clear IndexedDB?
3. Did you hard refresh? (Cmd+Shift+R)
4. Check console for errors

### Build fails
1. Check JSON syntax (missing commas, quotes)
2. Validate at jsonlint.com
3. Check required fields are present

### Restaurant not in schedule
1. Check `assignedMeals` has correct day number
2. Verify the meal type (breakfast/lunch/dinner)
3. Check restaurant city matches day location

### Activity time overlaps
1. Check `startTime` + `durationMinutes` doesn't overlap next activity
2. Adjust `sortOrder` to reflect correct sequence
