# Design and Refine

A Claude Code plugin that helps you make confident UI design decisions through rapid iteration.

## What It Does

Design and Refine generates multiple distinct UI variations for any component or page, lets you compare them side-by-side in your browser, collects your feedback on what you like about each, and synthesizes a refined version—repeating until you're confident in the result.

Instead of guessing at the right design or going back-and-forth on revisions, you see real options, pick what works, and iterate quickly.

## When to Use It

- **Starting a new component or page** — explore different approaches before committing
- **Redesigning existing UI** — see alternatives to what you have today
- **Stuck on a design direction** — generate options when you're not sure what you want
- **Getting stakeholder buy-in** — show concrete variations instead of describing ideas
- **Learning what works** — see how different layouts, densities, and patterns feel in your actual codebase

## Why Use It

1. **Uses your existing design system** — infers colors, typography, spacing from your Tailwind config, CSS variables, or component library
2. **Generates real code** — not mockups, actual working components in your framework
3. **Side-by-side comparison** — view all variations at `/__design_lab` in your dev server
4. **Iterative refinement** — tell it what you like about each, get a synthesized version
5. **Clean handoff** — outputs `DESIGN_PLAN.md` with implementation steps when you're done
6. **No mess left behind** — automatically cleans up all temporary files

---

## Setup

### 1. Add the marketplace

In Claude Code, run:

```
/plugin marketplace add 0xdesign/design-plugin
```

### 2. Install the plugin

```
/plugin install design-and-refine@design-plugins
```

That's it. The plugin is now available in any project.

---

## Usage

### Start a session

```
/design-and-refine:start
```

Or with a specific target:

```
/design-and-refine:start ProfileCard
```

### What happens next

1. **Preflight** — detects your framework (Next.js, Vite, etc.) and styling system (Tailwind, MUI, etc.)

2. **Style inference** — reads your existing design tokens from Tailwind config, CSS variables, or theme files

3. **Interview** — asks about:
   - What you're designing (component vs page, new vs redesign)
   - Pain points and what should improve
   - Visual and interaction inspiration
   - Target user and key tasks

4. **Generation** — creates 5 distinct variations exploring different:
   - Information hierarchy
   - Layout models (cards, lists, tables, split-pane)
   - Density (compact vs spacious)
   - Interaction patterns (modal, inline, drawer)
   - Visual expression

5. **Review** — open `http://localhost:3000/__design_lab` (or your dev server port) to see all variations side-by-side

6. **Feedback** — tell Claude:
   - If one is already good → select it, make minor tweaks
   - If you like parts of different ones → describe what you like about each, get a synthesized version

7. **Iterate** — repeat until you're confident

8. **Finalize** — all temp files are deleted, `DESIGN_PLAN.md` is generated with implementation steps

### Clean up manually (if needed)

```
/design-and-refine:cleanup
```

---

## Supported Frameworks

- Next.js (App Router & Pages Router)
- Vite (React, Vue)
- Remix
- Astro
- Create React App

## Supported Styling

- Tailwind CSS
- CSS Modules
- Material UI (MUI)
- Chakra UI
- Ant Design
- styled-components
- Emotion

---

## Tips for Best Results

**Be specific in the interview.** The more context you give about pain points, target users, and inspiration, the more distinct and useful the variations will be.

**Reference products you admire.** "Like Linear's density" or "Stripe's clarity" gives Claude concrete direction.

**Don't settle on round one.** The synthesis step is where it gets good—describe what you like about each variant and let it combine them.

**Keep your dev server running.** The plugin won't start it for you (that would block). Just have it running in another terminal.

**Check the DESIGN_PLAN.md.** After finalizing, this file contains the implementation steps, component API, accessibility checklist, and testing guidance.

---

## What Gets Created (Temporarily)

During the session:
- `.claude-design/` — variants, previews, design brief
- `app/__design_lab/` or `pages/__design_lab.tsx` — the comparison route

All of this is deleted when you finalize or abort. Nothing is left behind.

## What Gets Created (Permanently)

After finalizing:
- `DESIGN_PLAN.md` — implementation plan for your chosen design
- `DESIGN_MEMORY.md` — captured style decisions (speeds up future sessions)

---

## License

MIT

---

Made by [0xdesigner](https://github.com/0xdesign)
