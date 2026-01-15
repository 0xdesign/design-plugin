---
description: Remove all temporary design lab files created during a design-and-refine session
---

# Cleanup Command

Manually clean up all temporary files created during a design-and-refine session.

## Usage

```
/design-and-refine:cleanup
```

## What This Does

Removes all temporary files and directories created during design exploration:

1. **`.claude-design/`** - The main temporary directory containing:
   - Design lab variants
   - Preview files
   - Design brief JSON
   - Run logs

2. **Temporary routes:**
   - `app/__design_lab/` (Next.js App Router)
   - `app/__design_preview/` (Next.js App Router)
   - `pages/__design_lab.tsx` (Next.js Pages Router)
   - `pages/__design_preview.tsx` (Next.js Pages Router)

3. **Any App.tsx modifications** (for Vite projects without routers)

## Instructions

When this command is invoked:

1. Check if `.claude-design/` directory exists
2. If it exists, list the contents and ask for confirmation before deleting
3. Check for temporary route files in common locations
4. Delete confirmed files
5. Report what was deleted

**Safety rules:**
- ONLY delete files inside `.claude-design/`
- ONLY delete route files that match the plugin's naming pattern (`__design_lab`, `__design_preview`)
- Always confirm with the user before deleting
- Never delete user-authored files
