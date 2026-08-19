import { FileSystem } from "@effect/platform"
import { NodeContext } from "@effect/platform-node"
import { expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { resolve } from "node:path"
import { ensureFrameEngine } from "./ensure-frame-engine.ts"

it.layer(NodeContext.layer)("ensureFrameEngine", (it) => {
  it.effect("copies the stub when the target is missing", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const dest = yield* fs.makeTempDirectory({ prefix: "tabawake-ensure-" })
      const stub = resolve(dest, "frame_engine.stub.js")
      const target = resolve(dest, "frame_engine.js")
      yield* fs.writeFileString(stub, "export const stub = true\n")

      const first = yield* ensureFrameEngine({ dest, stub, target })
      const second = yield* ensureFrameEngine({ dest, stub, target })
      const body = yield* fs.readFileString(target)

      expect(first).toBe("copied")
      expect(second).toBe("exists")
      expect(body).toContain("export const stub = true")
    }),
  )

  it.effect("fails when the stub is missing", () =>
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
