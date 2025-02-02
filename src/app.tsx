import { ChakraProvider, Tabs, TabList, TabPanels, Tab, TabPanel, Image, Link, HStack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { BedTab } from "src/components/BedTab";
import { ExecutionTab } from "src/components/ExecutionTab";
import { FilesTab } from "src/components/FilesTab";
import { ParametersTab } from "src/components/ParametersTab";
import { ResultsTab } from "src/components/ResultsTab";
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
          <Tab>Results</Tab>
        </TabList>

        <TabPanels flexGrow={1} overflowY="auto" display="flex">
          <TabPanel flexGrow={1}>
            <FilesTab onFinish={() => setTabIndex(1)} />
          </TabPanel>
          <TabPanel flexGrow={1}>
            <BedTab onFinish={() => setTabIndex(2)} />
          </TabPanel>
          <TabPanel flexGrow={1}>
            <ParametersTab onFinish={() => setTabIndex(3)} />
          </TabPanel>
          <TabPanel flexGrow={1}>
            <ExecutionTab onFinish={() => setTabIndex(4)} />
          </TabPanel>
          <TabPanel flexGrow={1}>
            <ResultsTab onFinish={() => {}} />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <HStack id="footer" bg="gray.100" px="4" py="2" justifyContent="center">
        <Link href="https://github.com/tfwillems/HipSTR" target="_blank" fontSize="small">
          GitHub
        </Link>
        <Text>•</Text>
        <Link href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5482724/" target="_blank" fontSize="small">
          Paper
        </Link>
      </HStack>
    </ChakraProvider>
  );
}
