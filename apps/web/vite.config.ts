import { defineConfig } from "vite"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: ".",
  publicDir: "public",
  assetsInclude: ["**/*.wasm"],
  resolve: {
    alias: {
      "@tabawake/core": resolve(rootDir, "../../packages/tabawake_core/src"),
    },
  },
  server: {
    port: 5173,
    host: "127.0.0.1",
  },
  preview: {
    port: 4173,
    host: "127.0.0.1",
  },
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,
  },
})
