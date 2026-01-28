# AI Itinerary Editing Prompt & Rules

> Use this prompt when asking AI tools (ChatGPT, Claude, etc.) to edit the Japan trip itinerary.
> Copy this entire document as context before making edit requests.

---

## System Prompt

You are editing the FTC: Nihon Japan trip itinerary (March 6-21, 2026). This is a family trip with 4 adults and 3 children traveling through Tokyo, Hakone, Kyoto, and Osaka.

**Your role:** Make precise edits to the trip TypeScript data while maintaining data integrity, schedule consistency, and inter-dependencies between activities, meals, and transit.

---

## CRITICAL: Required Output Format

**YOU MUST OUTPUT TypeScript** that matches the schema in `src/db/seed-data.ts`.

**DO NOT output:**
- Excel spreadsheets or CSV files
- Markdown tables
- Plain text lists
- JSON (use TypeScript object syntax)

**ALWAYS output:**
- Valid TypeScript inside ```typescript code blocks
- Complete objects with ALL required fields
- Proper TypeScript syntax (single quotes for strings, trailing commas OK)

### For Adding New Items

Output the complete TypeScript object to add:

```typescript
// ADD TO restaurants array:
{
  id: 'afuri-ebisu',
  name: 'AFURI',
  nameJapanese: '阿夫利',
  type: 'Ramen',
  city: 'Tokyo',
  district: 'Ebisu',
  address: '1-1-7 Ebisuminami, Shibuya City, Tokyo',
  addressJapanese: '〒150-0022 東京都渋谷区恵比寿南1-1-7',
  locationLat: 35.6465,
  locationLng: 139.7102,
  nearestStation: 'Ebisu Station',
  phone: null,
  hours: '11:00-23:00',
  priceRange: '¥1,000-1,500',
  isKidFriendly: true,
  notes: 'Famous for yuzu shio ramen',
  googleMapsUrl: 'https://maps.app.goo.gl/wBcg9pJyLvP4KLVZ7',
  websiteUrl: null,
  whatToOrder: 'Yuzu Shio Ramen, Char siu rice',
  backupAlternative: null,
  assignedMeals: JSON.stringify([
    { day: 5, date: '2026-03-10', meal: 'dinner', priority: 'primary' }
  ]),
  dayNumber: 5,
  meal: 'dinner',
  createdAt: now,
  updatedAt: now,
}
```

### For Updating Existing Items

Specify the array, ID, and fields to change:

```typescript
// UPDATE in activities array - find id: 'act-0012' (Senso-ji)
// Change these fields:
startTime: '08:30',
durationMinutes: 150,
```

### For Deleting Items

```typescript
// DELETE from restaurants array:
// Remove object with id: 'ichiran-shinjuku'
```

### For Multiple Changes

Describe each operation clearly:

```typescript
// 1. ADD TO restaurants array:
{
  id: 'new-restaurant',
  // ... full object
}

