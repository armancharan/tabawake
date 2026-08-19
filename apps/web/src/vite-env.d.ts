/// <reference types="vite/client" />

declare module "*.css" {
  const css: string
  export default css
}

declare module "*.wasm" {
  const url: string
  export default url
}

declare module "../generated/frame_engine.js" {
  const init: (input?: {
    module_or_path?: RequestInfo | URL | Response | BufferSource | WebAssembly.Module
  }) => Promise<unknown>
  export function renderFrame(
    width: number,
    height: number,
    tMs: number,
    fidelity: number,
  ): Uint8Array
  export function frameByteLen(width: number, height: number): number
  export default init
}

declare module "../../generated/frame_engine.js" {
  const init: (input?: {
    module_or_path?: RequestInfo | URL | Response | BufferSource | WebAssembly.Module
  }) => Promise<unknown>
  export function renderFrame(
    width: number,
    height: number,
    tMs: number,
    fidelity: number,
  ): Uint8Array
  export function frameByteLen(width: number, height: number): number
  export default init
}
