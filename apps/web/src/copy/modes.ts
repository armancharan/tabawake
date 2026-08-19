import type { AppRuntime, KeepAwakeMode } from "@tabawake/core"

export const SCREEN_WAKE_LOCK_MDN =
  "https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API"

export const MEDIA_STREAM_MDN =
  "https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API"

export type ModeCopy = {
  blurbHtml: string
  label: string
}

const docsLink = (href: string, label: string) =>
  `<a class="mode-docs" href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`

const canvas = `<code class="mode-code">&lt;canvas /&gt;</code>`
const video = `<code class="mode-code">&lt;video /&gt;</code>`

const WEB: Record<KeepAwakeMode, ModeCopy> = {
  generated: {
    label: "Video",
    blurbHtml: `Uses the browser’s ${docsLink(MEDIA_STREAM_MDN, "MediaStream API")} to keep this display awake. Timer plays through a ${video}.`,
  },
  presence: {
    label: "Presence",
    blurbHtml: "Coming in the desktop app.",
  },
  screen: {
    label: "Screen Wake Lock",
    blurbHtml: `Uses the browser’s ${docsLink(SCREEN_WAKE_LOCK_MDN, "Screen Wake Lock API")} to keep this display on. Timer draws on a ${canvas}.`,
  },
  system: {
    label: "System",
    blurbHtml: "Coming in the desktop app.",
  },
}

const DESKTOP: Record<KeepAwakeMode, ModeCopy> = {
  generated: {
    label: "Video",
    blurbHtml: `Uses the webview’s ${docsLink(MEDIA_STREAM_MDN, "MediaStream API")} to keep this display awake. Timer plays through a ${video}.`,
  },
  presence: {
    label: "Presence",
    blurbHtml: "Not in this build.",
  },
  screen: {
    label: "Screen Wake Lock",
    blurbHtml: `Uses the webview’s ${docsLink(SCREEN_WAKE_LOCK_MDN, "Screen Wake Lock API")} to keep this display on. Timer draws on a ${canvas}.`,
  },
  system: {
    label: "System",
    blurbHtml:
      "Asks macOS not to idle-sleep (<code class=\"mode-code\">PreventUserIdleSystemSleep</code>). Holds after the window is hidden. Timer still draws on a <code class=\"mode-code\">&lt;canvas /&gt;</code>.",
  },
}

export function modeCopy(runtime: AppRuntime, mode: KeepAwakeMode): ModeCopy {
  return runtime === "desktop" ? DESKTOP[mode] : WEB[mode]
}
