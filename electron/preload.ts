import { contextBridge, ipcRenderer } from "electron";
import {
  SELECT_VIDEO_CHANNEL,
  type DesktopApi
} from "../shared/preload-api";

/**
 * The complete, typed API made available to the untrusted renderer.
 */
const desktopApi: DesktopApi = Object.freeze({
  /**
   * Requests the main process to display its native video picker.
   */
  selectVideo: () => ipcRenderer.invoke(SELECT_VIDEO_CHANNEL)
});

// Expose methods individually instead of giving the renderer direct IPC access.
contextBridge.exposeInMainWorld("desktop", desktopApi);
