import type { AppRuntime } from "@tabawake/core"

/** True when the page is hosted by a Tauri webview. */
export function detectRuntime(host: object = globalThis): AppRuntime {
  return "__TAURI_INTERNALS__" in host ? "desktop" : "web"
}
