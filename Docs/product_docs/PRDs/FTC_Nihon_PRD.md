# FTC: Nihon - Product Requirements Document

## Document Information
- **Version:** 1.0
- **Created:** January 25, 2026
- **Last Updated:** January 25, 2026
- **Status:** Approved for Development

---

## 1. Executive Summary

### 1.1 Product Overview
**FTC: Nihon** is a Progressive Web App (PWA) serving as a personalized travel concierge for the Finer Things Club's Japan trip (March 6-21, 2026). The app provides real-time schedule management, navigation assistance, and AI-powered travel guidance for 4 adults traveling with 3 children across Tokyo, Hakone, Kyoto, and Osaka.

### 1.2 Success Statement
> "Find exactly what I need, help me reach the next spot on time, give me tips on where I am, know what to ask, and take a level of stress away."

### 1.3 Core Value Proposition
Replace the stress of trip coordination with confidence. The app must be **faster and easier** than flipping through a PDF—or it has failed.

---

## 2. Users & Personas

### 2.1 User Group: Finer Things Club (FTC)

| Name | Role | Tech Comfort | Device | Primary Needs |
|------|------|--------------|--------|---------------|
| **Rich Blaalid** | Trip Leader, Admin | Power user | iPhone 13 Pro+ | Full control, real-time editing, detailed transit info |
| **Matt Rowles** | Trip Leader | Comfortable | iPhone 13 Pro+ | Quick decisions, schedule overview, navigation |
| **Angie Blaalid** | Traveler | Comfortable | iPhone 13 Pro+ | Easy access to "what's next", restaurant info |
| **Erin Rowles** | Traveler | Just make it work | iPhone 13 Pro+ | Simple, obvious, no confusion |

### 2.2 Design-For User: Erin
All UX decisions should be validated against: "Would Erin find this obvious and easy?"

### 2.3 Children (No App Access)
- Ben Blaalid (12)
- Emma Blaalid (9)
- Livy Rowles (11)

Children do not need app access. "Kid-friendly" indicators on activities serve the adults' decision-making.

---

## 3. Product Principles

### 3.1 Design Principles

1. **Offline-First**
   - Core features must work with zero connectivity
   - Assume subway tunnels, rural mountains, data conservation
   - Online features degrade gracefully with clear messaging

2. **Glanceable**
   - Answer "Where should I be?" in under 3 seconds
   - Most important information visible without scrolling
   - Progressive disclosure for details

3. **Stress-Reducing**
   - Proactive, not reactive (tell them before they need to ask)
   - Clear time buffers and "leave by" prompts
   - Never show anxiety-inducing countdowns under 5 minutes

4. **Better Than Paper**
   - If a PDF would be faster, we've failed
   - Every feature must justify its digital existence
   - Maintain PDF backup for catastrophic fallback

### 3.2 Visual Design Principles

| Attribute | Direction |
|-----------|-----------|
| **Mode** | Auto (follows system), with manual override option |
| **Density** | Minimal, clean, easy to understand quickly |
| **Tone** | Balance of fun (FTC is silly) and calm |
| **Inspiration** | Flighty (dashboard), Citymapper (directions), Headspace (warmth) |

---

## 4. Features & Requirements

### 4.1 Feature Priority Tiers

| Tier | Priority | Description |
|------|----------|-------------|
| **P1** | Must Have (Day One) | Core trip functionality, offline-required |
| **P2** | Should Have | Important features, online-acceptable |
| **P3** | Nice to Have | Enhancements if time allows |

---

### 4.2 P1 Features (Must Have - Day One)

#### 4.2.1 Dashboard Home Screen
**Description:** Widget-based home screen providing at-a-glance trip status.

**Requirements:**
- NOW widget: Current activity with time remaining
- NEXT widget: Upcoming activity with countdown and "leave by" time
- Weather widget: Today's forecast for current city
- Quick action buttons: Map, AI Assistant, Reservations
- Alert banner: Hard deadlines within 2 hours (prominent, dismissible)
- Date/day indicator with easy day-switching

**User Stories:**
- As a traveler, I open the app and immediately know what I should be doing right now
- As a trip leader, I can see at a glance if we're on schedule
- As any user, I can quickly access the most common functions

