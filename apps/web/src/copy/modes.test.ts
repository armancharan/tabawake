import { describe, expect, it } from "vitest"
import { modeCopy } from "./modes"

describe("modeCopy", () => {
  describe("when the runtime is web", () => {
    it("names the browser for screen and video", () => {
      expect(modeCopy("web", "screen").blurbHtml).toMatch(/browser/)
      expect(modeCopy("web", "generated").blurbHtml).toMatch(/browser/)
    })
  })

  describe("when the runtime is desktop", () => {
    it("names the webview and drops browser", () => {
      expect(modeCopy("desktop", "screen").blurbHtml).toMatch(/webview/)
      expect(modeCopy("desktop", "screen").blurbHtml).not.toMatch(/browser/)
      expect(modeCopy("desktop", "generated").blurbHtml).toMatch(/webview/)
    })
  })
})
