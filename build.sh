#!/bin/bash
# Ride Report — concatenate src/ back into the single deployable www/index.html.
#
# The single file is a deliberate property, not an accident: no build step is
# needed to run the app, it deploys to any static host, and it can be opened
# from disk. This script exists so the source can be edited in pieces, not so
# the output can stop being one file.
#
# Each module is emitted as its own <script> block, in order. That is not
# cosmetic — top-level const/let in classic scripts share one global lexical
# environment, so the block boundaries are already load-bearing for scoping and
# for the "use strict" directive each module carries. Merging them would change
# behaviour; keeping them does not.
#
# Usage:  ./build.sh [--check]
#   --check  build to a temp file and diff against the committed www/index.html
#            (exit 1 on any difference) instead of overwriting it.

set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Order matters: data before core (core parses the raw tables at load), core
# before everything, ui last apart from the native bridge.
#
# Each entry is one <script> block. An entry with several files concatenates
# them into that single block — which is why the two data tables live in
# separate source files but ship inside one block: "use strict" is declared once
# at the top of the block, and splitting them would silently drop the second
# file into sloppy mode.
BLOCKS=(
  "src/data/airports.js src/data/airlines.js"
  "src/core.js"
  "src/engine.js"
  "src/analyse.js"
  "src/render.js"
  "src/xsection.js"
  "src/panels.js"
  "src/astro.js"
  "src/seeing.js"
  "src/ui.js src/share.js src/calm.js src/jetlag.js src/seeingview.js src/native.js"
)

ALL_FILES=(src/shell/head.html src/styles.css src/shell/body.html src/shell/foot.html)
for block in "${BLOCKS[@]}"; do
  for f in $block; do ALL_FILES+=("$f"); done
done
for f in "${ALL_FILES[@]}"; do
  [ -f "$f" ] || { echo "build: missing $f" >&2; exit 1; }
done

OUT="www/index.html"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

{
  cat src/shell/head.html
  printf '<style>\n'
  cat src/styles.css
  printf '</style>\n'
  cat src/shell/body.html
  for block in "${BLOCKS[@]}"; do
    printf '<script>\n'
    for m in $block; do cat "$m"; done
    printf '</script>\n'
  done
  cat src/shell/foot.html
} > "$TMP"

if [ "${1:-}" = "--check" ]; then
  if diff -q "$TMP" "$OUT" >/dev/null 2>&1; then
    echo "build --check: $OUT is up to date ($(wc -c < "$TMP" | tr -d ' ') bytes)"
  else
    echo "build --check: $OUT differs from a fresh build of src/" >&2
    diff "$OUT" "$TMP" | head -40 >&2
    exit 1
  fi
else
  mv "$TMP" "$OUT"
  trap - EXIT
  echo "built $OUT ($(wc -c < "$OUT" | tr -d ' ') bytes, ${#ALL_FILES[@]} source files, ${#BLOCKS[@]} script blocks)"
fi
