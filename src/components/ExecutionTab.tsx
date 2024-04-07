import {
  Heading,
  Button,
  VStack,
  useToast,
  Divider,
  Code,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import { FC, useEffect, useRef, useState } from "react";
import { SUPPORTED_PLATFORM_ARCHS } from "src/constants/global";
import { bedAtom, fastaAtom, filesAtom, outputAtom, paramsAtom } from "src/jotai/execute";
import { osAtom } from "src/jotai/os";

const spaces = "  ";

export const ExecutionTab: FC = () => {
  const toast = useToast();
  const [executing, setExecuting] = useState(false);
  const [indexesOut, setIndexesOut] = useState("");
  const [cmdOut, setCmdOut] = useState("");
  const [fasta] = useAtom(fastaAtom);
  const [bed] = useAtom(bedAtom);
  const [output] = useAtom(outputAtom);
  const files = useAtomValue(filesAtom);
  const outRef = useRef(null);
  const os = useAtomValue(osAtom);
  const params = useAtomValue(paramsAtom);
  const samtoolsPath = `${os.resourcesPath}/samtools/${os.platform}-${os.arch}/samtools`;

  useEffect(() => {
    ipcRender.receive("main-to-render", (result: string | { exitCode: number }) => {
      if (typeof result === "string") {
        setCmdOut((prev) => `${prev}\n${result}`);
        setTimeout(() => {
          outRef.current.scrollTo({ top: outRef.current.scrollHeight, left: 0 }); //, behavior: "smooth"
        }, 1);
      } else {
        if (result.exitCode && result.exitCode !== 0) {
          toast({
            title: "Command execution failed",
            status: "error",
          });
        }
        setExecuting(false);
      }
    });
  }, []);

  const allParams: Record<string, string | boolean> = {
    fasta,
    regions: bed,
    "str-vcf": output,
    ...params,
    bams: files,
  };

  const formattedParams = Object.entries(allParams)
    .map(([name, value]) => {
      let valueStr = "";
      if (value && value !== true) {
        valueStr = Array.isArray(value) ? ` ${value.join(`,`)}` : ` ${value}`;
      }
      return ` \\\n${spaces}--${name}${valueStr}`;
    })
    .join("");

  const cmdStr = `${os.resourcesPath}/hipstr/${os.platform}-${os.arch}/HipSTR${formattedParams}`;

  const osSupported = SUPPORTED_PLATFORM_ARCHS.includes(`${os.platform}-${os.arch}`);
  const validParameters = osSupported && !!fasta && !!bed && !!output;
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
        overflowX="auto"
        h="575px"
        bg="#111416"
        color="#eeeeec"
      >
        {!cmdOut ? cmdStr : ""}
        {indexesOut ? `${indexesOut}\n\n\n` : ""}
        {cmdOut}
      </Code>

      {!osSupported && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Your OS/Arch is not supported!</AlertTitle>
          <AlertDescription>This software doesn't support your OS/Architecture yet.</AlertDescription>
        </Alert>
      )}

      <Divider mt="4" />
      <Button
        size="sm"
        isDisabled={!validParameters || executing}
        onClick={async () => {
          setIndexesOut("");
          setCmdOut("");
          setExecuting(true);
          // Check fasta index
          if (!(await hasIndexFile(fasta))) {
            setIndexesOut((prev) => `${prev}\nFasta index not found, creating..`);
            if (!(await createIndexFile(samtoolsPath, fasta))) {
              setIndexesOut((prev) => `${prev}\nCould not create index file, skipping`);
            }
          }
          // Check files index
          for (const file of files) {
            if (!(await hasIndexFile(file))) {
              setIndexesOut((prev) => `${prev}\n${file} index not found, creating..`);
              if (!(await createIndexFile(samtoolsPath, file))) {
                setIndexesOut((prev) => `${prev}\nCould not create index file, skipping`);
              }
            }
          }
          setCmdOut((prev) => `${prev ? "\n" : ""}${cmdStr}`);
          // Execute HipSTR
          await ipcRender.invoke("execute", cmdStr);
        }}
      >
        Execute
      </Button>
    </VStack>
  );
};

async function createIndexFile(samtoolsPath: string, path: string) {
  try {
    return await electron.execSync(`${samtoolsPath} index ${path}`);
  } catch (ex) {
    alert(`${ex}`);
    console.error(ex);
    return false;
  }
}

async function hasIndexFile(path: string) {
  return await electron.fs("existsSync", `${path}.${getIndexExtension(path)}`);
}

function getIndexExtension(path: string) {
  if (path.endsWith(".bam")) {
    return "bai";
  } else if (path.endsWith(".fa")) {
    return "fai";
  } else if (path.endsWith(".cram")) {
    return "crai";
  }
}
