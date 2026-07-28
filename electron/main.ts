import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  type MenuItemConstructorOptions
} from "electron";
import path from "node:path";
import {
  GET_FFMPEG_STATUS_CHANNEL,
  INSPECT_VIDEO_CHANNEL,
  SELECT_VIDEO_CHANNEL,
  SHOW_FFMPEG_VIEWER_CHANNEL,
  type FfmpegAvailabilityResult,
  type VideoMetadataResult
} from "../shared/preload-api";
import { checkFfmpegAvailability } from "./ffmpeg-availability";
import { inspectVideoMetadata } from "./video-metadata";

/**
 * Indicates whether Electron is loading content from the Vite development server.
 */
const isDevelopment = !app.isPackaged;

/**
 * Common video extensions shown by the native file picker.
 */
const videoExtensions = [
  "mp4",
  "mkv",
  "mov",
  "avi",
  "webm",
  "m4v",
  "wmv",
  "mpeg",
  "mpg"
];

/**
 * Registers the narrow set of renderer requests accepted by the main process.
 */
function registerIpcHandlers(
  ffmpegStatusPromise: Promise<FfmpegAvailabilityResult>
): void {
  ipcMain.handle(SELECT_VIDEO_CHANNEL, async (): Promise<string | null> => {
    // The native dialog result distinguishes cancellation from an application error.
    const result = await dialog.showOpenDialog({
      title: "Select a video",
      properties: ["openFile"],
      filters: [
        {
          name: "Video files",
          extensions: videoExtensions
        }
      ]
    });

    if (result.canceled) {
      return null;
    }

    // Only one path is possible because multi-selection is not enabled.
    return result.filePaths[0] ?? null;
  });

  ipcMain.handle(
    GET_FFMPEG_STATUS_CHANNEL,
    (): Promise<FfmpegAvailabilityResult> => ffmpegStatusPromise
  );

  ipcMain.handle(
    INSPECT_VIDEO_CHANNEL,
    (_event, videoPath: unknown): Promise<VideoMetadataResult> =>
      inspectVideoMetadata(videoPath)
  );
}

/**
 * Creates the native application menu for the supplied renderer window.
 */
function createApplicationMenu(window: BrowserWindow): void {
  // Array order determines the left-to-right order of top-level menu items.
  const menuTemplate: MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [
        {
          label: "Exit",
          accelerator: "Alt+F4",
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: "View",
      submenu: [
        {
          label: "FFmpeg Status",
          click: () => {
            window.webContents.send(SHOW_FFMPEG_VIEWER_CHANNEL, "status");
          }
        },
        {
          label: "FFmpeg Version",
          click: () => {
            window.webContents.send(SHOW_FFMPEG_VIEWER_CHANNEL, "version");
          }
        }
      ]
    },
    {
      label: "About",
      submenu: [
        {
          label: "Version",
          click: () => {
            // app.getVersion reads the authoritative package version.
            void dialog.showMessageBox(window, {
              type: "info",
              title: "FFmpeg Video Utility",
              message: "FFmpeg Video Utility",
              detail: `Version ${app.getVersion()}`,
              buttons: ["OK"],
              noLink: true
            });
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

/**
 * Creates the secured application window and loads the React renderer.
 */
function createWindow(): void {
  // This BrowserWindow owns the isolated renderer and its preload bridge.
  const window = new BrowserWindow({
    width: 960,
    height: 640,
    minWidth: 640,
    minHeight: 480,
    title: "FFmpeg Video Utility",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  createApplicationMenu(window);

  if (isDevelopment) {
    void window.loadURL("http://localhost:5173");
  } else {
    void window.loadFile(path.join(__dirname, "../../dist/index.html"));
  }
}

app.whenReady().then(() => {
  // Start the shell-free FFmpeg probe once and share its cached result with renderers.
  const ffmpegStatusPromise = checkFfmpegAvailability();

  registerIpcHandlers(ffmpegStatusPromise);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
