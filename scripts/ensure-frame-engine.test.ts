import { FileSystem } from "@effect/platform"
import { NodeContext } from "@effect/platform-node"
import { Effect } from "effect"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { ensureFrameEngine } from "./ensure-frame-engine.ts"

const run = <A>(effect: Effect.Effect<A, unknown, FileSystem.FileSystem>) =>
  Effect.runPromise(effect.pipe(Effect.provide(NodeContext.layer)))

describe("ensureFrameEngine", () => {
  it("copies the stub when the target is missing", async () => {
    await run(
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
  })

  it("fails when the stub is missing", async () => {
    await expect(
      run(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem
          const dest = yield* fs.makeTempDirectory({ prefix: "tabawake-ensure-" })
          return yield* ensureFrameEngine({
            dest,
            stub: resolve(dest, "frame_engine.stub.js"),
            target: resolve(dest, "frame_engine.js"),
          })
        }),
      ),
    ).rejects.toThrow(/missing/)
  })
})
