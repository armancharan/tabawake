/**
 * Stub replaced by `pnpm wasm:stage` (Bazel wasm-bindgen output).
 * Keeps Vite import analysis happy before the real artifacts exist.
 */
export function frameByteLen(width, height) {
  return width * height * 4
}

export function renderFrame(width, height, tMs, _fidelity = 0) {
  const out = new Uint8Array(width * height * 4)
  const phase = tMs * 0.001
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / width
      const sweep = (u + phase * 0.15) % 1
      const ribbon = 1 - Math.min(1, Math.abs(sweep - 0.5) * 8)
      const i = (y * width + x) * 4
      out[i] = 18 + ribbon * 90
      out[i + 1] = 20 + ribbon * 140
      out[i + 2] = 24 + ribbon * 100
      out[i + 3] = 255
    }
  }
  return out
}

export default async function init() {
  console.info("[tabawake] using stub frame_engine — run `pnpm wasm:stage` for Rust/WASM")
}
