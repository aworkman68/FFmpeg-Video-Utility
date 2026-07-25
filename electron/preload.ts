import { contextBridge, ipcRenderer } from "electron";
import type {
  DesktopApi,
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
 * The complete, typed API made available to the untrusted renderer.
 */
const desktopApi: DesktopApi = Object.freeze({
  /**
   * Requests the main process to display its native video picker.
   */
  selectVideo: () => ipcRenderer.invoke(selectVideoChannel)
});

// Expose methods individually instead of giving the renderer direct IPC access.
contextBridge.exposeInMainWorld("desktop", desktopApi);
