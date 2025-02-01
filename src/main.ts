import { app, BrowserWindow, ipcMain, dialog, IpcMainInvokeEvent } from "electron";
import path from "path";
import os from "os";
import process from "process";
import child_process from "child_process";
import fs from "node:fs";
import { GetPathName } from "src/types/getPath";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow: BrowserWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 915,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    // Open the DevTools only in development mode
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)).then(() => {
      mainWindow.webContents.send("main-to-render", "Ping 1 (send from main process)");
    });
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle("dialog", async (event: IpcMainInvokeEvent, method: any, params: any[]) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const result = await dialog[method](params);
  return result;
});

ipcMain.handle("isFolder", async (event: IpcMainInvokeEvent, path: string) => {
  return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
});

ipcMain.handle("getPathSep", async (_: IpcMainInvokeEvent) => {
  return path.sep;
});

ipcMain.handle("getFilesFromFolder", async (event: IpcMainInvokeEvent, path: string) => {
  return new Promise((resolve, reject) =>
    fs.readdir(path, (err, files) => {
      if (err) {
        reject(err);
      }
      resolve(files);
    })
  );
});

ipcMain.handle("execute", async (event: IpcMainInvokeEvent, {command, logToFile}: {command: string, logToFile: boolean}) => {
  let handle: number | undefined;
  if (logToFile) {
    const tempPath = app.getPath("temp");
    handle = fs.openSync(`${tempPath}/log.txt`, "w");
  }
  const proc = child_process.spawn(command, [], {
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  proc.stdout.on("data", (data) => {
    handle && fs.appendFileSync(handle, data.toString());
    mainWindow.webContents.send("main-to-render", data.toString());
  });
  proc.stderr.on("data", (data) => {
    handle && fs.appendFileSync(handle, data.toString());
    mainWindow.webContents.send("main-to-render", data.toString());
  });
  proc.on("close", (code) => {
    handle && fs.closeSync(handle);
    mainWindow.webContents.send("main-to-render", { exitCode: code });
  });
});

ipcMain.handle("execSync", (event: IpcMainInvokeEvent, command: string) => {
  return child_process.execSync(command).toString();
});

ipcMain.handle("dirName", (event: IpcMainInvokeEvent) => {
  return __dirname;
});

ipcMain.handle("fs", async (event: IpcMainInvokeEvent, method: string, params: any[]) => {
  console.log(method, params);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return fs[method](...params);
});

ipcMain.handle("path", (event: IpcMainInvokeEvent, method: string, param: any) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return path[method](param);
});

ipcMain.handle("os", (event: IpcMainInvokeEvent, method: string, param: any) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return os[method](param);
});

ipcMain.handle("process", (event: IpcMainInvokeEvent, attribute: string) => {
  if (attribute === "resourcesPath" && __filename.indexOf("app.asar") === -1) {
    return ".";
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return process[attribute];
});

ipcMain.on("render-to-main", (event, message) => {
  console.log(message); // Pong 1 (send from render process)
});

ipcMain.handle("render-to-main-to-render", (event, message) => {
  console.log(message); // Ping 2 (invoke from render process)
  return "Pong 2 (handle from main process)";
});

ipcMain.handle("getPath", (event: IpcMainInvokeEvent, name: GetPathName) => {
  return app.getPath(name);
});
