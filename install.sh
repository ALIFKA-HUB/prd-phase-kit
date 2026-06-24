#!/usr/bin/env bash
# PRD Phase Kit installer shim — runs the Node installer via npx (no clone needed).
#   curl -fsSL https://raw.githubusercontent.com/ALIFKA-HUB/prd-phase-kit/main/install.sh | bash
# Pass installer flags through:  ... | bash -s -- --all
set -euo pipefail

REPO="github:ALIFKA-HUB/prd-phase-kit"

if ! command -v node >/dev/null 2>&1; then
  echo "PRD Phase Kit needs Node.js >= 18. Install it from https://nodejs.org and retry." >&2
  exit 1
fi

if command -v npx >/dev/null 2>&1; then
  exec npx -y "$REPO" "$@"
fi

echo "npx not found. Install Node.js (which ships npx) from https://nodejs.org." >&2
exit 1