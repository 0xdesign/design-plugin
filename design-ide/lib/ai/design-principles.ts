export const DESIGN_PRINCIPLES = `
## Core Design Principles

### Visual Hierarchy
- Use size, color, and spacing to create clear visual hierarchy
- Primary actions should be immediately obvious
- Group related elements together
- Use whitespace strategically to reduce cognitive load

### Typography
- Limit to 2-3 font sizes per component
- Use font weight to create emphasis
- Ensure adequate line height for readability (1.5-1.6 for body text)
- Maintain consistent text alignment

### Color Usage
- Use a primary color for main actions and focus states
- Neutral colors for text and backgrounds
- Accent colors sparingly for emphasis
- Ensure sufficient contrast (WCAG AA minimum: 4.5:1 for text)

### Spacing & Layout
- Use consistent spacing units (4px, 8px, 12px, 16px, 24px, 32px, 48px)
- Create breathing room around interactive elements
- Align elements to an implicit grid
- Balance density with usability

### Interactive Elements
- Clear hover and focus states
- Adequate touch targets (44px minimum for mobile)
- Consistent button styles throughout
- Loading states for async actions
- Disabled states when appropriate

### Accessibility
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Screen reader friendly content order
- Color is not the only means of conveying information

## Component Patterns

### Cards
- Clear visual boundaries
- Consistent padding
- Optional: hover effects, shadows
- Content hierarchy within card

### Forms
- Labels above or beside inputs
- Clear validation feedback
- Logical tab order
- Grouped related fields
- Helpful placeholder text (not as replacement for labels)

### Navigation
- Clear current state indication
- Consistent positioning
- Logical grouping
- Mobile-responsive patterns

### Modals/Dialogs
- Clear title and purpose
- Obvious close mechanism
- Focus trapped within
- Backdrop to indicate overlay

### Tables/Lists
- Sortable columns when applicable
- Pagination or infinite scroll
- Row actions accessible but not obtrusive
- Empty states for no data

## Variant Exploration Axes

When generating variants, explore different approaches along these axes:

### Layout Axis
- Grid vs. flex layouts
- Single column vs. multi-column
- Card-based vs. list-based
- Sidebar vs. full-width

### Hierarchy Axis
- What's emphasized first?
- Price-focused vs. feature-focused
- Action-prominent vs. content-prominent
- Visual weight distribution

### Density Axis
- Compact (more info, less whitespace)
- Comfortable (balanced)
- Spacious (less info, more whitespace)

### Interaction Axis
- Hover effects
- Micro-animations
- Progressive disclosure
- Inline editing vs. modal editing

### Expression Axis
- Playful (rounded corners, bright colors, illustrations)
- Professional (sharp edges, muted colors, minimal decoration)
- Bold (strong typography, high contrast)
- Subtle (soft colors, gentle transitions)
`;
