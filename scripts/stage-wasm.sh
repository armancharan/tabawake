#!/usr/bin/env bash
# Stage Bazel-built wasm-bindgen outputs into apps/web/src/generated for Vite.
# (Vite forbids importing modules from /public.)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

echo "Building //crates/frame_engine:frame_engine_web ..."
bazelisk build //crates/frame_engine:frame_engine_web

OUT="$(bazelisk info bazel-bin)/crates/frame_engine/frame_engine_web"
DEST="${ROOT}/apps/web/src/generated"
mkdir -p "${DEST}"
# Bazel outputs are often mode 555; make the staging dir writable first.
chmod -R u+w "${DEST}" 2>/dev/null || true

copied=0
stage_one() {
  local src="$1"
  if [[ -f "${src}" ]]; then
    cp -f "${src}" "${DEST}/"
    echo "staged $(basename "${src}")"
    copied=1
  fi
}

stage_one "${OUT}/frame_engine.js"
stage_one "${OUT}/frame_engine_bg.wasm"
stage_one "${OUT}/frame_engine.d.ts"
stage_one "${OUT}/frame_engine_bg.wasm.d.ts"

if [[ "${copied}" -eq 0 ]]; then
  echo "Exact names missing; listing ${OUT}:" >&2
  ls -la "${OUT}" >&2 || true
  exit 1
fi

# Drop stale public copies from the earlier layout.
rm -f \
  "${ROOT}/apps/web/public/frame_engine.js" \
  "${ROOT}/apps/web/public/frame_engine_bg.wasm" \
  "${ROOT}/apps/web/public/frame_engine.d.ts" \
  "${ROOT}/apps/web/public/frame_engine_bg.wasm.d.ts"

echo "Done → ${DEST}"
