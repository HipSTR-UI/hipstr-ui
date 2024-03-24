import { Heading, Button, VStack, useToast, Divider, Code } from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import { FC, useEffect, useRef, useState } from "react";
import { bedAtom, fastaAtom, filesAtom, outputAtom } from "src/jotai/execute";

const spaces = "  ";

function parseJSON(value: string) {
  try {
    return JSON.parse(value);
  } catch (ex) {
    return null;
  }
}

export const ExecutionTab: FC = () => {
  const toast = useToast();
  const [executing, setExecuting] = useState(false);
  const [cmdOut, setCmdOut] = useState("");
  const [fasta] = useAtom(fastaAtom);
  const [bed] = useAtom(bedAtom);
  const [output] = useAtom(outputAtom);
  const files = useAtomValue(filesAtom);
  const outRef = useRef(null);

  useEffect(() => {
    ipcRender.receive("main-to-render", (result: string) => {
      const json = parseJSON(result);
      if (!json) {
        setCmdOut((prev) => `${prev}\n${result}`);
        setTimeout(() => {
          outRef.current.scrollTo({ top: outRef.current.scrollHeight, left: 0 }); //, behavior: "smooth"
        }, 1);
      } else {
        if (json.exitCode && json.exitCode !== 0) {
          toast({
            title: "Command execution failed",
            status: "error",
          });
        }
      }
    });
  }, []);

  const params = [
    ["fasta", fasta],
    ["regions", bed],
    ["str-vcf", output],
    ["min-reads", 8],
    ["def-stutter-model"],
    ["max-str-len", 127],
    ["bams", files],
  ];

  const formattedParams = params
    .map(([name, value]) => {
      const separator = `\\\n${spaces}${spaces}`;
      let valueStr = "";
      if (value) {
        valueStr = Array.isArray(value) ? ` ${separator}` + value.join(`,`) + "\n" : ` ${value}`;
      }
      return ` \\\n${spaces}--${name}${valueStr}`;
    })
    .join("");

  const cmdStr = `/Users/jesus/Proyectos/HipSTR/HipSTR${formattedParams}`;

  const validParameters = !!fasta && !!bed && !!output;
  return (
    <VStack gap="2" alignItems="flex-start">
      <Heading as="h3" size="sm">
        Command to execute
      </Heading>

      <Code
        ref={outRef}
        display="flex"
        whiteSpace="pre-wrap"
        flexGrow={1}
        w="100%"
        overflowY="auto"
        overflowX="hidden"
        h="575px"
      >
        {cmdStr}
        {executing ? cmdOut : ""}
      </Code>

      <Divider mt="4" />
      <Button
        size="sm"
        isDisabled={!validParameters}
        onClick={async () => {
          await ipcRender.invoke("execute", cmdStr);
          setCmdOut("");
          setExecuting(true);
        }}
      >
        Execute
      </Button>
    </VStack>
  );
};
