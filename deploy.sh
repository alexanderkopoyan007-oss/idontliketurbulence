#!/bin/bash
# Build and publish. Two targets, deliberately separate:
#   www/    -> Cloudflare Pages  (the site people visit)
#   server/ -> Cloudflare Worker (the observation API)
#
# The Worker is only redeployed with --api, because the site changes far more
# often than the endpoint does and there is no reason to churn the API for a
# copy edit.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"
export PATH="$HOME/.local/bin:$PATH"

./build.sh
./build.sh --check

if [ "${1:-}" = "--api" ]; then
  echo "→ deploying the Worker"
  (cd server && npx wrangler deploy)
fi

echo "→ deploying the site"
npx wrangler pages deploy www --project-name=idontliketurbulence --commit-dirty=true
