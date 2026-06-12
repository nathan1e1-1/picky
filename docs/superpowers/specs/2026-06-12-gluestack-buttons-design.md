# Gluestack UI Button Integration

## Overview
Replace all existing buttons with gluestack-ui Button components for a consistent, clean, and accessible design.

## Scope
Replace all 5 buttons in the mobile app with gluestack Button components.

## Button Inventory

| Screen | Button Text | Current Style | New Variant | Action |
|--------|-------------|---------------|-------------|--------|
| Swipe Feed (Error) | Try Again | bg-orange-500 rounded-full | Primary | Retry fetch |
| Swipe Feed (Error) | Use Demo Data | border-orange-500 rounded-full | Secondary | Use mock data |
| Swipe Feed (Empty) | Find More Restaurants | bg-orange-500 rounded-full | Primary | Jitter + fetch |
| Swipe Feed (Empty) | Start Over | border-gray-300 rounded-full | Secondary | Reset index |
| Detail Screen (Location) | Open in Maps | bg-orange-500 rounded-full | Primary | Open Google Maps |
| Detail Screen (Error) | Go Back | bg-orange-500 rounded-full | Primary | router.back() |

## Button Variants

### Primary Button
- Background: solid orange (#f97316)
- Text: white, semibold
- Shape: rounded-full (pill)
- Size: medium (py-3, px-6)
- Action: main/positive action

### Secondary Button
- Background: transparent
- Border: 1px orange (#f97316)
- Text: orange (#f97316), semibold
- Shape: rounded-full (pill)
- Size: medium (py-3, px-6)
- Action: alternative/secondary action

## Implementation Plan

1. **Install gluestack-ui**
   - Run `npx gluestack-ui init` in apps/mobile
   - Add `Button` component via `npx gluestack-ui add button`
   - Verify no SDK 54 conflicts

2. **Create custom button component**
   - Create `apps/mobile/components/ui/GluestackButton.tsx`
   - Wrap gluestack Button with our variants
   - Support `variant` prop: 'primary' | 'secondary'

3. **Replace existing buttons**
   - `app/(tabs)/index.tsx`: Replace 4 buttons (Try Again, Use Demo Data, Find More, Start Over)
   - `app/restaurant/[id].tsx`: Replace Go Back button
   - `components/features/RestaurantDetail.tsx`: Replace Open in Maps button

4. **Testing**
   - Run existing test suite
   - Verify all buttons are tappable
   - Verify dark mode support
   - Verify no Expo Go crashes

## Files to Modify
- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/app/restaurant/[id].tsx`
- `apps/mobile/components/features/RestaurantDetail.tsx`
- `apps/mobile/components/ui/GluestackButton.tsx` (new)

## Dependencies
- `@gluestack-ui/button`
- `gluestack-ui-nativewind-utils` (if required by init)

## Branch
Create `feature/gluestack-buttons` from `master`

## Success Criteria
- [ ] All buttons use gluestack-ui Button component
- [ ] Primary/Secondary variants are visually distinct
- [ ] All existing tests pass
- [ ] No new TypeScript errors
- [ ] Dark mode works correctly
- [ ] No Expo Go crashes
