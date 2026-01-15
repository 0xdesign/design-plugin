# Design and Refine

Generate UI design variations, collect feedback, synthesize the best elements, and iterate to confident design decisions.

## Installation

### Local Testing

```bash
claude --plugin-dir /path/to/design-variations-plugin
```

### From Marketplace

```bash
/plugin marketplace add 0xdesigner/design-plugin
/plugin install design-and-refine@design-plugins
```

## Commands

### `/design-and-refine:start [target]`

Start a design and refine session.

**Arguments:**
- `target` (optional): Component or page to design/redesign

**Example:**
```
/design-and-refine:start CheckoutSummary
/design-and-refine:start
```

### `/design-and-refine:cleanup`

Remove all temporary design lab files.

## How It Works

1. **Preflight**: Detects framework, package manager, styling system
2. **Style Inference**: Reads your existing design tokens and patterns
3. **Interview**: Asks about requirements, pain points, and direction
4. **Generate**: Creates 5 distinct variations using your project's visual language
5. **Review**: Preview variants side-by-side at `/__design_lab`
6. **Feedback**: Tell me what you like about each variant
7. **Synthesize**: Creates a refined version combining the best elements
8. **Iterate**: Repeat until you're confident
9. **Finalize**: Cleans up temp files, produces `DESIGN_PLAN.md`

## Supported Frameworks

- Next.js (App Router & Pages Router)
- Vite (React, Vue)
- Remix
- Astro
- Create React App

## Supported Styling

- Tailwind CSS
- CSS Modules
- Material UI
- Chakra UI
- Ant Design
- styled-components
- Emotion

## Files Created

### Temporary (cleaned up on completion or abort)
- `.claude-design/` - All temporary variants and previews
- `app/__design_lab/` or `pages/__design_lab.tsx` - Lab route
- `app/__design_preview/` or `pages/__design_preview.tsx` - Preview route

### Permanent (kept after finalization)
- `DESIGN_PLAN.md` - Implementation plan for the chosen design
- `DESIGN_MEMORY.md` - Reusable style decisions for future runs

## License

MIT
