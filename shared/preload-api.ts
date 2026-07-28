/**
 * The single IPC channel used to request the native video file dialog.
 */
export const SELECT_VIDEO_CHANNEL = "dialog:select-video";

/**
 * Preserves the exact channel name as a compile-time type for sandboxed code.
 */
export type SelectVideoChannel = typeof SELECT_VIDEO_CHANNEL;

/**
 * The IPC channel used to read the FFmpeg check performed at startup.
 */
export const GET_FFMPEG_STATUS_CHANNEL = "ffmpeg:get-status";

/**
 * Preserves the status channel name as a compile-time type for sandboxed code.
 */
export type GetFfmpegStatusChannel = typeof GET_FFMPEG_STATUS_CHANNEL;

/**
 * Describes the result of attempting to run FFmpeg.
 */
export interface FfmpegAvailabilityResult {
  available: boolean;
  versionText: string | null;
  executablePath: string | null;
  errorMessage: string | null;
}

/**
 * Describes the deliberately small API exposed by the preload script.
 */
export interface DesktopApi {
  /**
   * Opens a native video picker and returns its selected path.
   * A null result means the user cancelled the dialog.
   */
  selectVideo: () => Promise<string | null>;

  /**
   * Returns the cached FFmpeg availability result produced at startup.
   */
  getFfmpegStatus: () => Promise<FfmpegAvailabilityResult>;
}
