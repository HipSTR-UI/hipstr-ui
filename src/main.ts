import { app, BrowserWindow, ipcMain, dialog, IpcMainInvokeEvent } from "electron";
import path from "path";
import child_process from "child_process";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow: BrowserWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)).then(() => {
      mainWindow.webContents.send("main-to-render", "Ping 1 (send from main process)");
    });
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
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

ipcMain.handle("dialog", (event: IpcMainInvokeEvent, method: any, params: any[]) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  dialog[method](params);
});

ipcMain.handle("execute", async (event: IpcMainInvokeEvent, command: string) => {
  const proc = child_process.spawn(command, [], {
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  proc.stdout.on("data", (data) => {
    mainWindow.webContents.send("main-to-render", data.toString());
  });
  proc.stderr.on("data", (data) => {
    mainWindow.webContents.send("main-to-render", data.toString());
  });
  proc.on("close", (code) => {
    mainWindow.webContents.send("main-to-render", code);
  });
});

ipcMain.on("render-to-main", (event, message) => {
  console.log(message); // Pong 1 (send from render process)
});

ipcMain.handle("render-to-main-to-render", (event, message) => {
  console.log(message); // Ping 2 (invoke from render process)
  return "Pong 2 (handle from main process)";
});
