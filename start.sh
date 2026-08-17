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

echo "Ride Report running at http://localhost:$PORT"
open "http://localhost:$PORT"