// 2. UPDATE in activities array - find id: 'act-0015'
name: 'Lunch at AFURI',
```

---

## Trip Overview

| Dates | Location | Accommodation |
|-------|----------|---------------|
| Mar 7-12 | Tokyo | &Here Shinjuku |
| Mar 12-14 | Hakone | Yoshimatsu Ryokan |
| Mar 14-17 | Kyoto | Fujinoma Machiya House |
| Mar 17-21 | Osaka | MIMARU Shinsaibashi East |

**Travelers:** Rich and Angie Blaalid, Matt and Erin Rowles (adults) + Ben (11), Emma (8), Livy (11) (children)

---

## JSON Schema Reference

### Activity Object

```json
{
  "id": "act-day3-sensoji",
  "dayNumber": 3,
  "date": "2026-03-08",
  "startTime": "09:00",
  "durationMinutes": 120,
  "name": "Senso-ji Temple & Nakamise-dori",
  "category": "temple",
  "locationName": "Senso-ji Temple",
  "locationAddress": "2-3-1 Asakusa, Taito City, Tokyo",
  "locationAddressJp": "〒111-0032 東京都台東区浅草2-3-1",
  "locationLat": 35.7148,
  "locationLng": 139.7967,
  "googleMapsUrl": "https://maps.google.com/?q=Senso-ji+Temple",
  "websiteUrl": null,
  "description": "Tokyo's oldest temple",
  "tips": "Arrive early to avoid crowds",
  "whatToOrder": "Melon pan, ningyo-yaki",
  "backupAlternative": null,
  "isHardDeadline": false,
  "isKidFriendly": true,
  "sortOrder": 1
}
```

**Required fields:** `id`, `dayNumber`, `date`, `startTime`, `name`, `category`, `sortOrder`

**Category values:** `"food"`, `"temple"`, `"shopping"`, `"transit"`, `"activity"`, `"hotel"`

### Restaurant Object

```json
{
  "id": "afuri-ebisu",
  "name": "AFURI",
  "nameJapanese": "阿夫利",
  "type": "Ramen",
  "city": "Tokyo",
  "district": "Ebisu",
  "address": "1-1-7 Ebisuminami, Shibuya City, Tokyo",
  "addressJapanese": "〒150-0022 東京都渋谷区恵比寿南1-1-7",
  "locationLat": 35.6465,
  "locationLng": 139.7102,
  "nearestStation": "Ebisu Station",
  "phone": null,
  "hours": "11:00-23:00",
  "priceRange": "¥1,000-1,500",
  "isKidFriendly": true,
  "notes": "Famous for yuzu shio ramen",
  "googleMapsUrl": null,
  "websiteUrl": null,
  "whatToOrder": "Yuzu Shio Ramen",
  "backupAlternative": null,
  "assignedMeals": [
    {"day": 5, "date": "2026-03-10", "meal": "dinner", "priority": "primary"}
  ]
}
```

**Required fields:** `id`, `name`, `city`, `isKidFriendly`, `assignedMeals`

**Meal values:** `"breakfast"`, `"lunch"`, `"dinner"`, `"snack"`, `"afternoon"`

**Priority values:** `"primary"`, `"alternative"`, `"INCLUDED"`

### Day Object

```json
{
  "dayNumber": 3,
  "date": "2026-03-08",
  "dayOfWeek": "Sunday",
  "title": "East Tokyo Loop",
  "location": "Tokyo",
  "type": "self_guided",
  "accommodationId": "tokyo-here-shinjuku",
  "highlights": ["Senso-ji Temple", "Tokyo Skytree", "Ameyoko Market"],
  "hardDeadlines": [],
  "meals": {
    "breakfast": "own",
    "lunch": "own",
    "dinner": "own"
  }
}
```

**Type values:** `"travel"`, `"self_guided"`, `"guided_tour"`, `"mixed"`

**Meal plan values:** `"own"`, `"INCLUDED"`, `"flight"`, `null`

### Transit Segment Object

```json
{
  "id": "transit-day3-to-sensoji",
  "activityId": "act-day3-sensoji",
  "leaveBy": "08:30",
  "walkToStationMinutes": 5,
  "stationName": "Shinjuku-sanchome",
  "trainLine": "Tokyo Metro Marunouchi → Ginza",
  "suggestedDeparture": "08:35",
  "travelMinutes": 25,
  "transfers": "Transfer at Ginza to Ginza Line",
  "arrivalStation": "Asakusa",
  "walkToDestinationMinutes": 5,
  "bufferMinutes": 10
}
```

---

## Editing Rules

### Rule 1: ID Conventions
- **Activities:** `act-day{N}-{slug}` (e.g., `act-day3-sensoji`)
- **Restaurants:** `{name-slug}-{area}` (e.g., `afuri-ebisu`)
- **Transit:** `transit-day{N}-{description}` (e.g., `transit-day3-to-skytree`)
- **Never change existing IDs** - they are referenced by other records

### Rule 2: Date/Day Consistency
When changing `dayNumber`, also update `date`:

| Day | Date | Day of Week |
|-----|------|-------------|
| 1 | 2026-03-06 | Friday |
| 2 | 2026-03-07 | Saturday |
| 3 | 2026-03-08 | Sunday |
| 4 | 2026-03-09 | Monday |
| 5 | 2026-03-10 | Tuesday |
| 6 | 2026-03-11 | Wednesday |
| 7 | 2026-03-12 | Thursday |
| 8 | 2026-03-13 | Friday |
| 9 | 2026-03-14 | Saturday |
| 10 | 2026-03-15 | Sunday |
| 11 | 2026-03-16 | Monday |
| 12 | 2026-03-17 | Tuesday |
| 13 | 2026-03-18 | Wednesday |
| 14 | 2026-03-19 | Thursday |
| 15 | 2026-03-20 | Friday |
| 16 | 2026-03-21 | Saturday |

### Rule 3: Location Constraints
| Days | Location | Cannot Schedule |
|------|----------|-----------------|
| 1-6 | Tokyo | Kyoto temples, Osaka food |
| 7-8 | Hakone | Must stay near ryokan |
| 9-11 | Kyoto | Tokyo activities |
| 12-16 | Osaka | Tokyo/Kyoto activities |

### Rule 4: Time Cascade
When changing an activity's duration or start time:
1. Check if subsequent activities need adjustment
2. Ensure no overlaps (activity end time < next activity start time)
3. Maintain reasonable meal windows:
   - Breakfast: 07:00-09:00
   - Lunch: 11:30-13:30
   - Dinner: 17:30-20:00

### Rule 5: Hard Deadlines Cannot Move
These have `isHardDeadline: true` and CANNOT be rescheduled:
- TeamLab Borderless (Day 6, 10:00 entry)
- Ghibli Museum (Day 4, 10:00 entry)
- Flight departures/arrivals

### Rule 6: Meal Assignment Rules
When editing restaurant `assignedMeals`:
1. Day number must match the city the restaurant is in
2. One restaurant can be assigned to multiple meals (as alternative)
3. Use `priority: "INCLUDED"` for ryokan/hotel meals only

### Rule 7: Kid-Friendly Flag
Set `isKidFriendly: false` for:
- Late-night izakaya (after 8 PM)
- Bars or adult-only venues
- Very spicy food restaurants
- Long meditation/quiet activities

### Rule 8: GPS Coordinates
Always include `locationLat` and `locationLng` when adding locations:
- Tokyo: ~35.6762, 139.6503
- Hakone: ~35.2329, 139.1069
- Kyoto: ~35.0116, 135.7681
- Osaka: ~34.6937, 135.5023

Look up exact coordinates from Google Maps.

---

## Validation Checklist

Before finalizing edits, verify:

- [ ] All dates match day numbers
- [ ] No time overlaps within a day
- [ ] Hard deadline activities unchanged
- [ ] Restaurant cities match day locations
- [ ] Meal assignments have valid day references
- [ ] sortOrder is sequential within each day
- [ ] GPS coordinates are valid (lat ~35, lng ~135-139 for Japan)
- [ ] isKidFriendly is set appropriately
- [ ] All required fields are present

---

## Example Edit Requests

### Good Request:
"Add AFURI Ramen in Ebisu as an alternative dinner option for Day 5. Include the GPS coordinates from Google Maps."

### Bad Request:
"Add some restaurants" (too vague)

### Good Request:
"Move the Senso-ji Temple visit from Day 3 at 9:00 AM to 8:30 AM, and extend it to 2.5 hours."

### Bad Request:
"Change the schedule" (not specific)

---

## City-Specific Notes

### Tokyo (Days 2-6)
- JR Pass not needed (use Suica/Pasmo)
- Most attractions close 5-6 PM
- Rush hour: 7:30-9:30 AM, 5-8 PM (avoid trains)

### Hakone (Days 7-8)
- Hakone Free Pass covers all transport
- Ryokan dinner served 6-7 PM (MUST be present)
- Limited restaurant options - mostly ryokan meals

### Kyoto (Days 9-11)
- Temples close 5 PM (some 4 PM in winter)
- Buses get crowded - consider walking/taxi
- Geisha district active evening only

### Osaka (Days 12-16)
- Food heaven - many options
- Dotonbori best at night (neon signs)
- Day 16 is departure - morning only available

---

## How to Apply Changes

After receiving JSON output from AI:

1. **Review the JSON** - Check it matches the schema
2. **Open Claude Code** in the project
3. **Request the update:**
   ```
   Apply these changes to src/data/trip-itinerary.json:
   [paste the JSON output]
   ```
4. **Verify build:** Run `npm run build` to check for errors
5. **Clear browser database:** DevTools → Application → IndexedDB → Delete "ftc-nihon"
6. **Refresh the app** to see changes
7. **Commit:** `git commit -am "data: [describe your change]"`
