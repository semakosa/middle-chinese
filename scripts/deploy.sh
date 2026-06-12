#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

npm install --prefix "${SCRIPT_DIR}"
mkdir -p "${REPO_ROOT}/testing/rules"
node "${SCRIPT_DIR}/export-character-readings.mjs" "${REPO_ROOT}/character-readings.csv"
node "${SCRIPT_DIR}/export-character-readings.mjs" "${REPO_ROOT}/testing/character-readings-with-lmc.csv" with-lmc
mkdir -p "${REPO_ROOT}/webapp/public"
cp "${REPO_ROOT}/character-readings.csv" "${REPO_ROOT}/webapp/public/character-readings.csv"
cp "${REPO_ROOT}/testing/character-readings-with-lmc.csv" "${REPO_ROOT}/webapp/public/character-readings-with-lmc.csv"
