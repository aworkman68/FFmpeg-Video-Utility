import { contextBridge, ipcRenderer } from "electron";
import type {
  DesktopApi,
  GetFfmpegStatusChannel,
  InspectVideoChannel,
  SelectVideoChannel
} from "../shared/preload-api";

/**
 * The allow-listed channel copied into the sandboxed preload at compile time.
 *
 * Sandboxed preloads cannot load arbitrary local modules at runtime, so this
 * value is checked against the shared channel type and then emitted locally.
 */
const selectVideoChannel: SelectVideoChannel = "dialog:select-video";

/**
 * The allow-listed FFmpeg status channel emitted locally for sandbox support.
 */
const getFfmpegStatusChannel: GetFfmpegStatusChannel = "ffmpeg:get-status";

/**
 * The allow-listed video inspection channel emitted for sandbox support.
 */
const inspectVideoChannel: InspectVideoChannel = "ffprobe:inspect-video";

/**
 * The complete, typed API made available to the untrusted renderer.
 */
const desktopApi: DesktopApi = Object.freeze({
  /**
   * Requests the main process to display its native video picker.
   */
  selectVideo: () => ipcRenderer.invoke(selectVideoChannel),

  /**
   * Reads the cached FFmpeg check from the main process.
   */
  getFfmpegStatus: () => ipcRenderer.invoke(getFfmpegStatusChannel),

  /**
   * Requests normalized metadata for one main-process-validated video path.
   */
  inspectVideo: (videoPath: string) =>
    ipcRenderer.invoke(inspectVideoChannel, videoPath)
});

// Expose methods individually instead of giving the renderer direct IPC access.
contextBridge.exposeInMainWorld("desktop", desktopApi);
