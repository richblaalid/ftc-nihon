# FTC: Nihon — Brand & Design System

## Document Information
- **Version:** 1.0
- **Created:** January 25, 2026
- **Status:** Approved

---

## 1. Brand Foundation

### 1.1 Brand Personality
The Finer Things Club is:
- **Adventurous** — Ready to explore
- **Playful** — Not too serious
- **Curious** — Always discovering
- **Foodie** — Here for the eats
- **Silly/Fun** — Laughs come first
- **Active** — On the move
- **"Treat Ourselves"** — Quality over budget

### 1.2 Brand Voice
- Warm and friendly, like a knowledgeable friend
- Confident but not bossy
- Fun without being childish
- Helpful without being clinical
- Occasional humor, never forced

### 1.3 Design Philosophy
> "Premium travel app with soul"

**Balance point: 4 out of 7** on the playful ↔ polished scale
- Clean and professional
- But with personality and warmth
- Never sterile or corporate
- Never messy or amateur

### 1.4 Brand Ratio
**FTC-first (2/3), destination as accent (1/3)**

The core FTC brand stays consistent across trips. Japan flavor is layered in through:
- Color accents (indigo-black in dark mode)
- Typography (Reggae One's Japanese influence)
- Mascot (dragon)
- Subtle cultural touches

This enables future expansion:
- FTC: Italia 🇮🇹
- FTC: Thailand 🇹🇭
- FTC: Peru 🇵🇪

---

## 2. The FTC Travel Menagerie

Hidden throughout the app as easter eggs — inside jokes from past adventures:

| Animal | Destination | Where to Hide |
|--------|-------------|---------------|
| 🐘 Elephant | Thailand | Loading state |
| 🦥 Sloth | Costa Rica | Empty state (no activities) |
| 🦈 Hammerhead Shark | Galápagos | Pull-to-refresh |
| 🐦 Hummingbird | Ecuador | Notification animation |
| 🦙 Alpaca | Peru | 404 error page |
| 🐉 **Dragon** | **Japan** | Splash screen, achievements |

**Style:** Illustrated, friendly, consistent style across all animals. Could be:
- Simple line art with accent color fill
- Geometric/low-poly style
- Playful cartoon style

These should feel like a collectible set — same artist, same vibe.

---

## 3. Color System

### 3.1 Overview

Two complete palettes that feel related but distinct:

| Mode | Mood | Background | Vibe |
|------|------|------------|------|
| ☀️ Light | Sunset Adventure | Warm cream | Golden hour on vacation |
| 🌙 Dark | Bold & Spicy | Deep indigo-black | Lantern-lit Kyoto alley |

### 3.2 Light Mode — "Sunset Adventure"

```
BACKGROUNDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background Primary     #FFFBF7    Warm cream
Background Secondary   #FFF5EC    Soft peach cream
Background Tertiary    #FFEDE0    Light apricot
Surface (cards)        #FFFFFF    Pure white

PRIMARY ACCENT — Coral/Salmon
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Coral 50              #FFF5F3
Coral 100             #FFE8E4
Coral 200             #FFD4CC
Coral 300             #FFB5A8
Coral 400             #FF8C7A
Coral 500             #F46B55    ← Primary
Coral 600             #E04D35
Coral 700             #BC3A25
Coral 800             #9B3222
Coral 900             #812D21

SECONDARY — Golden Amber
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amber 50              #FFFCF0
Amber 100             #FFF7D9
Amber 200             #FFECB3
Amber 300             #FFDF80
Amber 400             #FFD24D
Amber 500             #F5B800    ← Secondary
Amber 600             #D99E00
Amber 700             #B38000
Amber 800             #8C6500
Amber 900             #664A00

ACCENT — Deep Terracotta
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Terracotta 500        #C45D3A    ← Accent
Terracotta 600        #A84B2E
Terracotta 700        #8B3D25

TEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Text Primary          #2D2420    Warm charcoal
Text Secondary        #6B5D54    Warm gray
Text Tertiary         #A89B91    Muted warm gray
Text Inverse          #FFFBF7    For dark backgrounds
```

### 3.3 Dark Mode — "Bold & Spicy"

```
BACKGROUNDS — Deep Indigo Black
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background Primary     #0D1117    Deep indigo black
Background Secondary   #161B25    Slightly lighter
Background Tertiary    #1E2533    Card/elevated surface
Surface (cards)        #252D3D    Raised elements

PRIMARY ACCENT — Vermillion Red
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vermillion 50         #FFF5F5
Vermillion 100        #FFE0E0
Vermillion 200        #FFC7C7
Vermillion 300        #FFA3A3
Vermillion 400        #FF6B6B
Vermillion 500        #E53935    ← Primary
Vermillion 600        #C62828
Vermillion 700        #A51C1C
Vermillion 800        #871515
Vermillion 900        #6B1111

SECONDARY — Burnt Orange
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Orange 50             #FFF8F0
Orange 100            #FFECD9
Orange 200            #FFD9B3
Orange 300            #FFC080
Orange 400            #FFA54D
Orange 500            #F58220    ← Secondary
Orange 600            #D96A10
Orange 700            #B35408
Orange 800            #8C4106
Orange 900            #663005

ACCENT — Gold
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gold 500              #FFD700    ← Accent
Gold 600              #E6C200
Gold 700              #CCAC00

TEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Text Primary          #F5F5F5    Off-white
Text Secondary        #B0B8C4    Cool gray
Text Tertiary         #6B7280    Muted gray
Text Inverse          #0D1117    For light backgrounds
```

### 3.4 Semantic Colors (Both Modes)

```
SUCCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Light mode            #2E7D4A    Forest green
Dark mode             #4ADE80    Bright green

WARNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Light mode            #D97706    Amber
Dark mode             #FBBF24    Bright amber

ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Light mode            #DC2626    Red
Dark mode             #F87171    Light red

INFO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Light mode            #2563EB    Blue
Dark mode             #60A5FA    Light blue
```

### 3.5 Category Colors

For activity type icons and pills:

| Category | Light Mode | Dark Mode | Emoji |
|----------|------------|-----------|-------|
| Food | #F46B55 (Coral) | #E53935 (Vermillion) | 🍜 |
| Temple/Shrine | #7C3AED (Purple) | #A78BFA (Light purple) | ⛩️ |
| Shopping | #F5B800 (Amber) | #FFD700 (Gold) | 🛍️ |
| Transit | #2563EB (Blue) | #60A5FA (Light blue) | 🚃 |
| Activity | #059669 (Teal) | #34D399 (Light teal) | 🎯 |
| Hotel | #8B5CF6 (Violet) | #C4B5FD (Light violet) | 🏨 |

---

## 4. Typography

### 4.1 Font Stack

```css
/* Display / Headlines */
font-family: 'Reggae One', cursive;

/* Body / UI */
font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif;
```

### 4.2 Google Fonts Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Reggae+One&family=Urbanist:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### 4.3 Type Scale

```
DISPLAY — Reggae One
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Display Large     48px / 1.1    Splash screen "FTC: NIHON"
Display Medium    36px / 1.1    Day headers "DAY 5"
Display Small     28px / 1.2    Section titles "TOKYO"

HEADINGS — Urbanist Bold/SemiBold
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
H1                28px / 1.3    700 weight    Page titles
H2                24px / 1.3    600 weight    Card titles
H3                20px / 1.4    600 weight    Section headers
H4                18px / 1.4    600 weight    Subsections

BODY — Urbanist Regular/Medium
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Body Large        18px / 1.6    400 weight    Primary content
Body              16px / 1.6    400 weight    Default text
Body Small        14px / 1.5    400 weight    Secondary text
Caption           12px / 1.4    500 weight    Labels, timestamps

UI ELEMENTS — Urbanist Medium/SemiBold
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Button Large      16px          600 weight    Primary buttons
Button            14px          600 weight    Default buttons
Button Small      12px          600 weight    Compact buttons
Label             14px          500 weight    Form labels
Tab               14px          500 weight    Navigation tabs
```

### 4.4 Usage Guidelines

**Reggae One (Display)**
- Use sparingly — big moments only
- Splash screen, day headers, location titles
- Never for body text or UI elements
- Always uppercase or title case
- Minimum size: 24px

**Urbanist (Body/UI)**
- Primary workhorse font
- All body copy, UI elements, navigation
- Use weight variations for hierarchy
- Highly readable at all sizes

---

## 5. Spacing & Layout

### 5.1 Spacing Scale (8px base)

```
--space-0     0px
--space-1     4px      Tight spacing
--space-2     8px      Default small
--space-3     12px     Compact
--space-4     16px     Default medium
--space-5     20px     
--space-6     24px     Default large
--space-8     32px     Section spacing
--space-10    40px     
--space-12    48px     Page spacing
--space-16    64px     Major sections
```

### 5.2 Border Radius

**Slightly rounded** — friendly but clean

```
--radius-sm    4px     Small elements (chips, tags)
--radius-md    8px     Default (buttons, inputs)
--radius-lg    12px    Cards, containers
--radius-xl    16px    Modal, large cards
--radius-2xl   24px    Feature cards
--radius-full  9999px  Pills, avatars
```

### 5.3 Shadows

**Light mode:**
```css
--shadow-sm:   0 1px 2px rgba(45, 36, 32, 0.05);
--shadow-md:   0 4px 6px rgba(45, 36, 32, 0.07), 0 2px 4px rgba(45, 36, 32, 0.05);
--shadow-lg:   0 10px 15px rgba(45, 36, 32, 0.1), 0 4px 6px rgba(45, 36, 32, 0.05);
--shadow-xl:   0 20px 25px rgba(45, 36, 32, 0.12), 0 10px 10px rgba(45, 36, 32, 0.04);
```

**Dark mode:**
```css
--shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md:   0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-lg:   0 10px 15px rgba(0, 0, 0, 0.5), 0 4px 6px rgba(0, 0, 0, 0.3);
--shadow-xl:   0 20px 25px rgba(0, 0, 0, 0.6), 0 10px 10px rgba(0, 0, 0, 0.4);
```

---

## 6. Iconography

### 6.1 Style
- **Type:** Solid/filled
- **Corners:** Slightly rounded
- **Weight:** Medium (consistent stroke weight)
- **Size grid:** 16px, 20px, 24px, 32px

### 6.2 Recommended Icon Sets

**Primary (via Iconscout):**
- Phosphor Icons (Fill variant)
- Unicons Solid
- IconPark Solid

**Fallback:**
- Heroicons Solid
- Lucide (adjusted to solid)

### 6.3 Category Icons

| Category | Icon | Notes |
|----------|------|-------|
| Food | Bowl/chopsticks or utensils | Could be ramen bowl for Japan |
| Temple | Torii gate or shrine | ⛩️ vibe |
| Shopping | Shopping bag | Simple, universal |
| Transit | Train front | Japanese train style |
| Activity | Compass or ticket | Generic activity |
| Hotel | Bed or house | Simple accommodation |
| Time/Schedule | Clock | For "leave by" prompts |
| Map/Location | Pin | Standard map pin |
| Navigate | Arrow/direction | Wayfinding |
| AI Assistant | Sparkles or chat | For Claude integration |

### 6.4 Icon Color Usage

- **Default:** Text Secondary color
- **Active/Selected:** Primary accent color
- **On colored backgrounds:** White or appropriate contrast
- **Semantic:** Use semantic colors (green for success, red for error)

---

## 7. Components

### 7.1 Buttons

**Primary Button**
```
Background:    Primary accent (Coral 500 / Vermillion 500)
Text:          White
Border radius: 8px
Padding:       12px 24px
Font:          Urbanist SemiBold 14-16px
Shadow:        shadow-sm
Hover:         Darken 10%
Active:        Darken 15%
```

**Secondary Button**
```
Background:    Transparent
Border:        1.5px solid Primary accent
Text:          Primary accent
Border radius: 8px
Padding:       12px 24px
Hover:         Light accent background (10% opacity)
```

**Ghost Button**
```
Background:    Transparent
Text:          Text Secondary
Border radius: 8px
Padding:       12px 24px
Hover:         Background Secondary
```

### 7.2 Cards

```
Background:    Surface color (white / #252D3D)
Border radius: 12px
Padding:       16px
Shadow:        shadow-md
Border:        None (or 1px subtle in dark mode)
```

**Activity Card specific:**
- Left accent bar (4px) in category color
- Time prominent (Urbanist SemiBold)
- Category icon in top right

### 7.3 Input Fields

```
Background:    Background Secondary
Border:        1.5px solid transparent
Border radius: 8px
Padding:       12px 16px
Font:          Urbanist Regular 16px
Focus:         Border Primary accent, subtle glow
Error:         Border Error color
```

### 7.4 Pills / Tags

```
Background:    Category color @ 15% opacity
Text:          Category color (darker shade)
Border radius: 9999px (full)
Padding:       4px 12px
Font:          Urbanist Medium 12px
```

### 7.5 Navigation Bar

```
Background:    Background Primary + blur
Border top:    1px subtle divider (light mode only)
Height:        64px + safe area
Icons:         24px, Text Secondary → Primary when active
Labels:        Caption size, hidden or visible based on space
```

---

## 8. App Icon

### 8.1 Concept
**FTC + Dragon combination**
- "FTC" lettermark as base
- Dragon element integrated (wrapping around, breathing fire accent, forming a letter)
- Bold, recognizable at small sizes

### 8.2 Specifications
```
Size:          1024x1024px (master)
Export sizes:  180x180, 167x167, 152x152, 120x120, 87x87, 80x80, 76x76, 60x60, 58x58, 40x40
Format:        PNG (no transparency for iOS)
Corner radius: iOS applies mask automatically
```

### 8.3 Color Versions
- **Primary:** Coral background, white/cream FTC + dragon
- **Dark variant:** Deep indigo background, gold/vermillion accents
- **Monochrome:** For system contexts

### 8.4 Future Expansion
Same FTC lettermark, swap dragon for destination mascot:
- FTC: Thailand → Elephant
- FTC: Peru → Alpaca
- etc.

---

## 9. Tailwind CSS Configuration

```javascript
// tailwind.config.js
const config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode backgrounds
        cream: {
          50: '#FFFBF7',
          100: '#FFF5EC',
          200: '#FFEDE0',
        },
        // Coral (Light primary)
        coral: {
          50: '#FFF5F3',
          100: '#FFE8E4',
          200: '#FFD4CC',
          300: '#FFB5A8',
          400: '#FF8C7A',
          500: '#F46B55',
          600: '#E04D35',
          700: '#BC3A25',
          800: '#9B3222',
          900: '#812D21',
        },
        // Amber (Light secondary)
        amber: {
          50: '#FFFCF0',
          100: '#FFF7D9',
          200: '#FFECB3',
          300: '#FFDF80',
          400: '#FFD24D',
          500: '#F5B800',
          600: '#D99E00',
          700: '#B38000',
          800: '#8C6500',
          900: '#664A00',
        },
        // Terracotta (Light accent)
        terracotta: {
          500: '#C45D3A',
          600: '#A84B2E',
          700: '#8B3D25',
        },
        // Indigo Black (Dark backgrounds)
        indigo: {
          950: '#0D1117',
          900: '#161B25',
          800: '#1E2533',
          700: '#252D3D',
        },
        // Vermillion (Dark primary)
        vermillion: {
          50: '#FFF5F5',
          100: '#FFE0E0',
          200: '#FFC7C7',
          300: '#FFA3A3',
          400: '#FF6B6B',
          500: '#E53935',
          600: '#C62828',
          700: '#A51C1C',
          800: '#871515',
          900: '#6B1111',
        },
        // Burnt Orange (Dark secondary)
        orange: {
          50: '#FFF8F0',
          100: '#FFECD9',
          200: '#FFD9B3',
          300: '#FFC080',
          400: '#FFA54D',
          500: '#F58220',
          600: '#D96A10',
          700: '#B35408',
          800: '#8C4106',
          900: '#663005',
        },
        // Gold (Dark accent)
        gold: {
          500: '#FFD700',
          600: '#E6C200',
          700: '#CCAC00',
        },
      },
      fontFamily: {
        display: ['Reggae One', 'cursive'],
        sans: ['Urbanist', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '1.1' }],
        'display-md': ['36px', { lineHeight: '1.1' }],
        'display-sm': ['28px', { lineHeight: '1.2' }],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'light-sm': '0 1px 2px rgba(45, 36, 32, 0.05)',
        'light-md': '0 4px 6px rgba(45, 36, 32, 0.07), 0 2px 4px rgba(45, 36, 32, 0.05)',
        'light-lg': '0 10px 15px rgba(45, 36, 32, 0.1), 0 4px 6px rgba(45, 36, 32, 0.05)',
        'dark-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'dark-md': '0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 10px 15px rgba(0, 0, 0, 0.5), 0 4px 6px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 10. Animation Guidelines

### 10.1 Principles
- **Purposeful:** Animations guide attention, not distract
- **Quick:** 150-300ms for most interactions
- **Smooth:** Use ease-out for entering, ease-in for exiting
- **Subtle:** Avoid bouncy or playful easing (this isn't a kids' app)

### 10.2 Standard Timings

```css
--duration-fast:    150ms    /* Hovers, toggles */
--duration-normal:  250ms    /* Most transitions */
--duration-slow:    400ms    /* Page transitions, modals */

--ease-out:         cubic-bezier(0, 0, 0.2, 1)     /* Entering */
--ease-in:          cubic-bezier(0.4, 0, 1, 1)     /* Exiting */
--ease-in-out:      cubic-bezier(0.4, 0, 0.2, 1)   /* Moving */
```

### 10.3 Specific Animations

| Element | Animation | Duration |
|---------|-----------|----------|
| Button hover | Background color | 150ms |
| Card press | Scale 0.98 | 100ms |
| Page transition | Slide + fade | 300ms |
| Modal open | Scale 0.95→1 + fade | 250ms |
| Toast notification | Slide up + fade | 300ms |
| Pull to refresh | Rotation + bounce | Custom |
| Easter egg reveal | Playful (exception to subtle rule!) | 500ms |

---

## 11. Accessibility

### 11.1 Color Contrast
All text must meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

### 11.2 Touch Targets
- Minimum: 44x44 points
- Recommended: 48x48 points
- Spacing between targets: 8px minimum

### 11.3 Typography
- Minimum body text: 16px
- Line height: 1.5 minimum for body text
- Don't rely on color alone for meaning

### 11.4 Motion
- Respect `prefers-reduced-motion`
- Provide alternative for animation-dependent features

---

## 12. Asset Checklist

### 12.1 To Create/Source

**Fonts**
- [ ] Download Reggae One (Google Fonts)
- [ ] Download Urbanist (Google Fonts)
- [ ] Create font files for offline PWA

**Icons**
- [ ] Source solid icon set from Iconscout
- [ ] Create/source category icons (food, temple, shopping, transit, activity, hotel)
- [ ] Create custom icons if needed (dragon mark, FTC elements)

**Mascot Illustrations**
- [ ] Dragon (Japan) — primary, splash screen
- [ ] Elephant (Thailand) — easter egg
- [ ] Sloth (Costa Rica) — easter egg
- [ ] Hammerhead Shark (Galápagos) — easter egg
- [ ] Hummingbird (Ecuador) — easter egg
- [ ] Alpaca (Peru) — easter egg

**App Icon**
- [ ] Design FTC + Dragon app icon
- [ ] Export all required sizes
- [ ] Create favicon versions

**Misc**
- [ ] Splash screen design
- [ ] Empty state illustrations (optional, could use mascots)
- [ ] Loading animation (dragon? subtle?)

---

## 13. Design File Handoff

For implementation, provide:
1. This document (design tokens, specs)
2. Tailwind config (ready to paste)
3. Icon files (SVG preferred)
4. App icon (all sizes)
5. Mascot illustrations (SVG or PNG)
6. Any custom graphics

---

*End of Brand & Design System*
