import { useState } from "react";

/**
 * Renders the first application slice for choosing an input video.
 */
export default function App() {
  // The selected path is null until a video has been chosen.
  const [selectedVideoPath, setSelectedVideoPath] = useState<string | null>(null);

  /**
   * Requests a video path through the secure preload API.
   */
  async function handleSelectVideo(): Promise<void> {
    const videoPath = await window.desktop.selectVideo();

    // Cancellation returns null and deliberately leaves the current selection unchanged.
    if (videoPath !== null) {
      setSelectedVideoPath(videoPath);
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
      </section>
    </main>
  );
}
