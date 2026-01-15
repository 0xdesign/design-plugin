#!/bin/bash

# Design Variations Plugin - Cleanup Check Script
# This runs on session end to check for leftover temporary files

# Check if .claude-design directory exists in current project
if [ -d ".claude-design" ]; then
    echo "[Design Variations] Warning: Temporary design files found in .claude-design/"
    echo "[Design Variations] Run '/design-variations:cleanup' to remove them, or delete manually."
fi

# Check for leftover route files (Next.js)
if [ -d "app/__design_lab" ] || [ -d "app/__design_preview" ]; then
    echo "[Design Variations] Warning: Temporary route directories found in app/"
fi

if [ -f "pages/__design_lab.tsx" ] || [ -f "pages/__design_preview.tsx" ]; then
    echo "[Design Variations] Warning: Temporary route files found in pages/"
fi

exit 0
