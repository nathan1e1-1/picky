# Clean UI Redesign with Gluestack Design Principles

## Overview
Complete visual overhaul of the Picky app using gluestack-ui design principles for cleaner, more modern, and consistent UI.

## Scope
All 3 screens: Swipe Feed, Saved Tab, Detail Page (with tabs).

## Design Principles
- Card-based layouts with subtle shadows
- Better typography hierarchy
- Consistent spacing and breathing room
- Gluestack-inspired rounded corners and spacing
- Subtle shadows instead of heavy ones
- Clean empty and loading states

## 1. Swipe Cards (Feed)

### Current Issues
- Photo overlay is heavy with dark text shadow
- Info is scattered and cramped
- Tags feel cramped
- Distance and hours text are too small

### Changes
- **Gradient overlay**: Bottom-to-top gradient instead of dark overlay
- **Name**: Large bold font (24px), white with subtle shadow
- **Info row**: Distance, price dots, hours status in a clean horizontal row
- **Tags**: Rounded pills with semi-transparent background, better spacing
- **Score badge**: Keep current but position cleaner
- **No text shadow**: Use gradient overlay for readability

### File: `components/features/RestaurantCard.tsx`

## 2. Detail Page (Tabs)

### Header
- Full-bleed photo with gradient fade to white below
- Floating back button with blur background (not solid black)

### Tab Bar
- Larger touch targets (py-4 instead of py-3)
- Active: Orange underline + filled icon
- Inactive: Gray icon with gray text
- Remove border-bottom, use subtle shadow instead

### Info Tab
- **Name & Score**: Name in 28px bold, score badge aligned right
- **Rating**: Star icon + rating text in a row
- **Cuisine chips**: Better spacing, consistent pill shape
- **Contact info**: Card-like section with icon + text rows
- **Open status**: Prominent green/red text with icon
- **Spacing**: More whitespace between sections

### Menu Tab
- **Category headers**: 18px bold, better spacing
- **Items**: Name + description + price, dietary tags as small colored pills
- **Price**: Right-aligned, bold

### Location Tab
- **Address card**: Icon + address in a clean row
- **Distance**: Secondary row with icon
- **Button**: Full-width primary button

### Hours Tab
- **Weekly schedule**: Clean table with alternating row background
- **Today**: Orange highlight with "Today" badge
- **Hours**: Split multi-range on separate lines

### File: `components/features/RestaurantDetail.tsx`

## 3. Saved Tab

### Current Issues
- Basic rows, no visual hierarchy
- No photo thumbnails
- Info is cramped

### Changes
- **Card items**: Rounded cards with subtle shadow, white background
- **Photo thumbnail**: Left side, 60x60 rounded image
- **Restaurant name**: 16px bold, single line
- **Score badge**: Small, right-aligned
- **Cuisine + Price**: Small gray text below name
- **Distance**: Right-aligned below
- **Delete button**: Red trash icon
- **Empty state**: Better icon + message + action

### File: `app/(tabs)/saved.tsx`

## 4. Global Improvements

### Spacing
- Standard padding: 16px (px-4) instead of 20px (px-5)
- Section spacing: 24px between major sections
- Card padding: 16px

### Typography
- Screen titles: 28px bold
- Section headers: 18px semibold
- Body text: 14px regular
- Small text: 12px
- Caption: 10px

### Colors (Dark Mode)
- Background: `bg-white` / `dark:bg-neutral-900`
- Card background: `bg-gray-50` / `dark:bg-neutral-800`
- Text: `text-gray-900` / `dark:text-white`
- Secondary text: `text-gray-500` / `dark:text-gray-400`
- Borders: `border-gray-200` / `dark:border-neutral-700`
- Primary: `orange-500` (#f97316)

### Shadows
- Cards: `shadow-sm` (very subtle)
- Buttons: `shadow-md` (medium)
- No heavy shadows

### Loading States
- Spinner centered with label below
- Skeleton screens (optional future)

### Empty States
- Icon (lucide) in gray
- Message in bold
- Subtext in gray
- Action button if applicable

## Files to Modify
1. `components/features/RestaurantCard.tsx` - Swipe card redesign
2. `components/features/RestaurantDetail.tsx` - Detail page redesign
3. `app/(tabs)/saved.tsx` - Saved tab redesign
4. `app/(tabs)/index.tsx` - Minor spacing adjustments

## Branch
Create `feature/clean-ui` from `master`

## Success Criteria
- [ ] Swipe cards look cleaner with gradient overlay
- [ ] Detail page has improved spacing and typography
- [ ] Saved tab uses card-based items with thumbnails
- [ ] All screens use consistent spacing and typography
- [ ] Dark mode support maintained
- [ ] All existing tests pass
- [ ] No new TypeScript errors
