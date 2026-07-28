import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { FfmpegAvailabilityResult } from "../shared/preload-api";

/**
 * Promise-based wrapper around Node's shell-free executable runner.
 */
const execFileAsync = promisify(execFile);

/**
 * Attempts to find FFmpeg's resolved Windows path without invoking a shell.
 */
async function resolveFfmpegPath(): Promise<string | null> {
  try {
    // Windows may return more than one match, ordered by PATH precedence.
    const { stdout } = await execFileAsync("where.exe", ["ffmpeg"]);
    const firstMatch = stdout
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .find((line) => line.length > 0);

    return firstMatch ?? null;
  } catch {
    // FFmpeg can still be invoked by name if path resolution is unavailable.
    return null;
  }
}

/**
 * Runs `ffmpeg -version` and returns a renderer-safe availability result.
 */
export async function checkFfmpegAvailability(): Promise<FfmpegAvailabilityResult> {
  // Prefer the resolved path so the renderer can report the actual executable.
  const executablePath = await resolveFfmpegPath();
  const executable = executablePath ?? "ffmpeg";

  try {
    const { stdout, stderr } = await execFileAsync(executable, ["-version"], {
      windowsHide: true
    });

    // FFmpeg normally writes version information to stdout; retain stderr as a fallback.
    const versionText = stdout.trim() || stderr.trim();

    return {
      available: true,
      versionText,
      executablePath,
      errorMessage: null
    };
  } catch (error: unknown) {
    // Convert internal process errors into a serializable message for the renderer.
    const errorMessage =
      error instanceof Error ? error.message : "FFmpeg could not be started.";

    return {
      available: false,
      versionText: null,
      executablePath,
      errorMessage
    };
  }
}
