// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from "electron";

const electronHandler = {
  openDialog: (method: any, config: object) => ipcRenderer.invoke("dialog", method, config),
};

contextBridge.exposeInMainWorld("electron", electronHandler);

export type ElectronHandler = typeof electronHandler;

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
