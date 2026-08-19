import { describe, expect, it } from "vitest"
import { modeCopy } from "./modes"

describe("modeCopy", () => {
  it("keeps web sentences about the browser and a future desktop app", () => {
    expect(modeCopy("web", "screen").blurbHtml).toMatch(/browser/)
    expect(modeCopy("web", "generated").blurbHtml).toMatch(/browser/)
    expect(modeCopy("web", "system").blurbHtml).toBe("Coming in the desktop app.")
    expect(modeCopy("web", "presence").blurbHtml).toBe(
      "Coming in the desktop app.",
    )
  })

  it("drops website language on desktop", () => {
    expect(modeCopy("desktop", "screen").blurbHtml).toMatch(/webview/)
    expect(modeCopy("desktop", "screen").blurbHtml).not.toMatch(/browser/)
    expect(modeCopy("desktop", "generated").blurbHtml).toMatch(/webview/)
    expect(modeCopy("desktop", "presence").blurbHtml).toBe("Not in this build.")
    expect(modeCopy("desktop", "system").blurbHtml).toMatch(
      /PreventUserIdleSystemSleep/,
    )
    expect(modeCopy("desktop", "system").blurbHtml).toMatch(/hidden/)
  })
})
