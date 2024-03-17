import { Button, ChakraProvider, Heading } from "@chakra-ui/react";
import { ElectronHandler, IpcRenderHandler } from "./preload";
import { theme } from "src/lib/theme";

declare const electron: ElectronHandler;
declare const ipcRender: IpcRenderHandler;

ipcRender.receive("main-to-render", (result: string) => {
  console.log(result); // Ping 1 (send from main process)
  // Manually reply to main process (on a different channel)
  ipcRender.send("render-to-main", "Pong 1 (send from render process)");
});

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      {/* <Heading>HipSTR UI</Heading> */}
      <Heading as="h2" size="md">
        Input files
      </Heading>
      <Button
        onClick={() => {
          const dialogConfig = {
            title: "Select a file",
            buttonLabel: "This one will do",
            properties: ["openFile", "multiSelections", "openDirectory"],
          };
          electron.openDialog("showOpenDialog", dialogConfig).then((result) => console.log(result));
        }}
      >
        Select files
      </Button>
      <Button
        onClick={async () => {
          // ipcRender.invoke("render-to-main-to-render", "Ping 2 (invoke from render process)").then((result) => {
          //   console.log(result);
          // }); // Pong 2 (handle from main process)
          const result = await ipcRender.invoke("execute", "ping -c 4 8.8.8.8");
          console.log(result);
        }}
      >
        Execute command
      </Button>

      <Heading as="h2" size="md">
        Parameters
      </Heading>

      <Heading as="h2" size="md">
        Command
      </Heading>
    </ChakraProvider>
  );
}
