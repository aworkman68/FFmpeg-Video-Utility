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
 * The IPC channel used to inspect a selected video with ffprobe.
 */
export const INSPECT_VIDEO_CHANNEL = "ffprobe:inspect-video";

/**
 * Preserves the inspection channel name for the sandboxed preload.
 */
export type InspectVideoChannel = typeof INSPECT_VIDEO_CHANNEL;

/**
 * The main-to-renderer channel used to open an FFmpeg information viewer.
 */
export const SHOW_FFMPEG_VIEWER_CHANNEL = "ffmpeg:show-viewer";

/**
 * Preserves the viewer channel name for the sandboxed preload.
 */
export type ShowFfmpegViewerChannel = typeof SHOW_FFMPEG_VIEWER_CHANNEL;

/**
 * Identifies the two FFmpeg viewers available from Electron's View menu.
 */
export type FfmpegViewer = "status" | "version";

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
 * Contains normalized metadata needed by the renderer.
 */
export interface VideoMetadata {
  durationSeconds: number;
}

/**
 * Represents either valid video metadata or a safe inspection error.
 */
export type VideoMetadataResult =
  | {
      success: true;
      metadata: VideoMetadata;
      errorMessage: null;
    }
  | {
      success: false;
      metadata: null;
      errorMessage: string;
    };

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

  /**
   * Inspects one selected video and returns normalized metadata.
   */
  inspectVideo: (videoPath: string) => Promise<VideoMetadataResult>;

  /**
   * Subscribes to native menu requests to show an FFmpeg viewer.
   * The returned function removes the subscription.
   */
  onShowFfmpegViewer: (
    listener: (viewer: FfmpegViewer) => void
  ) => () => void;
}
