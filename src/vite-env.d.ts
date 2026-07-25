/// <reference types="vite/client" />

import type { DesktopApi } from "../shared/preload-api";

declare global {
  /**
   * Adds the secure preload bridge to the renderer's global Window type.
   */
  interface Window {
    desktop: DesktopApi;
  }
}
