#!/bin/bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."
pnpm install --frozen-lockfile
