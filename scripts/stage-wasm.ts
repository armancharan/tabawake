import { Command, FileSystem } from "@effect/platform"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"
import { basename, dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ARTIFACTS = [
  "frame_engine.d.ts",
  "frame_engine.js",
  "frame_engine_bg.wasm",
  "frame_engine_bg.wasm.d.ts",
] as const

const runBazel = (root: string, args: ReadonlyArray<string>) =>
  Command.make("bazelisk", ...args).pipe(
    Command.workingDirectory(root),
    Command.stdout("inherit"),
    Command.stderr("inherit"),
    Command.exitCode,
    Effect.filterOrFail(
      (code) => code === 0,
      (code) => new Error(`bazelisk ${args.join(" ")} exited ${code}`),
    ),
  )

const bazelBin = (root: string) =>
  Command.make("bazelisk", "info", "bazel-bin").pipe(
    Command.workingDirectory(root),
    Command.string,
    Effect.map((out) => out.trim()),
  )

const stageOne = (
  fs: FileSystem.FileSystem,
  src: string,
  destDir: string,
): Effect.Effect<boolean, Error> =>
  fs.exists(src).pipe(
    Effect.flatMap((ok) => {
      if (!ok) return Effect.succeed(false)
      return fs.copyFile(src, resolve(destDir, basename(src))).pipe(
        Effect.tap(() => fs.chmod(resolve(destDir, basename(src)), 0o644)),
        Effect.tap(() => Effect.log(`staged ${basename(src)}`)),
        Effect.as(true),
      )
    }),
  )

const program = Effect.gen(function* () {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
  const dest = resolve(root, "apps/web/src/generated")
  const fs = yield* FileSystem.FileSystem

  yield* Effect.log("Building //crates/frame_engine:frame_engine_web ...")
  yield* runBazel(root, ["build", "//crates/frame_engine:frame_engine_web"])

  const out = resolve(
    yield* bazelBin(root),
    "crates/frame_engine/frame_engine_web",
  )
  yield* fs.makeDirectory(dest, { recursive: true })
  yield* fs.chmod(dest, 0o755).pipe(Effect.catchAll(() => Effect.void))

  let copied = 0
  for (const name of ARTIFACTS) {
    if (yield* stageOne(fs, resolve(out, name), dest)) copied += 1
  }

  if (copied === 0) {
    const listing = yield* fs
      .readDirectory(out)
      .pipe(Effect.catchAll(() => Effect.succeed<string[]>([])))
    return yield* Effect.fail(
      new Error(
        `Exact names missing in ${out}:${listing.length ? `\n${listing.join("\n")}` : ""}`,
      ),
    )
  }

  const publicDir = resolve(root, "apps/web/public")
  for (const name of ARTIFACTS) {
    const stale = resolve(publicDir, name)
    yield* fs.remove(stale).pipe(Effect.catchAll(() => Effect.void))
  }

  yield* Effect.log(`Done → ${dest}`)
})

NodeRuntime.runMain(program.pipe(Effect.provide(NodeContext.layer)))
