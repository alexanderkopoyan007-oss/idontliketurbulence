#!/bin/bash
# Is the basemap still serving real tiles?
#
# A dead tile source does not announce itself. CARTO's dark_all answered 200
# with a valid 256x256 image long after it stopped carrying any map — the
# same 2,513-byte blank everywhere on earth. Leaflet saw every tile load.
#
# So this does not ask "did it respond". It fetches three tiles over wildly
# different ground and asks whether they DIFFER. Real tiles vary with the
# geography under them; a placeholder is identical everywhere.
set -u

BASE="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile"
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
fail=0

# z/x/y — whole world, western Europe, central London
for t in "2/2/1" "5/16/10" "6/32/21"; do
  z=${t%%/*}; rest=${t#*/}; x=${rest%%/*}; y=${rest##*/}
  f="$TMP/$z.img"
  code=$(curl -s -m 25 -o "$f" -w "%{http_code}" "$BASE/$z/$y/$x")
  size=$(wc -c < "$f" | tr -d ' ')
  printf "  z%-2s  HTTP %s  %7s bytes\n" "$z" "$code" "$size"
  [ "$code" = "200" ] || fail=1
done

distinct=$(shasum -a1 "$TMP"/*.img | awk '{print $1}' | sort -u | wc -l | tr -d ' ')
echo
if [ "$fail" = 1 ]; then
  echo "FAIL — the tile server did not answer 200."
  exit 1
elif [ "$distinct" -lt 3 ]; then
  echo "FAIL — only $distinct distinct tile(s) across three unrelated places."
  echo "       The source is answering with a placeholder. The map will be blank."
  echo "       Pick a new free basemap and change addBasemap() in src/core.js."
  exit 1
else
  echo "OK — 3 distinct tiles. The basemap is carrying real map data."
fi
