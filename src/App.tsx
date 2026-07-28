import { useEffect, useState } from "react";
import type { FfmpegAvailabilityResult } from "../shared/preload-api";

/**
 * Renders the first application slice for choosing an input video.
 */
export default function App() {
  // The selected path is null until a video has been chosen.
  const [selectedVideoPath, setSelectedVideoPath] = useState<string | null>(null);

  // A bridge or main-process failure is reported separately from cancellation.
  const [selectionError, setSelectionError] = useState<string | null>(null);

  // A null status means the renderer is still waiting for the startup check.
  const [ffmpegStatus, setFfmpegStatus] =
    useState<FfmpegAvailabilityResult | null>(null);

  useEffect(() => {
    // Prevent an asynchronous response from updating an unmounted component.
    let isMounted = true;

    /**
     * Reads the main process's cached startup check through the preload bridge.
     */
    async function loadFfmpegStatus(): Promise<void> {
      try {
        const status = await window.desktop.getFfmpegStatus();

        if (isMounted) {
          setFfmpegStatus(status);
        }
      } catch {
        if (isMounted) {
          setFfmpegStatus({
            available: false,
            versionText: null,
            executablePath: null,
            errorMessage: "The FFmpeg status could not be loaded."
          });
        }
      }
    }

    void loadFfmpegStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Requests a video path through the secure preload API.
   */
  async function handleSelectVideo(): Promise<void> {
    setSelectionError(null);

    try {
      // The renderer can call only the narrow method exposed by the preload.
      const videoPath = await window.desktop.selectVideo();

      // Cancellation returns null and leaves the current selection unchanged.
      if (videoPath !== null) {
        setSelectedVideoPath(videoPath);
      }
    } catch {
      setSelectionError("The video picker could not be opened.");
    }
  }

  return (
    <main>
      <section className="video-selector" aria-labelledby="application-title">
        <h1 id="application-title">FFmpeg Video Utility</h1>
        <button type="button" onClick={() => void handleSelectVideo()}>
          Select Video
        </button>
        <p className="selected-path" aria-live="polite">
          {selectedVideoPath ?? "No video selected"}
        </p>
        {selectionError !== null && (
          <p className="selection-error" role="alert">
            {selectionError}
          </p>
        )}
        <section className="ffmpeg-status" aria-labelledby="ffmpeg-status-title">
          <h2 id="ffmpeg-status-title">FFmpeg status</h2>
          {ffmpegStatus === null ? (
            <p>Checking FFmpeg availability…</p>
          ) : (
            <>
              <p
                className={
                  ffmpegStatus.available
                    ? "status-available"
                    : "status-unavailable"
                }
              >
                {ffmpegStatus.available ? "Available" : "Unavailable"}
              </p>
              {ffmpegStatus.executablePath !== null && (
                <p>
                  <strong>Executable:</strong> {ffmpegStatus.executablePath}
                </p>
              )}
              {ffmpegStatus.versionText !== null && (
                <pre>{ffmpegStatus.versionText}</pre>
              )}
              {ffmpegStatus.errorMessage !== null && (
                <p className="status-unavailable">
                  {ffmpegStatus.errorMessage}
                </p>
              )}
            </>
          )}
        </section>
      </section>
    </main>
  );
}
