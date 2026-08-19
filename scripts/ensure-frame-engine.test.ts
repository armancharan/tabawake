import { FileSystem } from "@effect/platform"
import { NodeContext } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { resolve } from "node:path"
import { ensureFrameEngine } from "./ensure-frame-engine.ts"

it.layer(NodeContext.layer)("ensureFrameEngine", (it) => {
  describe("when the target is missing", () => {
    it.effect("copies the stub", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem
        const dest = yield* fs.makeTempDirectory({ prefix: "tabawake-ensure-" })
        const stub = resolve(dest, "frame_engine.stub.js")
        const target = resolve(dest, "frame_engine.js")
        yield* fs.writeFileString(stub, "export const stub = true\n")

        const result = yield* ensureFrameEngine({ dest, stub, target })
        const body = yield* fs.readFileString(target)

        expect(result).toBe("copied")
        expect(body).toContain("export const stub = true")
      }),
    )
  })

  describe("when the target already exists", () => {
    it.effect("is a no-op", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem
        const dest = yield* fs.makeTempDirectory({ prefix: "tabawake-ensure-" })
        const stub = resolve(dest, "frame_engine.stub.js")
        const target = resolve(dest, "frame_engine.js")
        yield* fs.writeFileString(target, "export const existing = true\n")

        const result = yield* ensureFrameEngine({ dest, stub, target })
        const body = yield* fs.readFileString(target)

        expect(result).toBe("exists")
        expect(body).toContain("export const existing = true")
      }),
    )
  })

  describe("when the stub is missing", () => {
    it.effect("fails", () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem
        const dest = yield* fs.makeTempDirectory({ prefix: "tabawake-ensure-" })
        const error = yield* ensureFrameEngine({
          dest,
          stub: resolve(dest, "frame_engine.stub.js"),
          target: resolve(dest, "frame_engine.js"),
        }).pipe(Effect.flip)

        expect(error.message).toMatch(/missing/)
      }),
    )
  })
})