**Acceptance Criteria:**
- [ ] Dashboard loads in < 2 seconds (cached data)
- [ ] "Now" activity updates automatically based on time
- [ ] "Leave by" time accounts for walk to station + train schedule
- [ ] Works fully offline with cached data

---

#### 4.2.2 Daily Schedule View
**Description:** Full timeline view of a single day's activities.

**Requirements:**
- Chronological list of all activities for selected day
- Each activity card shows:
  - Time (start)
  - Activity name
  - Duration
  - Location with tap-to-map
  - Category icon (food, temple, shopping, transit, hotel)
  - Brief details/tips
- Visual distinction for:
  - Current activity (highlighted)
  - Completed activities (muted)
  - Hard deadlines (alert styling)
  - Meals included vs. on-your-own
- Color-coded categories matching design system
- Swipe or easy selector to change days

**User Stories:**
- As a traveler, I can see everything planned for today in order
- As a trip leader, I can quickly assess how much we have left today
- As any user, I can tap any activity to see more details

**Acceptance Criteria:**
- [ ] All 15 days of itinerary accessible
- [ ] Current activity auto-highlighted based on time
- [ ] Day switching doesn't interrupt flow
- [ ] Works fully offline

---

#### 4.2.3 Transit Integration with "Leave By" Times
**Description:** Pre-calculated transit information with departure prompts.

**Requirements:**
- For each activity requiring travel, show:
  - "Leave by" time (from current location)
  - Walking time to station
  - Train line(s) and transfer info
  - Suggested departure time (specific train)
  - Travel duration
  - Arrival station
  - Walking time to destination
  - Built-in buffer (~10 min cushion)
- Visual format:
  ```
  🚶 Leave hotel by: 8:35 AM
     ↓ 14 min walk to Shinjuku Station
  🚃 Catch: 8:52 AM (Chuo Line → Ginza Line)
     ↓ 35 min, transfer at Kanda
  📍 Arrive Asakusa: 9:27 AM
     ↓ 3 min walk
  ✅ Buffer: 10 min cushion
  ```
- "Recalculate" button for live transit data (requires internet)

**User Stories:**
- As a traveler, I know exactly when to leave without doing math
- As a trip leader, I can confidently tell the group "we need to leave in 10 minutes"
- As any user, I don't miss trains because I underestimated travel time

**Acceptance Criteria:**
- [ ] Pre-calculated times for every transit segment
- [ ] Times based on actual train schedules
- [ ] "Leave by" prominently displayed in schedule
- [ ] Recalculate button works when online
- [ ] Offline defaults to pre-calculated times

---

#### 4.2.4 Maps with GPS Location
**Description:** Interactive maps showing today's locations with current position.

**Requirements:**
- Map view showing:
  - All locations for current day (custom pins by category)
  - User's current GPS location
  - Walking route to next destination
- Custom pin icons for: food, temple/shrine, shopping, hotel, activity, transit hub
- Tap pin for quick info card (name, time, address)
- "Navigate" button opens directions view
- Offline map tiles for: Tokyo, Hakone, Kyoto, Osaka regions

**User Stories:**
- As a traveler, I can see where I am relative to where I need to be
- As any user, I can visualize today's route
- As a trip leader, I can orient the group when we emerge from a subway

**Acceptance Criteria:**
- [ ] GPS location updates in real-time when app is open
- [ ] All trip locations pinned with correct categories
- [ ] Offline map tiles cover all itinerary areas
- [ ] Pins are tappable with info preview

---

#### 4.2.5 Turn-by-Turn Directions
**Description:** Walking and transit directions between locations.

**Requirements:**
- Walking directions with:
  - Step-by-step instructions
  - Distance and time estimates
  - "Head north on..." style guidance
- Transit directions with:
  - Station entry point
  - Platform/line information
  - Transfer instructions
  - Exit information
- Option to open in Google Maps for full navigation
- Citymapper-style visual clarity

**User Stories:**
- As a traveler, I can follow directions without second-guessing
- As any user, I can navigate from current location to next activity
- As Erin, the directions are obvious and don't require interpretation

