/**
 * Session state machine for tabawake.
 *
 * Pure domain — no DOM. Drivers and UI sit outside this package so unit tests
 * stay hermetic and employers can read the lifecycle in one file.
 */

export type SessionState = "idle" | "armed" | "active" | "paused" | "error"

/** Runtime modes. `system` / `presence` are desktop-only (unsupported on web). */
export type KeepAwakeMode = "screen" | "generated" | "system" | "presence"

export type StopReason =
  | "user"
  | "visibility_loss"
  | "permission_denied"
  | "unsupported"
  | "driver_error"
  | "paused"

export type SessionEvent =
  | { type: "ARM"; mode: KeepAwakeMode }
  | { type: "START" }
  | { type: "PAUSE"; reason?: StopReason }
  | { type: "RESUME" }
  | { type: "STOP"; reason: StopReason }
  | { type: "FAIL"; reason: StopReason; message?: string }
  | { type: "SWITCH_MODE"; mode: KeepAwakeMode }

export interface SessionSnapshot {
  state: SessionState
  mode: KeepAwakeMode | null
  lastReason: StopReason | null
  message: string | null
  startedAt: number | null
}

export function initialSession(): SessionSnapshot {
  return {
    state: "idle",
    mode: null,
    lastReason: null,
    message: null,
    startedAt: null,
  }
}

/**
 * Reduce a session event. Illegal transitions leave the snapshot unchanged
 * (callers may treat that as a no-op rather than throwing).
 */
export function reduceSession(
  snap: SessionSnapshot,
  event: SessionEvent,
  now = Date.now(),
): SessionSnapshot {
  switch (event.type) {
    case "ARM":
      if (snap.state !== "idle" && snap.state !== "error") return snap
      return {
        state: "armed",
        mode: event.mode,
        lastReason: null,
        message: null,
        startedAt: null,
      }
    case "START":
      if (snap.state !== "armed" && snap.state !== "paused") return snap
      return {
        ...snap,
        state: "active",
        lastReason: null,
        message: null,
        startedAt: snap.startedAt ?? now,
      }
    case "PAUSE":
      if (snap.state !== "active") return snap
      return {
        ...snap,
        state: "paused",
        lastReason: event.reason ?? "paused",
      }
    case "RESUME":
      if (snap.state !== "paused") return snap
      return {
        ...snap,
        state: "active",
        lastReason: null,
        message: null,
      }
    case "STOP":
      if (snap.state === "idle") return snap
      return {
        state: "idle",
        mode: null,
        lastReason: event.reason,
        message: null,
        startedAt: null,
      }
    case "FAIL":
      return {
        state: "error",
        mode: snap.mode,
        lastReason: event.reason,
        message: event.message ?? null,
        startedAt: null,
      }
    case "SWITCH_MODE":
      if (
        snap.state !== "active" &&
        snap.state !== "paused" &&
        snap.state !== "armed"
      ) {
        return snap
      }
      return {
        ...snap,
        mode: event.mode,
        message: null,
      }
    default: {
      const _exhaustive: never = event
      return _exhaustive
    }
  }
}

/** Web capability matrix — what the browser surface can honestly claim. */
export function webCapability(
  mode: KeepAwakeMode,
): "supported" | "degraded" | "unsupported" {
  switch (mode) {
    case "screen":
      return "supported"
    case "generated":
      return "supported"
    case "system":
    case "presence":
      return "unsupported"
    default: {
      const _exhaustive: never = mode
      return _exhaustive
    }
  }
}
