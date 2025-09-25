import {
  ChakraProvider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  Link,
  HStack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BedTab } from "src/components/BedTab";
import { ExecutionTab } from "src/components/ExecutionTab";
import { FilesTab } from "src/components/FilesTab";
import { ParametersTab } from "src/components/ParametersTab";
import { ResultsTab } from "src/components/ResultsTab";
import { hipstr } from "src/images";
import { theme } from "src/lib/theme";
import { useTranslation } from "react-i18next";
import { useInitI18n } from "./i18n";
import { LanguageToggle } from "src/components/LanguageToggle";
import { IsoallelesTab } from "src/components/IsoallelesTab";
import { VisualizeTab } from "src/components/VisualizeTab";
import { useAtom } from "jotai";
import { showIsoallelesTabAtom } from "src/jotai/execute";
import { DeveloperOptionsModal } from "src/components/DeveloperOptionsModal";
import ErrorBoundary from "src/components/ErrorBoundary";

export default function App() {
  const { initialized } = useInitI18n();
  if (!initialized) return null;
  return (
    <ErrorBoundary>
      <AppComponent />
    </ErrorBoundary>
  );
}

const AppComponent = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const { t } = useTranslation();
  const [showIsoallelesTab, setShowIsoallelesTab] = useAtom(showIsoallelesTabAtom);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const off = electron.on("toggle-hidden-menu", () => onOpen());
    return () => {
      // @ts-ignore electron.on returns an unsubscribe when our preload wraps it, else noop
      off?.();
    };
  }, [onOpen]);

  useEffect(() => {
    if (!showIsoallelesTab && tabIndex === 6) {
      setTabIndex(4);
    }
  }, [showIsoallelesTab, tabIndex]);

  return (
    <ChakraProvider theme={theme}>
      <HStack pt="4" justifyContent="space-between">
        <Image src={hipstr} alt="HipSTR" height={70} />
        <LanguageToggle />
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
          <Tab>{t("files")}</Tab>
          <Tab>{t("bed")}</Tab>
          <Tab>{t("parameters")}</Tab>
          <Tab>{t("execution")}</Tab>
          <Tab>{t("results")}</Tab>
          <Tab>{t("visualize")}</Tab>
          {showIsoallelesTab && <Tab>{t("isoalleles")}</Tab>}
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
          <TabPanel flexGrow={1}>
            <VisualizeTab onFinish={() => {}} />
          </TabPanel>
          {showIsoallelesTab && (
            <TabPanel flexGrow={1}>
              <IsoallelesTab onFinish={() => {}} />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
      <DeveloperOptionsModal
        isOpen={isOpen}
        onClose={onClose}
        showIsoallelesTab={showIsoallelesTab}
        onToggleIsoalleles={(checked) => setShowIsoallelesTab(checked)}
      />
      <HStack id="footer" bg="gray.100" px="4" py="2" justifyContent="center">
        <Link href="https://github.com/tfwillems/HipSTR" target="_blank" fontSize="small">
          GitHub
        </Link>
        <Text>•</Text>
        <Link href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5482724/" target="_blank" fontSize="small">
          {t("paper")}
        </Link>
      </HStack>
    </ChakraProvider>
  );
};
