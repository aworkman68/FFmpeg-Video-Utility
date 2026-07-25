/**
 * The single IPC channel used to request the native video file dialog.
 */
export const SELECT_VIDEO_CHANNEL = "dialog:select-video";

/**
 * Preserves the exact channel name as a compile-time type for sandboxed code.
 */
export type SelectVideoChannel = typeof SELECT_VIDEO_CHANNEL;

/**
 * Describes the deliberately small API exposed by the preload script.
 */
export interface DesktopApi {
  /**
   * Opens a native video picker and returns its selected path.
   * A null result means the user cancelled the dialog.
   */
  selectVideo: () => Promise<string | null>;
}
