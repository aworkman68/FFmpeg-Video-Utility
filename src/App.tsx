import { useState } from "react";

/**
 * Renders the first application slice for choosing an input video.
 */
export default function App() {
  // The selected path is null until a video has been chosen.
  const [selectedVideoPath, setSelectedVideoPath] = useState<string | null>(null);

  // A bridge or main-process failure is reported separately from cancellation.
  const [selectionError, setSelectionError] = useState<string | null>(null);

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
      </section>
    </main>
  );
}
