import { contextBridge, ipcRenderer } from "electron";
import type {
  DesktopApi,
  FfmpegViewer,
  GetFfmpegStatusChannel,
  InspectVideoChannel,
  SelectVideoChannel,
  ShowFfmpegViewerChannel
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
 * The allow-listed main-to-renderer viewer channel emitted for sandbox support.
 */
const showFfmpegViewerChannel: ShowFfmpegViewerChannel =
  "ffmpeg:show-viewer";

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
    ipcRenderer.invoke(inspectVideoChannel, videoPath),

  /**
   * Relays validated menu events without exposing Electron's event object.
   */
  onShowFfmpegViewer: (
    listener: (viewer: FfmpegViewer) => void
  ): (() => void) => {
    /**
     * Filters the untyped IPC payload before it reaches the renderer callback.
     */
    const handleViewerRequest = (
      _event: Electron.IpcRendererEvent,
      viewer: unknown
    ): void => {
      if (viewer === "status" || viewer === "version") {
        listener(viewer);
      }
    };

    ipcRenderer.on(showFfmpegViewerChannel, handleViewerRequest);

    // React calls this cleanup function when its component unmounts.
    return () => {
      ipcRenderer.removeListener(
        showFfmpegViewerChannel,
        handleViewerRequest
      );
    };
  }
});

// Expose methods individually instead of giving the renderer direct IPC access.
contextBridge.exposeInMainWorld("desktop", desktopApi);
