import { ChakraProvider, Tabs, TabList, TabPanels, Tab, TabPanel, Image } from "@chakra-ui/react";
import { useState } from "react";
import { ExecutionTab } from "src/components/ExecutionTab";
import { FilesTab } from "src/components/FilesTab";
import { ParametersTab } from "src/components/ParametersTab";
import { hipstr } from "src/images";
import { theme } from "src/lib/theme";

export default function App() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <ChakraProvider theme={theme}>
      <Image src={hipstr} alt="HipSTR" height={70} />
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
