#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

rm -f "${REPO_ROOT}/character-readings.csv"
rm -f "${REPO_ROOT}/testing/character-readings-with-lmc.csv"
rm -f "${REPO_ROOT}/webapp/public/character-readings.csv"
rm -f "${REPO_ROOT}/webapp/public/character-readings-with-lmc.csv"

rm -rf "${SCRIPT_DIR}/node_modules"
rm -rf "${REPO_ROOT}/output"
rm -rf "${REPO_ROOT}/work"

while IFS= read -r -d '' csv_path; do
  rm -f "${csv_path}"
done < <(find "${REPO_ROOT}" -type f -name '*.csv' -print0)
