--- 
name: fix-mobile-timeline-layout
description: Fixed mobile timeline layout to show all experience cards instead of only half
metadata:
  type: project
  
**Problem**: The mobile layout of the experience section in DynamicProfile was only showing half of the timeline cards. This was because the CSS alternated cards between left and right slots on desktop, but on mobile it only showed the right slot cards, hiding all the left slot cards.

**Root Cause**: 
- Desktop layout alternates cards between left and right slots using `idx % 2 === 0` logic
- Mobile CSS (≤ 650px) hides the first slot (left slot) completely with `.timelineSlot:nth-child(1) { display: none; }`
- This meant only cards in the right slot (odd indices) were visible on mobile

**Solution**: 
1. Added `.desktopOnly` and `.mobileOnly` CSS classes to control visibility based on screen size
2. Modified the timeline rendering logic to:
   - Keep left slot cards in left position on desktop (with `.desktopOnly`)
   - Also render left slot cards in right position on mobile (with `.mobileOnly`)
   - Keep right slot cards working normally on both desktop and mobile
3. Updated CSS media queries to show/hide the appropriate classes

**Files Modified**:
- `src/app/profile/DynamicProfile.tsx`: Added conditional class names for desktop/mobile rendering
- `src/app/profile/DynamicProfile.module.css`: Added `.desktopOnly` and `.mobileOnly` classes with media query logic

**Result**: All timeline cards are now visible on mobile devices in a single column layout, while maintaining the alternating left/right layout on desktop screens.

**Why this approach**: 
- Maintains the nice visual design on desktop
- Ensures all content is accessible on mobile
- Uses CSS media queries for responsive behavior (no JavaScript window resizing needed)
- Minimal code changes, leveraging existing structure
- No duplication of card content that could cause accessibility or SEO issues