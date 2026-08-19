#!/usr/bin/env bash
# If Bazel has not staged wasm-bindgen output yet, copy the committed stub so
# Vite can resolve `../generated/frame_engine.js` on a clean checkout.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${ROOT}/apps/web/src/generated"
STUB="${DEST}/frame_engine.stub.js"
TARGET="${DEST}/frame_engine.js"

if [[ -f "${TARGET}" ]]; then
  exit 0
fi

if [[ ! -f "${STUB}" ]]; then
  echo "missing ${STUB}" >&2
  exit 1
fi

cp "${STUB}" "${TARGET}"
echo "copied stub → ${TARGET}"
