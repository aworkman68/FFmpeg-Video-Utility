import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "node:path";
import { SELECT_VIDEO_CHANNEL } from "../shared/preload-api";

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
function registerIpcHandlers(): void {
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

  if (isDevelopment) {
    void window.loadURL("http://localhost:5173");
  } else {
    void window.loadFile(path.join(__dirname, "../../dist/index.html"));
  }
}

app.whenReady().then(() => {
  registerIpcHandlers();
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
