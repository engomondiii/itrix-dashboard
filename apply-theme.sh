#!/usr/bin/env bash
# =============================================================================
# itriX DASHBOARD — apply "Mathematical Glass Intelligence" (Brand Bible v1.2)
# =============================================================================
# WHAT THIS DOES
#   Copies the theme-layer files in this archive into their exact locations
#   inside itrix-dashboard, overwriting the Atelier Indigo versions. It changes
#   ONLY colors / fonts / tokens — no architecture, routes, or component logic.
#
# HOW TO RUN
#   1. Put this archive (itrix-dashboard-theme-v1.2.zip) in the itrix-dashboard
#      PROJECT ROOT (the folder that contains package.json and src/).
#   2. From that project root, run:
#         unzip -o itrix-dashboard-theme-v1.2.zip && bash apply-theme.sh
#
#   The unzip expands a `theme-payload/` folder next to this script; the script
#   copies from there into ./src and ./public.
#
# SAFETY
#   Every file it overwrites is first backed up to ./.theme-backup-<timestamp>/.
#   A one-line restore command is printed at the end.
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAYLOAD_DIR="$SCRIPT_DIR/theme-payload"
PROJECT_ROOT="$(pwd)"

# --- sanity: are we in the itrix-dashboard project root? -----------------------
if [[ ! -f "$PROJECT_ROOT/package.json" || ! -d "$PROJECT_ROOT/src" ]]; then
  echo "ERROR: run this from the itrix-dashboard project root (must contain package.json and src/)." >&2
  echo "       current dir: $PROJECT_ROOT" >&2
  exit 1
fi
if [[ ! -d "$PAYLOAD_DIR" ]]; then
  echo "ERROR: theme-payload/ not found next to this script." >&2
  echo "       Did you unzip the archive in the project root first?" >&2
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$PROJECT_ROOT/.theme-backup-$STAMP"

# The exact set of files shipped by this theme (relative to project root).
FILES=(
  "src/app/globals.css"
  "src/app/layout.tsx"
  "src/lib/export/report.ts"
  "public/fonts/README.md"
)

echo "itriX dashboard theme apply — Mathematical Glass Intelligence (Brand Bible v1.2)"
echo "project root : $PROJECT_ROOT"
echo "backup dir   : $BACKUP_DIR"
echo

copied=0
for rel in "${FILES[@]}"; do
  src="$PAYLOAD_DIR/$rel"
  dest="$PROJECT_ROOT/$rel"

  if [[ ! -f "$src" ]]; then
    echo "SKIP (missing in payload): $rel" >&2
    continue
  fi

  if [[ -f "$dest" ]]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$rel")"
    cp -p "$dest" "$BACKUP_DIR/$rel"
  fi

  mkdir -p "$(dirname "$dest")"
  cp -f "$src" "$dest"
  echo "applied: $rel"
  copied=$((copied + 1))
done

echo
echo "Done. $copied files applied."
if [[ -d "$BACKUP_DIR" ]]; then
  echo "Originals backed up in: $BACKUP_DIR"
  echo "To restore:  cp -R \"$BACKUP_DIR\"/. \"$PROJECT_ROOT\"/"
fi
echo
echo "Next steps:"
echo "  1) rm -rf .next        # clear the build cache so tokens re-generate"
echo "  2) npm install         # (only if you don't already have deps)"
echo "  3) npm run dev         # verify the new Glass theme renders"
