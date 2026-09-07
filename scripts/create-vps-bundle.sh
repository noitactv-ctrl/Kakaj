#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/release"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
OUTPUT_FILE="${1:-$OUTPUT_DIR/turtlecc-vps-$STAMP.tar.gz}"

for command_name in tar sha256sum; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "$command_name is required to create a clean source bundle." >&2
    exit 1
  fi
done

if [ ! -f "$ROOT_DIR/.env.example" ]; then
  echo "The project is missing .env.example." >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT_FILE")"
rm -f "$OUTPUT_FILE"

STAGING_DIR="$(mktemp -d)"
trap 'rm -rf "$STAGING_DIR"' EXIT

# Stage the working tree rather than only Git-tracked files so a newly added
# deployment helper is included before the user commits it. Secret and
# workspace-only paths are excluded at the source tar step.
tar \
  --create \
  --directory "$ROOT_DIR" \
  --exclude="./.git" \
  --exclude="./.local" \
  --exclude="./.agents" \
  --exclude="./.config" \
  --exclude="./.cache" \
  --exclude="./.replit" \
  --exclude="./exports" \
  --exclude="./attached_assets" \
  --exclude="./node_modules" \
  --exclude="./dist" \
  --exclude="./release" \
  --exclude="./.env" \
  --exclude="./.env.*" \
  --exclude="./*.tar.gz" \
  --exclude="./*.dump" \
  --exclude="./*.sql" \
  --file=- . \
  | tar --extract --directory "$STAGING_DIR" --file=-

# .env.example is safe documentation, but it matches the secret-file exclusion
# above, so add it back explicitly.
cp "$ROOT_DIR/.env.example" "$STAGING_DIR/.env.example"

tar \
  --create \
  --gzip \
  --file "$OUTPUT_FILE" \
  --directory "$STAGING_DIR" \
  .

chmod 600 "$OUTPUT_FILE"
printf 'Created VPS bundle: %s\n' "$OUTPUT_FILE"
printf 'SHA-256: '
sha256sum "$OUTPUT_FILE" | awk '{print $1}'
printf '\nThe bundle contains source and deployment files only; it does not contain .env, databases, node_modules, dist, or Replit metadata.\n'