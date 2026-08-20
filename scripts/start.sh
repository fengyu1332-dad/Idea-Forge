#!/bin/bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."
exec pnpm next start -p "${PORT:-5000}"
