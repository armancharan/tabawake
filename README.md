# tabawake

Keep **this screen** awake while **this tab** is visible.
On the macOS app, **System** keeps the machine from idle-sleeping after the window is hidden.

Portfolio systems demo: Screen Wake Lock as the primary path, a Rust/WASM
procedural frame engine streaming into `<video srcObject>`, thin custom Bazel
rules, and a Playwright media-stream contract.

## Quick start

```bash
# Tooling
brew install bazelisk   # or use the CI setup-bazel action
corepack enable && corepack prepare pnpm@9 --activate

pnpm install
pnpm wasm:stage         # bazel build + copy WASM into apps/web/src/generated
pnpm dev                # http://127.0.0.1:5173
pnpm desktop:dev        # same UI in a Tauri window (macOS)
```

## Scripts

| Command | What |
|---|---|
| `bazelisk build //crates/frame_engine:frame_engine_web` | WASM package via custom rule |
| `bazelisk test //crates/frame_engine:frame_engine_test` | Rust frame tests |
| `bazelisk test //e2e:media_stream_e2e` | Same e2e through Bazel |
| `pnpm build` | Production web build |
| `pnpm desktop:build` | Tauri macOS app |
| `pnpm desktop:dev` | Same UI in a Tauri window |
| `pnpm dev` | Vite web UI |
| `pnpm test` | Core state-machine unit tests |
| `pnpm test:e2e` | Playwright media-stream contract |
| `pnpm wasm:stage` | Build `//crates/frame_engine:frame_engine_web` and stage artifacts |

## Layout

```text
apps/desktop             Tauri 2 host (macOS)
apps/web                 UI + drivers
crates/frame_engine      Rust RGBA painter (+ WASM)
docs/ARCHITECTURE.md     deeper design notes
e2e                      Playwright contract
packages/tabawake_core   session state machine
tools/rules              media_stream_e2e, wasm_frame_engine
```

## License

MIT
