import { invoke } from "@tauri-apps/api/core"
import type { StopReason } from "@tabawake/core"
import type { DriverSession } from "./wakeLock"

/** OS idle-sleep inhibit via the Tauri host (macOS IOPMAssertion). */
export async function startSystemInhibitDriver(): Promise<DriverSession> {
  await invoke("inhibit_system_sleep")
  let stopped = false
  return {
    stop: async (_reason: StopReason) => {
      if (stopped) return
      stopped = true
      await invoke("release_system_sleep")
    },
  }
}
