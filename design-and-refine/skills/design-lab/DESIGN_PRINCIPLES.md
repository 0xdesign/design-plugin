# Design Principles Reference

This document contains curated best practices from world-class designers and design systems. Reference these principles when generating design variations.

---

## Part 1: UX Foundations

### Jakob Nielsen's 10 Usability Heuristics

1. **Visibility of system status** - Always keep users informed through appropriate feedback within reasonable time
2. **Match between system and real world** - Use familiar language, concepts, and conventions
3. **User control and freedom** - Provide clear "emergency exits" (undo, cancel, back)
4. **Consistency and standards** - Follow platform conventions; same words mean same things
5. **Error prevention** - Eliminate error-prone conditions or ask for confirmation
6. **Recognition over recall** - Minimize memory load; make options visible
7. **Flexibility and efficiency** - Provide accelerators for expert users (shortcuts, defaults)
8. **Aesthetic and minimalist design** - Remove irrelevant information; every element competes
9. **Help users recover from errors** - Plain language errors with constructive solutions
10. **Help and documentation** - Provide concise, task-focused help when needed

### Don Norman's Design Principles

- **Affordances** - Design elements should suggest their usage
- **Signifiers** - Visual cues that indicate where actions should happen
- **Mapping** - Controls should relate spatially to their effects
- **Feedback** - Every action needs a perceivable response
- **Conceptual model** - Users should understand how the system works

### Cognitive Load Principles

- **Limit choices** - 5-7 items max in navigation; 3-4 options in decisions
- **Progressive disclosure** - Show only what's needed at each step
- **Chunking** - Group related items; break long forms into steps
- **Visual hierarchy** - Guide attention with size, color, contrast, position
- **Reduce cognitive friction** - Minimize decisions, clicks, and reading

---

## Part 2: Visual Design Systems

### Typography (from iA, Stripe, Linear)

**Hierarchy:**

```
Display:    32-48px, -0.02em tracking, 700 weight
Heading 1:  24-32px, -0.02em tracking, 600 weight
Heading 2:  20-24px, -0.01em tracking, 600 weight
Heading 3:  16-18px, normal tracking, 600 weight
Body:       14-16px, normal tracking, 400 weight
Caption:    12-13px, +0.01em tracking, 400-500 weight
```

**Best practices:**

- Max 60-75 characters per line for readability
- Line height: 1.4-1.6 for body text, 1.2-1.3 for headings
- Use weight contrast (400 vs 600) more than size contrast
- Limit to 2 font families maximum
- System fonts for performance: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### Spacing System (8px grid)

```
4px   - Tight: icon padding, inline spacing
8px   - Base: related elements, form field padding
12px  - Comfortable: between form fields
16px  - Standard: section padding, card padding
24px  - Relaxed: between sections
32px  - Spacious: major section breaks
48px  - Generous: page section separation
64px+ - Hero: landing page sections
```

**Spacing principles:**

- Related items closer together (Gestalt proximity)
- Consistent internal padding (all sides equal, or vertical > horizontal)
- White space is not wasted space—it creates focus
- Touch targets minimum 44x44px (Apple HIG)

### Color (from Stripe, Linear, Vercel)

**Neutral foundation:**

```
Background:     #FFFFFF / #000000 (dark)
Surface:        #FAFAFA / #111111 (dark)
Border:         #E5E5E5 / #333333 (dark)
Text primary:   #171717 / #EDEDED (dark)
Text secondary: #737373 / #A3A3A3 (dark)
Text tertiary:  #A3A3A3 / #737373 (dark)
```

**Accent usage:**

- Primary action: single brand color, used sparingly
- Interactive elements: consistent color for all clickable items
- Semantic colors: red (error), green (success), yellow (warning), blue (info)
- Hover states: 10% darker or add subtle background
- Focus states: 2px ring with offset, high contrast

**Color principles:**

- WCAG AA minimum: 4.5:1 for text, 3:1 for UI elements
- One primary accent color; avoid rainbow interfaces
- Use opacity for secondary states (hover, disabled)
- Dark mode: don't just invert—reduce contrast, use darker surfaces

### Border Radius (from modern SaaS)

```
None (0px):     Tables, dividers, full-bleed images
Small (4px):    Buttons, inputs, tags, badges
Medium (8px):   Cards, modals, dropdowns
Large (12px):   Feature cards, hero elements
Full (9999px): Avatars, pills, toggle tracks
```

**Principles:**

- Consistency: pick 2-3 radius values and stick to them
- Nested elements: inner radius = outer radius - padding
- Sharp corners feel technical/precise; round feels friendly/approachable

### Shadows & Elevation (from Material, Linear)

