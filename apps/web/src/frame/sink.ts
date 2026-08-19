/**
 * Polymorphic frame sinks: same RGBA timer content, different host elements.
 *
 * - canvas  → Screen mode preview (direct putImageData)
 * - video   → Video mode via canvas.captureStream (no WritableStream / generator)
 */

export type FramePixels = {
  width: number
  height: number
  /** RGBA8 bytes, length === width * height * 4 */
  bytes: Uint8Array
  /** Elapsed ms used to produce this frame. */
  tMs: number
}

/**
 * Destination for WASM-rendered frames. Implementations own element wiring
 * and must be idempotent on dispose.
 */
export interface FrameSink {
  readonly kind: "canvas" | "video"
  present(frame: FramePixels): void
  dispose(): void
}

export type FrameHost = HTMLCanvasElement | HTMLVideoElement

/** Create a sink for a canvas or video host. */
export function createFrameSink(host: FrameHost): FrameSink {
  if (host instanceof HTMLCanvasElement) {
    return createCanvasSink(host)
  }
  if (host instanceof HTMLVideoElement) {
    return createVideoSink(host)
  }
  throw new Error("Unsupported frame host")
}

function toImageData(bytes: Uint8Array, width: number, height: number): ImageData {
  const copy = new Uint8ClampedArray(bytes.byteLength)
  copy.set(bytes)
  return new ImageData(
    new Uint8ClampedArray(copy.buffer as ArrayBuffer),
    width,
    height,
  )
}

/** Force captureStream to emit this canvas bitmap now, not on the next fps tick. */
function requestCaptureFrame(track: MediaStreamTrack | null) {
  const request = (track as MediaStreamTrack & { requestFrame?: () => void })
    .requestFrame
  if (typeof request === "function") {
    request.call(track)
  }
}

function createCanvasSink(canvas: HTMLCanvasElement): FrameSink {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) {
    throw new Error("2D canvas unavailable")
  }

  let disposed = false

  return {
    kind: "canvas",
    present(frame) {
      if (disposed) return
      if (canvas.width !== frame.width || canvas.height !== frame.height) {
        canvas.width = frame.width
        canvas.height = frame.height
      }
      ctx.putImageData(toImageData(frame.bytes, frame.width, frame.height), 0, 0)
    },
    dispose() {
      disposed = true
      canvas.width = 0
      canvas.height = 0
    },
  }
}

/**
 * Video sink: paint WASM frames onto an offscreen canvas, expose them through
 * `captureStream` into the visible <video>. Avoids MediaStreamTrackGenerator /
 * WritableStream backpressure that previously wedged mode switches.
 */
function createVideoSink(video: HTMLVideoElement): FrameSink {
  const WIDTH = 320
  const HEIGHT = 200

  const canvas = document.createElement("canvas")
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) {
    throw new Error("2D canvas unavailable")
  }
  if (typeof canvas.captureStream !== "function") {
    throw new Error("canvas.captureStream is unavailable in this browser")
  }

  let disposed = false
  const stream = canvas.captureStream(30)
  const track = stream.getVideoTracks()[0] ?? null

  video.muted = true
  video.defaultMuted = true
  video.playsInline = true
  video.setAttribute("playsinline", "")
  video.setAttribute("muted", "")
  video.srcObject = stream
  // Do not await — play() can stall and freeze mode switches.
  void video.play().catch(() => {
    /* autoplay may wait for a gesture */
  })

  return {
    kind: "video",
    present(frame) {
      if (disposed) return
      if (frame.width === WIDTH && frame.height === HEIGHT) {
        ctx.putImageData(toImageData(frame.bytes, WIDTH, HEIGHT), 0, 0)
      } else {
        const tmp = document.createElement("canvas")
        tmp.width = frame.width
        tmp.height = frame.height
        const tctx = tmp.getContext("2d")
        if (!tctx) return
        tctx.putImageData(toImageData(frame.bytes, frame.width, frame.height), 0, 0)
        ctx.clearRect(0, 0, WIDTH, HEIGHT)
        ctx.drawImage(tmp, 0, 0, WIDTH, HEIGHT)
      }
      // A single putImageData is often dropped once the rAF loop stops (Reset).
      requestCaptureFrame(track)
    },
    dispose() {
      if (disposed) return
      disposed = true
      try {
        track?.stop()
      } catch {
        /* ignore */
      }
      for (const t of stream.getTracks()) {
        try {
          t.stop()
        } catch {
          /* ignore */
        }
      }
      try {
        video.pause()
      } catch {
        /* ignore */
      }
      // Avoid video.load() — it can leave play() pending forever on remount.
      video.removeAttribute("src")
      video.srcObject = null
      canvas.width = 0
      canvas.height = 0
    },
  }
}
