#!/bin/bash

# Design Variations Plugin - Cleanup Check Script
# This runs on session end to check for leftover temporary files

# Check if .claude-design directory exists in current project
if [ -d ".claude-design" ]; then
    echo "[Design Lab] Warning: Temporary design files found in .claude-design/"
    echo "[Design Lab] Run '/design-and-refine:cleanup' to remove them, or delete manually."
fi

# Check for leftover route files (Next.js)
if [ -d "app/__design_lab" ] || [ -d "app/__design_preview" ]; then
    echo "[Design Lab] Warning: Temporary route directories found in app/"
fi

if [ -f "pages/__design_lab.tsx" ] || [ -f "pages/__design_preview.tsx" ]; then
    echo "[Design Lab] Warning: Temporary route files found in pages/"
fi

# Check for feedback JSON files (downloaded backups from interactive feedback)
feedback_files=$(find . -maxdepth 2 -name "feedback-*.json" -type f 2>/dev/null)
if [ -n "$feedback_files" ]; then
    echo "[Design Lab] Note: Found feedback backup files:"
    echo "$feedback_files" | while read -r file; do
        echo "  - $file"
    done
    echo "[Design Lab] These can be safely deleted after reviewing."
fi

exit 0
