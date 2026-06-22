# FFmpeg Video Utility (v1.5)

A simple Windows batch menu for common FFmpeg video tasks.

## Features

1. Extract all frames from a video
2. Trim a video by frame range
3. Trim a video by timestamp
4. Join two video clips
5. Create a video from images
6. Extract first frame only
7. Extract last frame only
8. Extract frame at a specific frame number
9. Extract frame at a timestamp
10. Split a long video into smaller clips
11. Extract audio from video

## Requirements

- Windows
- FFmpeg installed and available on your system PATH

Verify FFmpeg is available:

```bash
ffmpeg -version
```

## New in v5: Extract Audio from Video

Option `11` extracts the audio track from a video clip.

You will be prompted for:

- input video
- output audio filename

Examples:

```text
Input video: clip.mp4
Output audio file: audio.mp3
```

```text
Input video: clip.mp4
Output audio file: audio.wav
```

The script uses:

```bash
ffmpeg -i input.mp4 -vn output.mp3
```

The `-vn` option tells FFmpeg to ignore video and output audio only.

## Notes

- Use `.mp3` for smaller compressed audio files.
- Use `.wav` for uncompressed audio.
- Use `.m4a` if the source video already contains AAC audio and you want a common audio container.
- Frame numbers start at 0.
- Trim by frame may not preserve audio.
- Join requires matching video/audio formats.
- Extract-all-frames continues numbering from the highest existing frame in the output folder.
- Split mode uses stream copy and cuts on keyframes, so segment lengths may not be perfectly exact.

