# tabawake

Keep **this screen** awake while **this tab** is visible.

Portfolio systems demo: Screen Wake Lock as the primary path, a Rust/WASM
procedural frame engine streaming into `<video srcObject>`, thin custom Bazel
rules, and a Playwright media-stream contract.

## Quick start

```bash
# Tooling
brew install bazelisk   # or use the CI setup-bazel action
corepack enable && corepack prepare pnpm@9 --activate

pnpm install
pnpm wasm:stage         # bazel build + copy WASM into apps/web/public
pnpm dev                # http://127.0.0.1:5173
```

## Scripts

| Command | What |
|---|---|
| `pnpm dev` | Vite web UI |
| `pnpm test` | Core state-machine unit tests |
| `pnpm wasm:stage` | Build `//crates/frame_engine:frame_engine_web` and stage artifacts |
| `pnpm build` | Production web build |
| `pnpm test:e2e` | Playwright media-stream contract |
| `bazelisk test //crates/frame_engine:frame_engine_test` | Rust frame tests |
| `bazelisk build //crates/frame_engine:frame_engine_web` | WASM package via custom rule |
| `bazelisk test //e2e:media_stream_e2e` | Same e2e through Bazel |

## Layout

```text
apps/web                 UI + drivers
packages/tabawake_core  session state machine
crates/frame_engine      Rust RGBA painter (+ WASM)
tools/rules              wasm_frame_engine, media_stream_e2e
e2e                      Playwright contract
docs/ARCHITECTURE.md     deeper design notes
```

## License

MIT
