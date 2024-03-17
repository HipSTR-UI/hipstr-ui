import { Heading, Button, VStack, HStack, UnorderedList, ListItem, useToast, Divider } from "@chakra-ui/react";
import { OpenDialogReturnValue } from "electron";
import { useAtom } from "jotai";
import { FC } from "react";
import { filesAtom } from "src/jotai/execute";

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

  return (
    <VStack gap="2" alignItems="flex-start">
      <Heading as="h3" size="sm">
        Input files
      </Heading>
      <HStack>
        <Button
          size="sm"
          onClick={async () => {
            const dialogConfig = {
              title: "Select files or folder",
              buttonLabel: "Select",
              properties: ["openFile", "multiSelections", "openDirectory"],
            };
            const result = (await electron.dialog("showOpenDialog", dialogConfig)) as OpenDialogReturnValue;
            if (result.canceled) {
              return;
            }
            let fileList: string[] = [];
            for (const filePath of result.filePaths) {
              fileList = fileList.concat(await getFilesFromPath(filePath));
            }
            // filter for valid files
            fileList = fileList.filter((path) => /\.(bam|cram)$/i.test(path));
            if (fileList.length < 1) {
              toast({
                title: "No files with bam/cram extension found",
                status: "error",
              });
              return;
            }
            setFiles(fileList);
          }}
        >
          Select files/folder
        </Button>
      </HStack>
      <UnorderedList>
        {files?.map((file) => (
          <ListItem key={file}>{file}</ListItem>
        ))}
      </UnorderedList>

      <Divider mt="4" />
      <Button
        size="sm"
        isDisabled={!files?.length}
        onClick={async () => {
          onFinish();
        }}
      >
        Continue
      </Button>
    </VStack>
  );
};
