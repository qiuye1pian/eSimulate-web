#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required. Please install Node.js first."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

API_PROXY_TARGET="${1:-${VITE_API_PROXY_TARGET:-http://39.97.247.145:8080}}"
export VITE_API_PROXY_TARGET="$API_PROXY_TARGET"

echo "Starting eSimulate web at http://localhost:5173"
echo "Proxying /api requests to $VITE_API_PROXY_TARGET"
npm run dev -- --host 0.0.0.0