**Acceptance Criteria:**
- [ ] Directions available for every A→B segment
- [ ] Walking directions work offline (pre-cached routes)
- [ ] "Open in Google Maps" button for complex navigation
- [ ] Clear visual hierarchy for steps

---

#### 4.2.6 Hotel & Reservation Display
**Description:** Quick access to accommodation details and confirmations.

**Requirements:**
- Reservations wallet/section with:
  - Hotel/accommodation name
  - Full address (in English and Japanese for taxi drivers)
  - Check-in / check-out times
  - Confirmation number
  - PIN codes where applicable
  - Phone number (tap to call)
  - Link to Google Maps
  - Special instructions (machiya desk location, ryokan pickup, etc.)
- QR code display for confirmations that have them
- Current accommodation highlighted

**Accommodations to include:**
1. &Here Shinjuku (Tokyo) - March 7-12
2. Takumino yado Yoshimatsu (Hakone) - March 12-14
3. Fujinoma Machiya (Kyoto) - March 14-17
4. MIMARU Osaka Shinsaibashi (Osaka) - March 17-21

**User Stories:**
- As a traveler, I can show the taxi driver where to go (in Japanese)
- As Rich, I can quickly pull up confirmation numbers at check-in
- As any user, I never have to dig through email for reservation details

**Acceptance Criteria:**
- [ ] All 4 accommodations with complete details
- [ ] Japanese address text (copy-able)
- [ ] Phone numbers are tap-to-call
- [ ] Works fully offline

---

### 4.3 P2 Features (Should Have)

#### 4.3.1 AI Travel Concierge
**Description:** Claude-powered assistant with trip context awareness.

**Requirements:**
- Chat interface for natural language questions
- System context includes:
  - Full itinerary
  - Current location/activity
  - Time of day
  - Trip preferences and group composition
- Capable of answering:
  - Location-specific: "Tell me about this temple's history"
  - Etiquette: "Any tips for the onsen?"
  - Recommendations: "We have 30 extra minutes, what's nearby?"
  - Practical: "How do I say 'food allergy' in Japanese?"
  - Schedule: "What should we skip if we're running 30 minutes late?"
- Graceful offline handling: "I need internet to answer that, but here's what I know offline..."
- Pre-cached responses for common questions (offline fallback)

**User Stories:**
- As a traveler, I can ask context-aware questions like having a local guide
- As any user, I get relevant tips without searching
- As Rich, I can ask complex "what-if" scheduling questions

**Acceptance Criteria:**
- [ ] Claude integration functional with trip context
- [ ] Response time < 5 seconds on good connection
- [ ] Clear offline messaging
- [ ] Pre-cached responses for top 20 anticipated questions

---

#### 4.3.2 Restaurant & Activity Details
**Description:** Rich information cards for recommended spots.

**Requirements:**
- Each restaurant/activity card shows:
  - Name
  - Address (with Google Maps link)
  - Scheduled time (if applicable)
  - What to order / must-try items
  - Website/menu link (if available)
  - Backup alternative ("If there's a line, try X instead")
  - Kid-friendly indicator (icon)
- Organized by day and meal/activity type

**User Stories:**
- As a traveler, I know what to order without researching on the spot
- As a parent, I can quickly identify kid-friendly options
- As any user, I have a backup plan if the first choice doesn't work out

**Acceptance Criteria:**
- [ ] All recommended restaurants included
- [ ] "What to order" tips for each
- [ ] Google Maps links functional
- [ ] Backup alternatives where applicable

---

#### 4.3.3 Push Notifications
**Description:** Proactive alerts for schedule management.

**Requirements:**
- Notification types:
  - **Morning briefing** (8:00 AM local): Today's highlights, weather, hard deadlines
  - **Departure reminder** (30 min before "leave by" time): "Time to head to [station]"
  - **Hard deadline alert** (60 min before): "Ryokan dinner in 1 hour - head back!"
  - **Don't forget** (scheduled): "Bring ¥8,400 CASH for machiya check-in"
  - **Pre-trip** (before departure): "Sumo tickets go on sale tomorrow!"
  - **Weather alert**: "Rain expected this afternoon - pack umbrella"
