import { afterEach, describe, expect, it, vi } from "vitest"
import { createFrameSink } from "./sink"

function mock2dContext() {
  return {
    putImageData: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray([0, 0, 0, 255]),
    })),
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("createFrameSink(canvas)", () => {
  it("presents via putImageData and sizes the canvas", () => {
    const canvas = document.createElement("canvas")
    const ctx = mock2dContext()
    vi.spyOn(canvas, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D)

    const sink = createFrameSink(canvas)
    expect(sink.kind).toBe("canvas")

    const bytes = new Uint8Array(4 * 2 * 4)
    sink.present({ width: 4, height: 2, bytes, tMs: 0 })
    expect(canvas.width).toBe(4)
    expect(canvas.height).toBe(2)
    expect(ctx.putImageData).toHaveBeenCalledTimes(1)
  })

  it("dispose is sync and idempotent; present is a no-op after", () => {
    const canvas = document.createElement("canvas")
    const ctx = mock2dContext()
    vi.spyOn(canvas, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D)

    const sink = createFrameSink(canvas)
    sink.present({ width: 8, height: 8, bytes: new Uint8Array(8 * 8 * 4), tMs: 0 })
    sink.dispose()
    expect(canvas.width).toBe(0)
    expect(canvas.height).toBe(0)

    const calls = ctx.putImageData.mock.calls.length
    sink.dispose()
    sink.present({ width: 8, height: 8, bytes: new Uint8Array(8 * 8 * 4), tMs: 1 })
    expect(canvas.width).toBe(0)
    expect(ctx.putImageData.mock.calls.length).toBe(calls)
  })
})

describe("createFrameSink(video)", () => {
  it("attaches a MediaStream and clears it on dispose", () => {
    const video = document.createElement("video")
    const track = { stop: vi.fn(), requestFrame: vi.fn() }
    const stream = {
      getVideoTracks: () => [track],
      getTracks: () => [track],
    }

    // happy-dom rejects non-real MediaStream on srcObject — stub the setter.
    let attached: unknown = null
    Object.defineProperty(video, "srcObject", {
      configurable: true,
      get: () => attached,
      set: (value) => {
        attached = value
      },
    })
    vi.spyOn(video, "play").mockResolvedValue(undefined)
    vi.spyOn(video, "pause").mockImplementation(() => undefined)

    const ctx = mock2dContext()
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(ctx as unknown as CanvasRenderingContext2D)

    const proto = HTMLCanvasElement.prototype as HTMLCanvasElement & {
      captureStream: (fps?: number) => MediaStream
    }
    const hadCapture = Object.prototype.hasOwnProperty.call(proto, "captureStream")
    const previousCapture = proto.captureStream
    proto.captureStream = () => stream as unknown as MediaStream

    try {
      const sink = createFrameSink(video)
      expect(sink.kind).toBe("video")
      expect(video.srcObject).toBe(stream)

      sink.present({ width: 320, height: 200, bytes: new Uint8Array(320 * 200 * 4), tMs: 0 })
      expect(ctx.putImageData).toHaveBeenCalled()
      expect(track.requestFrame).toHaveBeenCalled()

      sink.dispose()
      expect(track.stop).toHaveBeenCalled()
      expect(video.srcObject).toBeNull()
      sink.dispose()
    } finally {
      getContext.mockRestore()
      if (hadCapture) proto.captureStream = previousCapture
      else delete (proto as { captureStream?: unknown }).captureStream
    }
  })
})
