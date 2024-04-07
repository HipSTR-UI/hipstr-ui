import { Heading, Button, VStack, useToast, Text, Divider, Input, Checkbox } from "@chakra-ui/react";
import { OpenDialogReturnValue } from "electron";
import { useAtom } from "jotai";
import { FC, useEffect } from "react";
import { parameters } from "src/constants/parameters";
import { usePathSeparator } from "src/hooks/usePathSeparator";
import { bedAtom, fastaAtom, outputAtom, paramsAtom } from "src/jotai/execute";

const OUTPUT_FILE_NAME = "str_calls.vcf.gz";

export const ParametersTab: FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const toast = useToast();
  const [fasta, setFasta] = useAtom(fastaAtom);
  const [bed, setBed] = useAtom(bedAtom);
  const [output, setOutput] = useAtom(outputAtom);
  const [params, setParams] = useAtom(paramsAtom);
  const pathSep = usePathSeparator();

  useEffect(() => {
    (async () => {
      if (!bed || !!output) {
        return;
      }
      const dirname = bed.split(pathSep).slice(0, -1).join(pathSep);
      setOutput(`${dirname}${pathSep}${OUTPUT_FILE_NAME}`);
    })();
  }, [bed]);

  const validParameters = !!fasta && !!bed && !!output;
  return (
    <VStack gap="6" alignItems="flex-start">
      <FileParameter
        label="Reference genome fasta"
        value={fasta}
        onChange={(path) => {
          if (!/\.fasta|\.fa$/i.test(path)) {
            toast({
              title: "File doesn't have fasta extension",
              status: "error",
            });
            return;
          }
          setFasta(path);
        }}
      />

      <FileParameter
        label="BED file"
        value={bed}
        onChange={(path) => {
          if (!/\.bed$/i.test(path)) {
            toast({
              title: "File doesn't have bed extension",
              status: "error",
            });
            return;
          }
          setBed(path);
        }}
      />

      <FileParameter
        label="Output file"
        value={output}
        properties={["openDirectory"]}
        onChange={(path) => {
          setOutput(`${path}${pathSep}${OUTPUT_FILE_NAME}`);
        }}
      />

      <Heading as="h3" size="sm">
        Additional parameters
      </Heading>

      {parameters.map((param) => (
        <VStack key={param.name} gap="2" alignItems="flex-start">
          {param.type === "boolean" ? (
            <Checkbox
              onChange={(e) => {
                if (e.target.checked) {
                  setParams({
                    [param.name]: true,
                  });
                } else if (params[param.name]) {
                  const newParams = Object.fromEntries(Object.entries(params).filter(([key]) => key !== param.name));
                  setParams(newParams);
                }
              }}
            >
              <Text as="span" fontSize="sm" fontWeight="600">
                {param.name}:
              </Text>{" "}
              <Text as="span" fontSize="sm" fontWeight="400">
                {param.description}
              </Text>
            </Checkbox>
          ) : (
            <>
              <Heading as="h4" size="xs">
                {param.name}:{" "}
                <Text as="span" fontSize="sm" fontWeight="400">
                  {param.description}
                </Text>
              </Heading>
              <Input
                type={param.type}
                placeholder="Value"
                size="sm"
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    setParams({
                      [param.name]: e.target.value,
                    });
                  } else if (params[param.name]) {
                    const newParams = Object.fromEntries(Object.entries(params).filter(([key]) => key !== param.name));
                    setParams(newParams);
                  }
                }}
              />
            </>
          )}
        </VStack>
      ))}

      <Divider mt="4" />
      <Button
        size="sm"
        isDisabled={!validParameters}
        onClick={async () => {
          onFinish();
        }}
      >
        Continue
      </Button>
    </VStack>
  );
};

type FileParameterProps = {
  label: string;
  value: string;
  properties?: string[];
  onChange: (path: string) => void;
};

const FileParameter: FC<FileParameterProps> = ({ label, value, onChange, properties = ["openFile"] }) => {
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
