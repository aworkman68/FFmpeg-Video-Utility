import { execFile } from "node:child_process";
import { constants } from "node:fs";
import { access, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { VideoMetadataResult } from "../shared/preload-api";

/**
 * Promise-based wrapper around Node's shell-free executable runner.
 */
const execFileAsync = promisify(execFile);

/**
 * Extensions accepted by both the native picker and metadata inspector.
 */
const supportedVideoExtensions = new Set([
  ".mp4",
  ".mkv",
  ".mov",
  ".avi",
  ".webm",
  ".m4v",
  ".wmv",
  ".mpeg",
  ".mpg"
]);

/**
 * Minimal shape expected from ffprobe's JSON response.
 */
interface FfprobeOutput {
  format?: {
    duration?: string;
  };
}

/**
 * Creates a serializable metadata failure for the renderer.
 */
function inspectionFailure(errorMessage: string): VideoMetadataResult {
  return {
    success: false,
    metadata: null,
    errorMessage
  };
}

/**
 * Verifies that an IPC-provided path points to a readable supported file.
 */
async function validateVideoPath(videoPath: unknown): Promise<string | null> {
  if (typeof videoPath !== "string" || !path.isAbsolute(videoPath)) {
    return "The selected video path is invalid.";
  }

  if (!supportedVideoExtensions.has(path.extname(videoPath).toLowerCase())) {
    return "The selected file does not use a supported video extension.";
  }

  try {
    const fileStats = await stat(videoPath);

    if (!fileStats.isFile()) {
      return "The selected path is not a file.";
    }

    await access(videoPath, constants.R_OK);
    return null;
  } catch {
    return "The selected video is missing or unreadable.";
  }
}

/**
 * Runs ffprobe and converts its JSON response into normalized video metadata.
 */
export async function inspectVideoMetadata(
  videoPath: unknown
): Promise<VideoMetadataResult> {
  const validationError = await validateVideoPath(videoPath);

  if (validationError !== null || typeof videoPath !== "string") {
    return inspectionFailure(
      validationError ?? "The selected video path is invalid."
    );
  }

  try {
    const { stdout } = await execFileAsync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "json",
        videoPath
      ],
      {
        windowsHide: true
      }
    );

    // Parse only the structured duration field requested from ffprobe.
    const output = JSON.parse(stdout) as FfprobeOutput;
    const durationSeconds = Number(output.format?.duration);

    if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
      return inspectionFailure(
        "ffprobe did not return a valid video duration."
      );
    }

    return {
      success: true,
      metadata: {
        durationSeconds
      },
      errorMessage: null
    };
  } catch (error: unknown) {
    // An ENOENT error means ffprobe itself could not be found on PATH.
    const errorCode =
      error instanceof Error && "code" in error
        ? String(error.code)
        : null;

    if (errorCode === "ENOENT") {
      return inspectionFailure(
        "ffprobe is unavailable. Install FFmpeg and ensure ffprobe is on PATH."
      );
    }

    return inspectionFailure(
      "The selected file is invalid, unreadable, or not recognized by ffprobe."
    );
  }
}
