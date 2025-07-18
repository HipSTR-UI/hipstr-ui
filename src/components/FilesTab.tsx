import {
  Heading,
  Button,
  VStack,
  HStack,
  useToast,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
} from "@chakra-ui/react";
import { OpenDialogReturnValue } from "electron";
import { useAtom } from "jotai";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { filesAtom } from "src/jotai/execute";
import { formatFileSize } from "src/lib/file";
import { useSentry } from "src/hooks/useSentry";

async function getFilesFromPath(path: string) {
  let result: string[] = [];
  if (await electron.isFolder(path)) {
    const files = await electron.getFilesFromFolder(path);
    for (const p of files) {
      const fPath = `${path}/${p}`;
      const list = await getFilesFromPath(fPath);
      result = result.concat(list);
    }
  } else {
    result.push(path);
  }
  return result;
}

export const FilesTab: FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const toast = useToast();
  const [files, setFiles] = useAtom(filesAtom);
  const { t } = useTranslation();
  const { captureError, setTag } = useSentry();

  return (
    <VStack gap="2" alignItems="flex-start" pb="4">
      <Heading as="h3" size="sm">
        {t("inputFiles")}
      </Heading>
      <HStack>
        <Button
          size="sm"
          onClick={async () => {
            try {
              setTag("action", "file-selection");

              const dialogConfig = {
                title: t("selectFilesOrFolder"),
                buttonLabel: t("select"),
                properties: ["openFile", "multiSelections", "openDirectory"],
              };
              const result = (await electron.dialog("showOpenDialog", dialogConfig)) as OpenDialogReturnValue;
              if (result.canceled) {
                return;
              }
              let fileList: { path: string; size: number }[] = [];
              for (const filePath of result.filePaths) {
                for (const file of await getFilesFromPath(filePath)) {
                  const stats = await electron.fs("statSync", [file]);
                  fileList.push({ path: file, size: stats.size });
                }
              }
              // filter for valid files
              fileList = fileList.filter((file) => /\.(bam|cram)$/i.test(file.path));
              if (fileList.length < 1) {
                toast({
                  title: t("noFilesWithBamCramExtensionFound"),
                  status: "error",
                });
                return;
              }
              setFiles(fileList);
            } catch (error) {
              captureError(error as Error, {
                component: "FilesTab",
                action: "file-selection",
              });
              toast({
                title: t("errorSelectingFiles"),
                status: "error",
              });
            }
          }}
        >
          {t("selectFilesOrFolder")}
        </Button>
      </HStack>

      {files?.length > 0 && (
        <Text fontWeight="bold">
          {files?.length} {t("filesSelected")}
        </Text>
      )}
      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>{t("filePath")}</Th>
            <Th>{t("size")}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {files?.map((file: { path: string; size: number }) => {
            return (
              <Tr key={file.path}>
                <Td>{file.path}</Td>
                <Td>{formatFileSize(file.size)}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <Divider mt="4" />
      <Button
        size="sm"
        isDisabled={!files?.length}
        onClick={async () => {
          onFinish();
        }}
      >
        {t("continue")}
      </Button>
    </VStack>
  );
};
