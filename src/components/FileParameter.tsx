import { Button, Heading, Text, VStack } from "@chakra-ui/react";
import { OpenDialogReturnValue } from "electron";
import { FC } from "react";
import { useTranslation } from "react-i18next";

type FileParameterProps = {
  label: string;
  value: string;
  properties?: string[];
  onChange: (path: string) => void;
};

export const FileParameter: FC<FileParameterProps> = ({ label, value, onChange, properties = ["openFile"] }) => {
  const { t } = useTranslation();

  return (
    <VStack gap="1" alignItems="flex-start">
      <Heading as="h3" size="sm">
        {label}
      </Heading>
      <Button
        size="sm"
        onClick={async () => {
          const dialogConfig = {
            title: t("selectFileOrFolder"),
            buttonLabel: t("select"),
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
        {t("select")}
      </Button>
      {value && <Text fontSize="md">{value}</Text>}
    </VStack>
  );
};
