import type { WakeLockFailureKind } from "./wakeLock"

/**
 * Pure UI gate for the Screen Wake Lock mechanism option.
 *
 * - API missing → permanently disabled
 * - Request blocked → disabled until the user retries
 * - Otherwise selectable
 */
export type ScreenOptionState = {
  disabled: boolean
  selected: boolean
  prompt: string | null
  showRetry: boolean
}

export function screenOptionState(input: {
  apiPresent: boolean
  /** Last consume-time failure, if any. */
  failure: WakeLockFailureKind | null
  selected: boolean
  unsupportedMessage: string
  blockedMessage: string
  driverMessage: string
}): ScreenOptionState {
  if (!input.apiPresent) {
    return {
      disabled: true,
      selected: false,
      prompt: input.unsupportedMessage,
      showRetry: false,
    }
  }

  if (input.failure === "permission_denied" || input.failure === "driver_error") {
    return {
      disabled: true,
      selected: false,
      prompt:
        input.failure === "permission_denied"
          ? input.blockedMessage
          : input.driverMessage,
      showRetry: true,
    }
  }

  if (input.failure === "unsupported") {
    return {
      disabled: true,
      selected: false,
      prompt: input.unsupportedMessage,
      showRetry: false,
    }
  }

  return {
    disabled: false,
    selected: input.selected,
    prompt: null,
    showRetry: false,
  }
}
