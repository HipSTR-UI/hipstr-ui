// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from "electron";

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
};

contextBridge.exposeInMainWorld("electron", electronHandler);

export type DialogHandler = typeof electronHandler;

// White-listed channels.
const ipc = {
  render: {
    // From render to main.
    send: ["render-to-main"],
    // From main to render.
    receive: ["main-to-render"],
    // From render to main and back again.
    sendReceive: ["render-to-main-to-render", "execute"],
  },
};

const ipcRenderHandler = {
  // From render to main.
  send: (channel: string, args: any) => {
    const validChannels = ipc.render.send;
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, args);
    }
  },
  // From main to render.
  receive: (channel: string, listener: any) => {
    const validChannels = ipc.render.receive;
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`.
      ipcRenderer.on(channel, (event, ...args) => listener(...args));
    }
  },
  // From render to main and back again.
  invoke: (channel: string, args: any) => {
    const validChannels = ipc.render.sendReceive;
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, args);
    }
  },
};

export type IpcRenderHandler = typeof ipcRenderHandler;

// Exposed protected methods in the render process.
contextBridge.exposeInMainWorld(
  // Allowed 'ipcRenderer' methods.
  "ipcRender",
  ipcRenderHandler
);
