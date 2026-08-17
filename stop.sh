#!/bin/bash
# Stop the local Ride Report server.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
stopped=0

if [ -f "$DIR/.server.pid" ]; then
  kill "$(cat "$DIR/.server.pid")" 2>/dev/null && stopped=1
  rm -f "$DIR/.server.pid"
fi

# Catch a server started by an earlier run whose pid file is gone.
pkill -f "$DIR/serve.rb" 2>/dev/null && stopped=1

[ "$stopped" = 1 ] && echo "Stopped." || echo "Not running."
