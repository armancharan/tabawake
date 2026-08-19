/** Public frame-pipeline surface. */
export { loadFrameEngine, type FrameEngine } from "./engine"
export { createTimerController, type TimerController, type TimerFidelity } from "./presenter"
export {
  createFrameSink,
  type FrameHost,
  type FramePixels,
  type FrameSink,
} from "./sink"
