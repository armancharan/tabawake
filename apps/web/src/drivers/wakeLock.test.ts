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
  describe("when the runtime is web", () => {
    describe("when unsupported", () => {
      it("says not available in the browser", () => {
        const message = wakeLockUserMessage("unsupported")
        expect(message).toMatch(/not available/i)
        expect(message).toMatch(/browser/i)
      })
    })

    describe("when permission is denied", () => {
      it("names this site", () => {
        const message = wakeLockUserMessage("permission_denied")
        expect(message).toMatch(/blocked/i)
        expect(message).toMatch(/this site/i)
      })
    })

    describe("when the driver fails", () => {
      it("asks to try again", () => {
        expect(wakeLockUserMessage("driver_error")).toMatch(/try again/i)
      })
    })
  })

  describe("when the runtime is desktop", () => {
    describe("when unsupported", () => {
      it("names the window and drops browser", () => {
        const message = wakeLockUserMessage("unsupported", "desktop")
        expect(message).toMatch(/this window/i)
        expect(message).not.toMatch(/browser/i)
      })
    })

    describe("when permission is denied", () => {
      it("names the window and drops this site", () => {
        const message = wakeLockUserMessage("permission_denied", "desktop")
        expect(message).toMatch(/the window/i)
        expect(message).not.toMatch(/this site/i)
      })
    })
  })
})