- User can enable/disable notification categories
- Notifications work via PWA push (iOS 16.4+)

**User Stories:**
- As a traveler, I'm reminded before I need to remember
- As a trip leader, the app helps me keep the group on schedule
- As any user, I don't miss critical deadlines

**Acceptance Criteria:**
- [ ] All notification types implemented
- [ ] iOS PWA push notifications functional
- [ ] Notification preferences configurable
- [ ] Times calculated correctly for Japan timezone

---

#### 4.3.4 Group Location Sharing
**Description:** Simple check-in system for group coordination.

**Requirements:**
- "I'm here" button to share current location
- Group map view showing last known position of each adult
- Timestamps on location updates
- Optional: Set a "meeting point" that shows distance for each person
- Privacy-conscious: Only shares when user explicitly taps

**User Stories:**
- As a traveler, I can let others know where I am if we split up
- As a trip leader, I can see where everyone is before regrouping
- As any user, I don't have to text "where are you?" constantly

**Acceptance Criteria:**
- [ ] Location sharing is opt-in per update
- [ ] All 4 adults visible on shared map
- [ ] Meeting point feature functional
- [ ] Works with real-time data (requires internet)

---

#### 4.3.5 Admin Panel (Rich Only)
**Description:** Mobile-friendly interface for on-the-fly schedule edits.

**Requirements:**
- Supabase Auth protected access (Rich only, magic link or password)
- Capabilities:
  - Edit activity times
  - Edit activity details/notes
  - Add new activities
  - Remove activities
  - Update restaurant information
  - Add alerts/notes visible to all users
  - Manage checklist items
- Changes sync via Supabase real-time to all users instantly
- Offline edits queued, synced when online
- Simple, mobile-optimized forms

**User Stories:**
- As Rich, I can update the schedule when plans change without code edits
- As Rich, I can add a new restaurant Mico recommends on the spot
- As all users, we see updates within seconds via real-time sync

**Acceptance Criteria:**
- [ ] Supabase Auth protecting admin routes
- [ ] CRUD operations for all content types
- [ ] Real-time sync to other users (Supabase subscriptions)
- [ ] Offline edit queuing with sync indicator
- [ ] Mobile-friendly interface (large tap targets, simple forms)

---

### 4.4 P3 Features (Nice to Have)

#### 4.4.1 Japanese Phrase Helper
**Description:** Common phrases with point-and-show cards.

**Requirements:**
- Categorized phrase list: Greetings, Restaurant, Transit, Emergency, Shopping
- Each phrase shows: English, Japanese (romaji), Japanese (characters)
- "Show to staff" mode: Large text display
- Audio pronunciation (if time allows)
- Offline functional

#### 4.4.2 "Running Late" Mode
**Description:** AI-assisted schedule adjustment.

**Requirements:**
- Input: "We're X minutes behind"
- Output: Suggested modifications (skip, shorten, reorder)
- One-tap acceptance to update schedule
- Recalculates rest of day

#### 4.4.3 Photo Spot Suggestions
**Description:** Marked locations for best photos.

**Requirements:**
- Photo spots pinned on map
- Best time of day noted
- Example angles/tips

#### 4.4.4 Kid-Friendly View
**Description:** Simplified interface for children.

**Requirements:**
- Picture-based "what's next"
- Fun facts about locations
- Scavenger hunt items

---

## 5. Information Architecture

### 5.1 Navigation Structure

```
FTC: Nihon
├── 🏠 Home (Dashboard)
│   ├── NOW widget
│   ├── NEXT widget
│   ├── Weather widget
│   ├── Quick actions
│   └── Alert banner
│
├── 📅 Schedule
│   ├── Day selector
│   └── Timeline view
│       └── Activity cards
│           └── Activity detail
│
├── 🗺️ Map
│   ├── Today's pins
│   ├── Current location
│   └── Directions view
│
├── 🤖 AI Assistant
│   └── Chat interface
│
├── 🏨 Reservations
│   ├── Hotels list
│   └── Confirmation details
│
└── ⚙️ Settings
    ├── Notifications
    ├── Display mode
    ├── Admin login (Rich)
    └── About
```

