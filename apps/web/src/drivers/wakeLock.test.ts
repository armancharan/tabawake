import { describe, expect, it } from "vitest"
import {
  classifyWakeLockError,
  wakeLockSupported,
  wakeLockUserMessage,
} from "./wakeLock"

describe("wakeLockSupported", () => {
  it("is false when the API is missing", () => {
    expect(wakeLockSupported({} as Navigator)).toBe(false)
    expect(
      wakeLockSupported({ wakeLock: undefined } as unknown as Navigator),
    ).toBe(false)
  })

  it("is true when navigator.wakeLock exists", () => {
    expect(
      wakeLockSupported({
        wakeLock: { request: async () => ({}) },
      } as unknown as Navigator),
    ).toBe(true)
  })
})

describe("classifyWakeLockError", () => {
  it("treats missing API as unsupported regardless of error shape", () => {
    expect(classifyWakeLockError(new Error("nope"), false)).toBe("unsupported")
  })

  it("maps reason and NotAllowedError to permission_denied", () => {
    expect(
      classifyWakeLockError(
        Object.assign(new Error("blocked"), { reason: "permission_denied" }),
        true,
      ),
    ).toBe("permission_denied")
    expect(
      classifyWakeLockError(
        new DOMException("Not allowed", "NotAllowedError"),
        true,
      ),
    ).toBe("permission_denied")
  })

  it("maps other failures to driver_error", () => {
    expect(classifyWakeLockError(new Error("boom"), true)).toBe("driver_error")
  })
})

describe("wakeLockUserMessage", () => {
  it("explains unsupported, blocked, and generic failures", () => {
    expect(wakeLockUserMessage("unsupported")).toMatch(/not available/i)
    expect(wakeLockUserMessage("unsupported")).toMatch(/browser/i)
    expect(wakeLockUserMessage("permission_denied")).toMatch(/blocked/i)
    expect(wakeLockUserMessage("permission_denied")).toMatch(/this site/i)
    expect(wakeLockUserMessage("driver_error")).toMatch(/try again/i)
  })

  it("drops site and browser language on desktop", () => {
    expect(wakeLockUserMessage("unsupported", "desktop")).toMatch(/this window/i)
    expect(wakeLockUserMessage("unsupported", "desktop")).not.toMatch(/browser/i)
    expect(wakeLockUserMessage("permission_denied", "desktop")).toMatch(
      /the window/i,
    )
    expect(wakeLockUserMessage("permission_denied", "desktop")).not.toMatch(
      /this site/i,
    )
  })
})
