import { describe, expect, it } from "vitest"
import { detectRuntime } from "./runtime"

describe("detectRuntime", () => {
  it("treats a plain window as web", () => {
    expect(detectRuntime({})).toBe("web")
  })

  it("treats a Tauri internals host as desktop", () => {
    expect(detectRuntime({ __TAURI_INTERNALS__: {} })).toBe("desktop")
  })
})
