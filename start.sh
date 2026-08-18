#!/bin/bash
# Ride Report — serve www/ locally and open it in the browser.
# Uses the ruby that ships with macOS; no installs required.

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-8080}"
LOG="$DIR/.server.log"

if ! nc -z 127.0.0.1 "$PORT" 2>/dev/null; then
  if command -v ruby >/dev/null 2>&1 && ruby -e '' >/dev/null 2>&1; then
    PORT="$PORT" nohup ruby "$DIR/serve.rb" >"$LOG" 2>&1 &
  elif command -v python3 >/dev/null 2>&1 && python3 -c '' >/dev/null 2>&1; then
    ( cd "$DIR/www" && nohup python3 -m http.server "$PORT" --bind 127.0.0.1 >"$LOG" 2>&1 & )
  elif command -v npx >/dev/null 2>&1; then
    ( cd "$DIR" && nohup npx http-server www -p "$PORT" -c-1 >"$LOG" 2>&1 & )
  else
    echo "No ruby, python3 or node available to serve with." >&2
    echo "Falling back to opening the file directly (no offline shell, no install prompt)." >&2
    open "$DIR/www/index.html"
    exit 0
  fi
  echo $! > "$DIR/.server.pid"

  for _ in $(seq 1 60); do nc -z 127.0.0.1 "$PORT" 2>/dev/null && break; sleep 0.1; done

  if ! nc -z 127.0.0.1 "$PORT" 2>/dev/null; then
    echo "Server did not come up. Last output:" >&2
    tail -5 "$LOG" >&2
    exit 1
  fi
fi

echo "Running at http://localhost:$PORT"

# --tunnel publishes the local ADS-B proxy at a public HTTPS address.
#
# Live traffic on the deployed site needs this. The proxy has to egress from an
# ordinary address — every free ADS-B source refuses Cloudflare's, so the Worker
# cannot do it — and an HTTPS page cannot reach http://localhost. A tunnel gives
# a public HTTPS front door that forwards here, so the outbound request still
# leaves from this machine.
if [ "${1:-}" = "--tunnel" ]; then
  if ! command -v cloudflared >/dev/null 2>&1; then
    echo "cloudflared not installed. Get it from https://github.com/cloudflare/cloudflared/releases" >&2
    exit 1
  fi
  echo "Opening a tunnel…"
  TLOG="$DIR/.tunnel.log"
  : > "$TLOG"
  nohup cloudflared tunnel --url "http://localhost:$PORT" --no-autoupdate > "$TLOG" 2>&1 &
  echo $! > "$DIR/.tunnel.pid"
  for _ in $(seq 1 40); do
    TURL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$TLOG" | head -1)
    [ -n "$TURL" ] && break
    sleep 1
  done
  if [ -n "$TURL" ]; then
    echo
    echo "  Tunnel: $TURL"
    echo
    echo "  Paste that into the Area view on the deployed site to enable live traffic."
    echo "  The address changes each time; it is remembered in the browser until it does."
  else
    echo "Tunnel did not come up. Last output:" >&2
    tail -5 "$TLOG" >&2
  fi
fi

open "http://localhost:$PORT"