### 5.2 Day Switching Interaction
- Subtle gesture or tap (doesn't obstruct current view)
- Collapsible date selector or swipe between days
- Always shows current day indicator

---

## 6. Content Requirements

### 6.1 Itinerary Data

Each day requires:
- Date and day number
- City/location
- All activities with:
  - Start time
  - Duration estimate
  - Name
  - Category (food, temple, shopping, transit, activity, hotel)
  - Address
  - Description/tips
  - Hard deadline flag (yes/no)
  - Kid-friendly flag (yes/no)
  - Links (Google Maps, website)

### 6.2 Transit Data

Each transit segment requires:
- Origin (hotel or previous activity)
- Destination
- Walking time to station
- Station name
- Train line(s)
- Suggested departure time
- Travel duration
- Transfer details (if any)
- Arrival station
- Walking time to destination
- Total buffer built-in

### 6.3 Accommodation Data

Each property requires:
- Name
- Address (English)
- Address (Japanese)
- Check-in time
- Check-out time
- Confirmation number
- PIN/access code
- Phone number
- Google Maps link
- Special instructions
- Dates of stay

### 6.4 Restaurant Data

Each restaurant requires:
- Name
- Address
- Google Maps link
- Website/menu link (if available)
- What to order / must-try
- Backup alternative
- Kid-friendly (yes/no)
- Scheduled day and meal

### 6.5 Pre-Trip Checklist
- eSIM setup instructions
- Ghibli ticket purchase (Feb 10)
- Sumo ticket purchase (Feb 7)
- Hakone Free Pass purchase
- Kimono rental booking
- Other bookings

---

## 7. Technical Requirements

### 7.1 Platform
- Progressive Web App (PWA)
- iOS Safari optimized (all users on iPhone 13 Pro+)
- Installable to home screen
- Offline-capable via Service Worker

### 7.2 Hosting & Infrastructure
- Vercel (provided by user)
- Free tier sufficient

### 7.3 External Services
- **Supabase** (user's account) - Database, real-time sync, admin auth
- **Anthropic Claude API** (user's account, ~$5-15 budget)
- **Google Maps API** (user's account, within free tier)

### 7.4 Offline Architecture

**Principle:** The app treats the network as an enhancement, not a requirement.

| Layer | Technology | Purpose |
|-------|------------|---------|
| Client (Primary) | IndexedDB via Dexie.js | Offline data storage - app ALWAYS reads from here |
| Server (Sync) | Supabase | Sync changes, real-time updates, admin auth |

**Data Flow:**
1. Initial install: Download all data from Supabase → IndexedDB
2. Normal use: App reads from IndexedDB (works offline!)
3. Admin edit: Write to IndexedDB → Push to Supabase → Real-time to other devices
4. Background sync: Supabase subscriptions update IndexedDB when online

### 7.5 Offline Requirements

| Feature | Offline Support | Data Source |
|---------|-----------------|-------------|
| Dashboard | ✅ Full | IndexedDB |
| Schedule | ✅ Full | IndexedDB |
| Transit times | ✅ Pre-calculated | IndexedDB |
| Maps | ✅ Cached tiles | Service Worker Cache |
| GPS location | ✅ Full | Device GPS |
| Directions | ✅ Pre-cached routes | IndexedDB |
| Reservations | ✅ Full | IndexedDB |
| AI Assistant | ⚠️ Pre-cached common Q&A only | IndexedDB |
| Notifications | ⚠️ Scheduled, not real-time | Service Worker |
| Admin edits | ⚠️ Queued, syncs when online | IndexedDB → Supabase |
| Location sharing | ❌ Requires internet | Supabase real-time |

### 7.6 Performance Requirements
- Dashboard load: < 2 seconds (cached)
- Activity detail: < 1 second
- Map render: < 3 seconds
- AI response: < 5 seconds (online)

---

## 8. Design Requirements

### 8.1 Branding

- **App Name:** FTC: Nihon
- **Full Name:** Finer Things Club: Nihon
- **Logo:** To be co-created (Japan-themed, FTC identity)
- **Icon Set:** Custom icons via Iconscout (user has access)

### 8.2 Visual Style

| Element | Specification |
|---------|---------------|
| Mode | Auto (system), with manual override |
| Typography | Clean, readable, generous sizing |
| Spacing | Minimal, generous whitespace |
| Colors | Warm palette, calm with playful accents |
| Animations | Subtle, purposeful, Headspace-inspired |
| Icons | Custom category icons, friendly style |

### 8.3 Inspiration References
- **Flighty:** Dashboard layout, information hierarchy, premium feel
- **Citymapper:** Directions clarity, transit visualization, action-oriented
- **Headspace:** Warmth, calm vibe, supportive tone

### 8.4 Accessibility
- Minimum touch target: 44x44 points
- Sufficient color contrast
- Readable font sizes (minimum 16px body)
- No critical information conveyed by color alone

---

## 9. Success Metrics

### 9.1 Qualitative Success
- "It's faster than looking at a PDF"
- "I knew when to leave without asking"
- "It told me something useful I didn't know"
- "Even Erin found it easy"

### 9.2 Quantitative Success
- All P1 features functional before departure (March 6)
- Offline mode tested and verified on all 4 devices
- Zero critical bugs during trip
- App used daily by all 4 adults

### 9.3 Failure Indicators
- Users revert to PDF or email for information
- "Where are we supposed to be?" asked more than once per day
- Offline mode fails when needed
- Any user finds it confusing or frustrating

---

## 10. Timeline

### 10.1 Development Phases

| Phase | Target Date | Deliverables |
|-------|-------------|--------------|
| **Phase 1** | Jan 31 | Dashboard, Schedule view, basic offline |
| **Phase 2** | Feb 7 | Maps, Directions, Reservations |
| **Phase 3** | Feb 14 | AI Assistant, Notifications |
| **Phase 4** | Feb 21 | Admin panel, Polish, Group features |
| **Phase 5** | Feb 28 | Testing, Bug fixes, Final content |
| **Launch** | March 1 | Feature freeze, final testing |
| **Trip** | March 6-21 | Live use! |

### 10.2 Key Milestones
- **Feb 7:** Pre-trip reminder for Sumo tickets functional
- **Feb 8:** First usable version for testing
- **Feb 10:** Pre-trip reminder for Ghibli tickets functional
- **Feb 20:** All content finalized
- **March 1:** Feature freeze, testing only
- **March 4:** Final sign-off from all adults
- **March 6:** Departure day

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Offline doesn't work | Medium | High | Aggressive testing in airplane mode; PDF backup |
| PWA push notifications fail on iOS | Medium | Medium | Test early on all devices; fallback to in-app alerts |
| Scope creep delays launch | Medium | High | Strict P1/P2/P3 prioritization; cut P3 if needed |
| Content not ready in time | Low | High | Start content entry immediately; parallelize |
| Mid-trip bugs with no fix | Low | High | Simple architecture; PDF backup; admin panel for content fixes |

---

## 12. Out of Scope

The following are explicitly **not** included in v1.0:
- Native iOS app (App Store)
- Android support (all users on iPhone)
- Multi-language support (English only)
- Integration with booking platforms
- Payment/transaction features
- Social sharing features
- User accounts beyond admin
- Trip planning features (trip is already planned)

---

## 13. Appendices

### Appendix A: Trip Overview
- **Dates:** March 6-21, 2026 (15 nights)
- **Destinations:** Tokyo → Hakone → Kyoto → Osaka
- **Travelers:** 7 (4 adults, 3 children)
- **Guide:** Mico (WhatsApp coordination, not in-app)

### Appendix B: Accommodation Summary
1. **Tokyo:** &Here Shinjuku (March 7-12)
2. **Hakone:** Takumino yado Yoshimatsu ryokan (March 12-14)
3. **Kyoto:** Fujinoma Machiya house (March 14-17)
4. **Osaka:** MIMARU Shinsaibashi (March 17-21)

### Appendix C: Data Sources
- Itinerary spreadsheet: `Japan_Itinerary_Complete.xlsx`
- Gap analysis: `japan_itinerary_gap_analysis.md`
- Original planning docs: Project knowledge base

---

*End of PRD*
