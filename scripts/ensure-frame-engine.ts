import { FileSystem } from "@effect/platform"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

export type EnsureFrameEnginePaths = {
  dest: string
  stub: string
  target: string
}

export type EnsureFrameEngineResult = "copied" | "exists"

export const generatedPaths = (root: string): EnsureFrameEnginePaths => {
  const dest = resolve(root, "apps/web/src/generated")
  return {
    dest,
    stub: resolve(dest, "frame_engine.stub.js"),
    target: resolve(dest, "frame_engine.js"),
  }
}

/** If Bazel has not staged wasm-bindgen output yet, copy the committed stub. */
export const ensureFrameEngine = (
  paths: EnsureFrameEnginePaths,
): Effect.Effect<EnsureFrameEngineResult, Error, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    if (yield* fs.exists(paths.target)) {
      return "exists"
    }
    if (!(yield* fs.exists(paths.stub))) {
      return yield* Effect.fail(new Error(`missing ${paths.stub}`))
    }
    yield* fs.makeDirectory(paths.dest, { recursive: true }).pipe(
      Effect.catchAll(() => Effect.void),
    )
    yield* fs.copyFile(paths.stub, paths.target)
    return "copied"
  })

const program = Effect.gen(function* () {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
  const paths = generatedPaths(root)
  const result = yield* ensureFrameEngine(paths)
  if (result === "copied") {
    yield* Effect.log(`copied stub → ${paths.target}`)
  }
})

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  NodeRuntime.runMain(program.pipe(Effect.provide(NodeContext.layer)))
}
