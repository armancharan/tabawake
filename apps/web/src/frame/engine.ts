/**
 * WASM frame engine — the only timer painter.
 * Fails loudly if the staged bindgen module is missing.
 */

export type FrameEngine = {
  renderFrame: (
    width: number,
    height: number,
    tMs: number,
    fidelity: number,
  ) => Uint8Array
  frameByteLen: (width: number, height: number) => number
}

type BindgenModule = {
  default: (input?: {
    module_or_path?: RequestInfo | URL | Response | BufferSource | WebAssembly.Module
  }) => Promise<unknown>
  renderFrame: (
    width: number,
    height: number,
    tMs: number,
    fidelity: number,
  ) => Uint8Array
  frameByteLen: (width: number, height: number) => number
}

let enginePromise: Promise<FrameEngine> | null = null

/** Load and memoize the Rust/WASM frame engine. */
export function loadFrameEngine(): Promise<FrameEngine> {
  if (!enginePromise) {
    enginePromise = (async () => {
      const mod = (await import("../generated/frame_engine.js")) as BindgenModule
      await mod.default()
      return {
        renderFrame: mod.renderFrame,
        frameByteLen: mod.frameByteLen,
      }
    })().catch((err) => {
      enginePromise = null
      throw err
    })
  }
  return enginePromise
}
