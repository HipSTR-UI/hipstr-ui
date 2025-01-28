import { Button, Heading, Text, VStack } from "@chakra-ui/react";
import { OpenDialogReturnValue } from "electron";
import { FC } from "react";

type FileParameterProps = {
  label: string;
  value: string;
  properties?: string[];
  onChange: (path: string) => void;
};

export const FileParameter: FC<FileParameterProps> = ({ label, value, onChange, properties = ["openFile"] }) => {
  return (
    <VStack gap="1" alignItems="flex-start">
      <Heading as="h3" size="sm">
        {label}
      </Heading>
      <Button
        size="sm"
        onClick={async () => {
          const dialogConfig = {
            title: "Select file/folder",
            buttonLabel: "Select",
            properties,
          };
          const result = (await electron.dialog("showOpenDialog", dialogConfig)) as OpenDialogReturnValue;
          if (result.canceled) {
            return;
          }
          const selectedFile = result.filePaths[0];
          onChange(selectedFile);
        }}
      >
        Select
      </Button>
      {value && <Text fontSize="md">{value}</Text>}
    </VStack>
  );
};
