export {}; // Make this a module

import { ElectronHandler } from "../preload";

declare global {
  const electron: ElectronHandler;
}
