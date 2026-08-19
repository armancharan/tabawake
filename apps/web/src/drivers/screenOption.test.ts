import { describe, expect, it } from "vitest"
import { screenOptionState } from "./screenOption"

const copy = {
  unsupportedMessage: "Not available in this browser. Use Video.",
  blockedMessage:
    "Browser blocked Screen lock. Allow wake lock for this site, then try again — or use Video.",
  driverMessage: "Couldn’t start Screen lock. Try again, or use Video.",
}

describe("screenOptionState", () => {
  it("disables when the API is missing and never offers retry", () => {
    expect(
      screenOptionState({
        apiPresent: false,
        failure: null,
        selected: true,
        ...copy,
      }),
    ).toEqual({
      disabled: true,
      selected: false,
      prompt: copy.unsupportedMessage,
      showRetry: false,
    })
  })

  it("disables after permission_denied and offers retry", () => {
    expect(
      screenOptionState({
        apiPresent: true,
        failure: "permission_denied",
        selected: true,
        ...copy,
      }),
    ).toEqual({
      disabled: true,
      selected: false,
      prompt: copy.blockedMessage,
      showRetry: true,
    })
  })

  it("disables after driver_error and offers retry", () => {
    const state = screenOptionState({
      apiPresent: true,
      failure: "driver_error",
      selected: false,
      ...copy,
    })
    expect(state.disabled).toBe(true)
    expect(state.showRetry).toBe(true)
    expect(state.prompt).toBe(copy.driverMessage)
  })

  it("stays selectable when the API is present and there is no failure", () => {
    expect(
      screenOptionState({
        apiPresent: true,
        failure: null,
        selected: true,
        ...copy,
      }),
    ).toEqual({
      disabled: false,
      selected: true,
      prompt: null,
      showRetry: false,
    })
  })
})
