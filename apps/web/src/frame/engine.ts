/**
 * WASM frame engine — the only timer painter.
 * Fails loudly if the staged bindgen module is missing.
 */

export type FrameEngine = {
  frameByteLen: (width: number, height: number) => number
  renderFrame: (
    width: number,
    height: number,
    tMs: number,
    fidelity: number,
  ) => Uint8Array
}

type BindgenModule = {
  default: (input?: {
    module_or_path?: RequestInfo | URL | Response | BufferSource | WebAssembly.Module
  }) => Promise<unknown>
  frameByteLen: (width: number, height: number) => number
  renderFrame: (
    width: number,
    height: number,
    tMs: number,
    fidelity: number,
  ) => Uint8Array
}

let enginePromise: Promise<FrameEngine> | null = null

/** Load and memoize the Rust/WASM frame engine. */
export function loadFrameEngine(): Promise<FrameEngine> {
  if (!enginePromise) {
    enginePromise = (async () => {
      const mod = (await import("../generated/frame_engine.js")) as BindgenModule
      await mod.default()
      return {
        frameByteLen: mod.frameByteLen,
        renderFrame: mod.renderFrame,
      }
    })().catch((err) => {
      enginePromise = null
      throw err
    })
  }
  return enginePromise
}