```
Level 0: none (flat, on surface)
Level 1: 0 1px 2px rgba(0,0,0,0.05)      - Subtle lift (cards)
Level 2: 0 4px 6px rgba(0,0,0,0.07)      - Raised (dropdowns)
Level 3: 0 10px 15px rgba(0,0,0,0.1)     - Floating (modals)
Level 4: 0 20px 25px rgba(0,0,0,0.15)    - High (popovers)
```

**Principles:**

- Shadows should feel like natural light (top-down, slight offset)
- Dark mode: use lighter surface colors instead of shadows
- Combine with subtle border for definition
- Interactive elements can elevate on hover

---

## Part 3: Component Patterns

### Buttons (from Stripe, Linear)

**Hierarchy:**

1. **Primary** - One per view, main action, filled with brand color
2. **Secondary** - Supporting actions, outlined or ghost style
3. **Tertiary** - Low-emphasis actions, text-only with hover state
4. **Destructive** - Delete/remove actions, red with confirmation

**States:**

- Default → Hover (+shadow or darken) → Active (scale 0.98) → Disabled (50% opacity)
- Loading: replace text with spinner, maintain width
- Min width: 80px; min height: 36px (touch-friendly: 44px)

**Best practices:**

- Verb + noun labels: "Create project" not "Create"
- Sentence case, not ALL CAPS
- Icon left of text (or icon-only with tooltip)
- Primary button right-aligned in forms/dialogs

### Forms (from Airbnb, Stripe)

**Input anatomy:**

```
┌─────────────────────────────────┐
│ Label                           │
│ ┌─────────────────────────────┐ │
│ │ Placeholder / Value         │ │
│ └─────────────────────────────┘ │
│ Helper text or error message    │
└─────────────────────────────────┘
```

**Best practices:**

- Labels above inputs (not inside—accessibility)
- Placeholder ≠ label; use for format hints only
- Inline validation on blur, not on every keystroke
- Error messages: specific and actionable ("Email must include @")
- Success state: checkmark icon, green border (brief)
- Required fields: mark optional ones instead of required
- Single column forms outperform multi-column

### Cards (from Material, Apple)

**Anatomy:**

```
┌────────────────────────────────┐
│ [Media/Image]                  │  ← Optional
├────────────────────────────────┤
│ Eyebrow · Metadata             │  ← Optional
│ Title                          │  ← Required
│ Description text that can      │  ← Optional
│ wrap to multiple lines...      │
├────────────────────────────────┤
│ [Actions]              [More]  │  ← Optional
└────────────────────────────────┘
```

**Best practices:**

- Entire card clickable for primary action
- Consistent padding (16-24px)
- Image aspect ratios: 16:9, 4:3, 1:1 (be consistent)
- Limit to 2 actions max; overflow to menu
- Hover: subtle lift (translateY -2px + shadow increase)

### Tables (from Linear, Notion)

**Best practices:**

- Left-align text, right-align numbers
- Zebra striping OR row hover, not both
- Sticky header on scroll
- Sortable columns: show current sort indicator
- Actions: row hover reveals action buttons (or kebab menu)
- Empty state: helpful message + action
- Pagination vs infinite scroll: pagination for data accuracy, infinite for browsing
- Min row height: 48px for touch; 40px for dense

### Navigation (from Apple HIG, Material)

**Patterns by scale:**

- **2-5 items**: Tab bar / horizontal tabs
- **5-10 items**: Side navigation (collapsible)
- **10+ items**: Side nav with sections/groups

**Best practices:**

- Current location always visible
- Breadcrumbs for deep hierarchy (not for flat structures)
- Mobile: bottom nav for primary actions (thumb-friendly)
- Icons + labels together; icon-only needs tooltip
- Consistent order across pages

---

## Part 4: Interaction Design

### Feedback Patterns (from Dan Saffer's Microinteractions)

**Every action needs feedback:**

1. **Immediate** - Button press visual (scale, color change)
2. **Progress** - Loading states for anything >1s
3. **Completion** - Success confirmation (toast, checkmark, animation)
4. **Failure** - Clear error with recovery path

**Loading states:**

- 0-100ms: No indicator needed
- 100-300ms: Subtle change (opacity, skeleton)
- 300ms-1s: Spinner or progress bar
- 1s+: Skeleton screens + progress indication
- 10s+: Background processing with notification

### State Handling

**Every component needs these states:**

```
Default    → Base appearance
Hover      → Interactive hint (cursor change, highlight)
Focus      → Keyboard navigation (visible ring)
Active     → Being pressed/activated
Loading    → Async operation in progress
Disabled   → Not available (reduce opacity, remove pointer)
Error      → Invalid input or failed operation
Success    → Completed successfully (brief)
Empty      → No data to display (helpful message + action)
```

### Optimistic Updates (from Linear, Notion)

- Update UI immediately, sync in background
- Show subtle "Saving..." indicator
- On failure: revert UI + show error toast with retry
- Best for: toggles, reordering, text edits
- Avoid for: destructive actions, payments

