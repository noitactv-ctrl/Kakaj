#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/release"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
OUTPUT_FILE="${1:-$OUTPUT_DIR/turtlecc-vps-$STAMP.tar.gz}"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required to create a clean source bundle." >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT_FILE")"
rm -f "$OUTPUT_FILE"

(
  cd "$ROOT_DIR"
  git ls-files -z -- \
    ':!.agents/**' \
    ':!.local/**' \
    ':!release/**' \
    | tar \
      --create \
      --gzip \
      --file "$OUTPUT_FILE" \
      --directory "$ROOT_DIR" \
      --null \
      --files-from -
)

chmod 600 "$OUTPUT_FILE"
printf 'Created VPS bundle: %s\n' "$OUTPUT_FILE"
printf 'SHA-256: '
sha256sum "$OUTPUT_FILE" | awk '{print $1}'
printf '\nThe bundle contains source and deployment files only; it does not contain .env, databases, node_modules, dist, or Replit metadata.\n'