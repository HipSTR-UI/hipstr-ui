import { Button, ChakraProvider, Heading, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { useState } from "react";
import { ExecutionTab } from "src/components/ExecutionTab";
import { FilesTab } from "src/components/FilesTab";
import { ParametersTab } from "src/components/ParametersTab";
import { theme } from "src/lib/theme";

ipcRender.receive("main-to-render", (result: string) => {
  console.log(result); // Ping 1 (send from main process)
  // Manually reply to main process (on a different channel)
  ipcRender.send("render-to-main", "Pong 1 (send from render process)");
});

export default function App() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <ChakraProvider theme={theme}>
      <Tabs index={tabIndex} onChange={(index) => setTabIndex(index)}>
        <TabList>
          <Tab>Files</Tab>
          <Tab>Parameters</Tab>
          <Tab>Execution</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <FilesTab onFinish={() => setTabIndex(1)} />
          </TabPanel>
          <TabPanel>
            <ParametersTab onFinish={() => setTabIndex(2)} />
          </TabPanel>
          <TabPanel>
            <ExecutionTab />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ChakraProvider>
  );
}