### Progressive Disclosure

**Reveal complexity gradually:**

- Show essential options first
- "Advanced" or "More options" for power features
- Inline expansion over page navigation
- Tooltips for supplementary information
- Context menus for secondary actions

---

## Part 5: Motion & Animation

### The 12 Principles (Adapted for UI)

1. **Timing** - Fast for small changes (150-200ms), slow for large (300-500ms)
2. **Easing** - Never linear; use ease-out for entrances, ease-in for exits
3. **Anticipation** - Slight scale up before action (button press)
4. **Follow-through** - Elements settle into place (subtle overshoot)
5. **Staging** - Direct attention; one thing animates at a time
6. **Secondary action** - Supporting elements animate subtly with primary

### Timing Guidelines (from Material Motion)

```
Micro-interactions:     100-150ms (buttons, toggles, hover)
Small transitions:      150-200ms (dropdowns, tooltips)
Medium transitions:     200-300ms (modals, panels)
Large transitions:      300-500ms (page transitions, complex reveals)
Staggered lists:        50-100ms between items
```

### Easing Functions

```css
/* Standard easings */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);      /* Entrances */
--ease-in: cubic-bezier(0.7, 0, 0.84, 0);       /* Exits */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);  /* Move/resize */

/* Expressive easings */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);  /* Playful bounce */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);       /* Material standard */
```

### Animation Patterns

**Entrances:**

- Fade in + slide up (8-16px)
- Scale from 0.95 to 1 + fade
- Stagger children by 50ms

**Exits:**

- Fade out (faster than entrance)
- Scale to 0.95 + fade
- Slide in direction of dismissal

**Hover/Focus:**

- TranslateY -2px (lift)
- Scale 1.02-1.05 (grow)
- Shadow increase
- Background color shift

**Loading:**

- Skeleton shimmer (gradient animation)
- Pulse (opacity 0.5-1)
- Spinner (rotate continuously)

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Always respect user preferences. Replace motion with:

- Instant state changes
- Opacity transitions only
- No parallax or auto-playing video

---

## Part 6: Accessibility Essentials

### WCAG Quick Reference

**Perceivable:**

- Color contrast: 4.5:1 text, 3:1 UI components
- Don't rely on color alone (add icons, patterns)
- Text resizable to 200% without loss
- Captions for video; transcripts for audio

**Operable:**

- All functionality via keyboard
- No keyboard traps
- Skip links for repeated content
- Touch targets: 44x44px minimum

**Understandable:**

- Consistent navigation
- Identify input errors clearly
- Labels and instructions for forms

**Robust:**

- Semantic HTML elements
- ARIA only when HTML isn't enough
- Tested with screen readers

### Focus Management

```css
/* Visible focus for keyboard users */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remove default only if custom focus exists */
:focus:not(:focus-visible) {
  outline: none;
}
```

### ARIA Patterns

```html
<!-- Button (when not using <button>) -->
<div role="button" tabindex="0" aria-pressed="false">

<!-- Modal -->
<div role="dialog" aria-modal="true" aria-labelledby="title">

<!-- Tab panel -->
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel1">
</div>
<div role="tabpanel" id="panel1">

<!-- Live region (for dynamic updates) -->
<div aria-live="polite" aria-atomic="true">

<!-- Loading state -->
<button aria-busy="true" aria-describedby="loading-text">
```

---

## Part 7: Design System References

### Study These Systems

**For Clarity & Precision:**

- [Linear](https://linear.app) - Information density done right
- [Stripe](https://stripe.com) - Trust through craft
- [Vercel](https://vercel.com) - Developer-focused simplicity

**For Warmth & Approachability:**

- [Airbnb](https://airbnb.com) - Friendly, image-forward
- [Notion](https://notion.so) - Flexible, playful
- [Slack](https://slack.com) - Conversational, colorful

**For Data & Density:**

- [Bloomberg Terminal](https://bloomberg.com) - Maximum information
- [Figma](https://figma.com) - Tool-like precision
- [GitHub](https://github.com) - Code-centric clarity

**For Motion & Delight:**

- [Apple](https://apple.com) - Cinematic quality
- [Framer](https://framer.com) - Motion-first
- [Lottie examples](https://lottiefiles.com) - Micro-animation inspiration

### When Generating Variants

Reference specific aspects:

- "Use Linear's density approach"
- "Stripe's button hierarchy"
- "Airbnb's card layout"
- "Notion's toggle interaction"
- "Vercupdate the el's dark mode palette"

---

## Quick Decision Framework

When unsure, ask:

1. **Is it clear?** → User knows what to do and what happened
2. **Is it fast?** → Minimum steps, appropriate feedback
3. **Is it consistent?** → Matches patterns elsewhere in the app
4. **Is it accessible?** → Keyboard, screen reader, color contrast
5. **Is it calm?** → No unnecessary motion, color, or elements

