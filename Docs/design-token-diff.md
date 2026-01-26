# Design Token Audit: Current vs. Design System

> **Generated:** January 26, 2026
> **Reference:** `Docs/product_docs/FTC_Nihon_Design_System.md`
> **Source:** `src/app/globals.css`

---

## Executive Summary

The current implementation closely follows the Design System with **one critical deviation**: the `--foreground-tertiary` color (#a89b91) has insufficient contrast for WCAG 2.1 AA compliance.

| Category | Status | Issues |
|----------|--------|--------|
| Colors | ⚠️ Issue | Tertiary text contrast fails WCAG |
| Typography | ✅ Correct | Reggae One + Urbanist properly configured |
| Spacing | ✅ Correct | 8px grid system in place |
| Border Radius | ✅ Correct | Full scale defined |
| Shadows | ✅ Correct | Light/dark mode shadows present |
| Touch Targets | ✅ Correct | 44px minimum enforced |

---

## 1. Color Comparison

### 1.1 Light Mode Background Colors

| Token | Current | Design System | Status |
|-------|---------|---------------|--------|
| `--background` | `#fffbf7` | `#FFFBF7` | ✅ Match |
| `--background-secondary` | `#fff5ec` | `#FFF5EC` | ✅ Match |
| `--background-tertiary` | `#ffede0` | `#FFEDE0` | ✅ Match |
| `--surface` | `#ffffff` | `#FFFFFF` | ✅ Match |

### 1.2 Light Mode Text Colors

| Token | Current | Design System | Contrast | Status |
|-------|---------|---------------|----------|--------|
| `--foreground` | `#2d2420` | `#2D2420` | 11.5:1 | ✅ Match |
| `--foreground-secondary` | `#6b5d54` | `#6B5D54` | 5.2:1 | ✅ Match |
| `--foreground-tertiary` | `#a89b91` | `#A89B91` | **2.6:1** | ❌ Fails WCAG |
| `--foreground-inverse` | `#fffbf7` | `#FFFBF7` | - | ✅ Match |

**Critical Issue:** `--foreground-tertiary` (#a89b91) has only 2.6:1 contrast on cream backgrounds. WCAG AA requires 4.5:1 for normal text.

**Recommendation:** Change to `#6b5d54` (current secondary) or darker shade like `#7a6d63` (3.9:1) or `#5e524a` (5.8:1).

### 1.3 Light Mode Primary Accent (Coral)

| Token | Current | Design System | Status |
|-------|---------|---------------|--------|
| `--color-coral-50` | `#fff5f3` | `#FFF5F3` | ✅ Match |
| `--color-coral-100` | `#ffe8e4` | `#FFE8E4` | ✅ Match |
| `--color-coral-200` | `#ffd4cc` | `#FFD4CC` | ✅ Match |
| `--color-coral-300` | `#ffb5a8` | `#FFB5A8` | ✅ Match |
| `--color-coral-400` | `#ff8c7a` | `#FF8C7A` | ✅ Match |
| `--color-coral-500` | `#f46b55` | `#F46B55` | ✅ Match |
| `--color-coral-600` | `#e04d35` | `#E04D35` | ✅ Match |
| `--color-coral-700` | `#bc3a25` | `#BC3A25` | ✅ Match |
| `--color-coral-800` | `#9b3222` | `#9B3222` | ✅ Match |
| `--color-coral-900` | `#812d21` | `#812D21` | ✅ Match |

### 1.4 Light Mode Secondary Accent (Amber)

| Token | Current | Design System | Status |
|-------|---------|---------------|--------|
| `--color-amber-500` | `#f5b800` | `#F5B800` | ✅ Match |
| Full scale (50-900) | Present | Present | ✅ Complete |

### 1.5 Dark Mode Background Colors

| Token | Current | Design System | Status |
|-------|---------|---------------|--------|
| `--background` | `#0d1117` | `#0D1117` | ✅ Match |
| `--background-secondary` | `#161b25` | `#161B25` | ✅ Match |
| `--background-tertiary` | `#1e2533` | `#1E2533` | ✅ Match |
| `--surface` | `#252d3d` | `#252D3D` | ✅ Match |

### 1.6 Dark Mode Primary Accent (Vermillion)

| Token | Current | Design System | Status |
|-------|---------|---------------|--------|
| `--color-vermillion-500` | `#e53935` | `#E53935` | ✅ Match |
| Full scale (50-900) | Present | Present | ✅ Complete |

### 1.7 Semantic Colors

| Category | Light Mode | Dark Mode | Status |
|----------|------------|-----------|--------|
| Success | `#2e7d4a` | `#4ade80` | ✅ Match |
| Warning | `#d97706` | `#fbbf24` | ✅ Match |
| Error | `#dc2626` | `#f87171` | ✅ Match |
| Info | `#2563eb` | `#60a5fa` | ✅ Match |

### 1.8 Category Colors

| Category | Light Mode | Dark Mode | Status |
|----------|------------|-----------|--------|
| Food | `#f46b55` | `#e53935` | ✅ Match |
| Temple | `#7c3aed` | `#a78bfa` | ✅ Match |
| Shopping | `#f5b800` | `#ffd700` | ✅ Match |
| Transit | `#2563eb` | `#60a5fa` | ✅ Match |
| Activity | `#059669` | `#34d399` | ✅ Match |
| Hotel | `#8b5cf6` | `#c4b5fd` | ✅ Match |

---

## 2. Typography

### 2.1 Font Families

| Usage | Current | Design System | Status |
|-------|---------|---------------|--------|
| Display | `Reggae One, cursive` | `Reggae One, cursive` | ✅ Match |
| Body/UI | `Urbanist, -apple-system, ...` | `Urbanist, -apple-system, ...` | ✅ Match |
| Mono | `var(--font-geist-mono)` | Not specified | ✅ Acceptable |

### 2.2 Display Font Sizes

| Token | Current | Design System | Status |
|-------|---------|---------------|--------|
| Display Large | 48px / 1.1 | 48px / 1.1 | ✅ Match |
| Display Medium | 36px / 1.1 | 36px / 1.1 | ✅ Match |
| Display Small | 28px / 1.2 | 28px / 1.2 | ✅ Match |

### 2.3 Reggae One Usage Audit

Files using `font-display` class:

| File | Usage | Appropriate? |
|------|-------|--------------|
| `src/components/dashboard/DashboardLayout.tsx` | Day header | ✅ Yes |
| `src/components/schedule/DayNav.tsx` | Day numbers | ✅ Yes |

**Verdict:** Reggae One is used sparingly and appropriately for display text only.

---

## 3. Spacing

### 3.1 Spacing Scale

| Token | Current | Design System | Status |
|-------|---------|---------------|--------|
| `--spacing-0` | 0px | 0px | ✅ Match |
| `--spacing-1` | 4px | 4px | ✅ Match |
| `--spacing-2` | 8px | 8px | ✅ Match |
| `--spacing-3` | 12px | 12px | ✅ Match |
| `--spacing-4` | 16px | 16px | ✅ Match |
| `--spacing-5` | 20px | 20px | ✅ Match |
| `--spacing-6` | 24px | 24px | ✅ Match |
| `--spacing-8` | 32px | 32px | ✅ Match |
| `--spacing-10` | 40px | 40px | ✅ Match |
| `--spacing-12` | 48px | 48px | ✅ Match |
| `--spacing-16` | 64px | 64px | ✅ Match |

### 3.2 Safe Area Spacing

| Token | Current | Status |
|-------|---------|--------|
| `--spacing-safe-top` | `env(safe-area-inset-top)` | ✅ Present |
| `--spacing-safe-bottom` | `env(safe-area-inset-bottom)` | ✅ Present |
| `--spacing-safe-left` | `env(safe-area-inset-left)` | ✅ Present |
| `--spacing-safe-right` | `env(safe-area-inset-right)` | ✅ Present |

---

## 4. Border Radius

| Token | Current | Design System | Status |
|-------|---------|---------------|--------|
| `--radius-sm` | 4px | 4px | ✅ Match |
| `--radius-md` | 8px | 8px | ✅ Match |
| `--radius-lg` | 12px | 12px | ✅ Match |
| `--radius-xl` | 16px | 16px | ✅ Match |
| `--radius-2xl` | 24px | 24px | ✅ Match |
| `--radius-full` | 9999px | 9999px | ✅ Match |

---

## 5. Shadows

### 5.1 Light Mode Shadows

| Token | Current | Design System | Status |
|-------|---------|---------------|--------|
| `--shadow-light-sm` | `0 1px 2px rgba(45, 36, 32, 0.05)` | ✅ Match |
| `--shadow-light-md` | Complex | Complex | ✅ Match |
| `--shadow-light-lg` | Complex | Complex | ✅ Match |
| `--shadow-light-xl` | Complex | Complex | ✅ Match |

### 5.2 Dark Mode Shadows

| Token | Current | Design System | Status |
|-------|---------|---------------|--------|
| `--shadow-dark-sm` | `0 1px 2px rgba(0, 0, 0, 0.3)` | ✅ Match |
| `--shadow-dark-md` | Complex | Complex | ✅ Match |
| `--shadow-dark-lg` | Complex | Complex | ✅ Match |

---

## 6. Component Styles

### 6.1 Button Styles

| Style | Current Implementation | Design System | Status |
|-------|----------------------|---------------|--------|
| Primary | `bg-coral-500`, `px-6 py-3`, `rounded-md` | Coral 500, 12px 24px, 8px radius | ✅ Match |
| Secondary | `border-2 border-coral-500`, `bg-transparent` | 1.5px border (close) | ⚠️ Minor |
| Ghost | `bg-transparent`, `text-foreground-secondary` | ✅ Match | ✅ Match |

**Minor Issue:** Secondary button uses `border-2` (2px) instead of 1.5px as specified.

### 6.2 Card Styles

| Property | Current | Design System | Status |
|----------|---------|---------------|--------|
| Background | `bg-white` / `bg-indigo-700` | Surface color | ✅ Match |
| Border radius | `rounded-lg` (12px) | 12px | ✅ Match |
| Padding | `p-4` (16px) | 16px | ✅ Match |
| Shadow | `shadow-light-md` | shadow-md | ✅ Match |

### 6.3 Navigation Bar

| Property | Current | Design System | Issue |
|----------|---------|---------------|-------|
| Height | 57px (measured) | 64px + safe area | ❌ Too short |
| Background | `bg-background/95 backdrop-blur-sm` | Background + blur | ✅ Match |
| Icons | 24px | 24px | ✅ Match |

---

## 7. Touch Targets

| Token | Current | Design System | Status |
|-------|---------|---------------|--------|
| `--min-height-touch` | 44px | 44px | ✅ Match |
| `--min-width-touch` | 44px | 44px | ✅ Match |

Base layer enforces:
```css
button, [role='button'] {
  @apply min-h-touch min-w-touch;
}
```

---

## 8. Animation Timings

| Token | Current | Design System | Status |
|-------|---------|---------------|--------|
| `--duration-fast` | 150ms | 150ms | ✅ Match |
| `--duration-normal` | 250ms | 250ms | ✅ Match |
| `--duration-slow` | 400ms | 400ms | ✅ Match |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | ✅ Match | ✅ Match |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | ✅ Match | ✅ Match |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | ✅ Match | ✅ Match |

---

## 9. Hardcoded Colors

The following hardcoded color values were found in source files:

### src/components/maps/Map.tsx

| Line | Color | Usage | Recommendation |
|------|-------|-------|----------------|
| 32-37 | Category colors | Pin markers | Use CSS variables |
| 175 | `#666` | Time text | Use `--foreground-secondary` |
| 176 | `#888` | Location text | Use `--foreground-tertiary` |
| 219 | `#4285F4` | Google blue | External library (acceptable) |

**Recommendation:** Replace inline styles with CSS classes that use theme variables.

---

## 10. Focus Styles

| Property | Current | Status |
|----------|---------|--------|
| `:focus-visible` | `outline-2 outline-offset-2 outline-coral-500` | ✅ Defined |
| Dark mode | `outline-vermillion-400` | ✅ Defined |

**Note:** Focus styles are defined in `@layer base`, but Playwright tests indicate they may not be visible in practice. Needs investigation.

---

## 11. Accessibility Considerations

### Prefers Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Status:** ✅ Properly implemented

---

## 12. Recommendations Summary

### Critical

1. **Fix tertiary text contrast**
   - Change `--foreground-tertiary` from `#a89b91` to `#6b5d54` or darker
   - Affects: All pages using `text-foreground-tertiary`

### High Priority

2. **Remove hardcoded colors from Map.tsx**
   - Replace inline styles with CSS classes
   - Use theme-aware variables

3. **Increase bottom nav height to 64px**
   - Current: 57px, Required: 64px + safe area

### Medium Priority

4. **Investigate focus visibility**
   - Focus styles are defined but may not be visible
   - May need higher specificity or `!important`

### Low Priority

5. **Secondary button border width**
   - Currently 2px, Design System specifies 1.5px
   - Minor visual difference

---

*End of Design Token Audit*
