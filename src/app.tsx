import { ChakraProvider, Tabs, TabList, TabPanels, Tab, TabPanel, Image, Link, HStack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { BedTab } from "src/components/BedTab";
import { ExecutionTab } from "src/components/ExecutionTab";
import { FilesTab } from "src/components/FilesTab";
import { ParametersTab } from "src/components/ParametersTab";
import { hipstr } from "src/images";
import { theme } from "src/lib/theme";

export default function App() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <ChakraProvider theme={theme}>
      <HStack pt="4">
        <Image src={hipstr} alt="HipSTR" height={70} />
      </HStack>
      <Tabs
        index={tabIndex}
        onChange={(index) => setTabIndex(index)}
        flexGrow={1}
        display="flex"
        flexDirection="column"
        minH={0}
      >
        <TabList>
          <Tab>Files</Tab>
          <Tab>BED</Tab>
          <Tab>Parameters</Tab>
          <Tab>Execution</Tab>
        </TabList>

        <TabPanels flexGrow={1} overflowY="auto" display="flex">
          <TabPanel>
            <FilesTab onFinish={() => setTabIndex(1)} />
          </TabPanel>
          <TabPanel>
            <BedTab onFinish={() => setTabIndex(2)} />
          </TabPanel>
          <TabPanel>
            <ParametersTab onFinish={() => setTabIndex(3)} />
          </TabPanel>
          <TabPanel>
            <ExecutionTab />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <HStack id="footer" bg="gray.100" p="4" justifyContent="center">
        <Link href="https://github.com/tfwillems/HipSTR" target="_blank">
          GitHub
        </Link>
        <Text>•</Text>
        <Link href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5482724/" target="_blank">
          Paper
        </Link>
      </HStack>
    </ChakraProvider>
  );
}
