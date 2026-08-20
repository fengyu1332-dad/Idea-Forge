#!/bin/bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."
exec pnpm next dev -p "${PORT:-5000}"
