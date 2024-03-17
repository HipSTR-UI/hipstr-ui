export {}; // Make this a module

import { ElectronHandler, IpcRenderHandler } from "../preload";

declare global {
  const electron: ElectronHandler;
  const ipcRender: IpcRenderHandler;
}
