// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from "electron";
import { GetPathName } from "src/types/getPath";

const electronHandler = {
  dialog: (method: string, config: object) => ipcRenderer.invoke("dialog", method, config),
  isFolder: (path: string) => ipcRenderer.invoke("isFolder", path),
  getFilesFromFolder: (path: string) => ipcRenderer.invoke("getFilesFromFolder", path),
  fs: (method: string, params: any[]) => ipcRenderer.invoke("fs", method, params),
  path: (method: string, param: string) => ipcRenderer.invoke("path", method, param),
  os: (method: string, param: string) => ipcRenderer.invoke("os", method, param),
  process: (method: string, param: string) => ipcRenderer.invoke("process", method, param),
  getPathSep: () => ipcRenderer.invoke("getPathSep"),
  dirName: () => ipcRenderer.invoke("dirName"),
  execSync: (command: string) => ipcRenderer.invoke("execSync", command),
  getPath: (name: GetPathName) => ipcRenderer.invoke("getPath", name),
  extractGz: (path: string) => ipcRenderer.invoke("extractGz", path),
  appInfo: () => ipcRenderer.invoke("appInfo"),
  on: (channel: string, listener: (...args: any[]) => void) =>
    ipcRenderer.on(channel, (event, ...args) => listener(...args)),
  invoke: (method: string, params: any[]) => ipcRenderer.invoke(method, params),
};

contextBridge.exposeInMainWorld("electron", electronHandler);

export type DialogHandler = typeof electronHandler;
