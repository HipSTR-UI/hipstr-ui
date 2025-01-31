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
  HStack,
} from "@chakra-ui/react";
import { SaveDialogReturnValue } from "electron";
import { useAtom, useAtomValue } from "jotai";
import { FC, useEffect, useRef, useState } from "react";
import { SUPPORTED_PLATFORM_ARCHS } from "src/constants/global";
import { useGetPath } from "src/hooks/useGetPath";
import { bedAtom, fastaAtom, filesAtom, paramsAtom } from "src/jotai/execute";
import { osAtom } from "src/jotai/os";

const spaces = "  ";

export const ExecutionTab: FC = () => {
  const toast = useToast();
  const [status, setStatus] = useState<"idle" | "executing" | "finished">("idle");
  const [indexesOut, setIndexesOut] = useState("");
  const [cmdOut, setCmdOut] = useState("");
  const [fasta] = useAtom(fastaAtom);
  const [bed] = useAtom(bedAtom);
  const files = useAtomValue(filesAtom);
  const outRef = useRef(null);
  const os = useAtomValue(osAtom);
  const params = useAtomValue(paramsAtom);
  const tempPath = useGetPath("temp");

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
        setStatus("finished");
      }
    });
  }, []);

  const strVcfPath = `${tempPath}/str_calls.vcf.gz`
  const allParams: Record<string, string | boolean> = {
    fasta,
    regions: bed,
    "str-vcf": strVcfPath,
    ...params,
    bams: files.map((file: { path: string }) => file.path),
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
  const validParameters = osSupported && !!fasta && !!bed;
  return (
    <VStack gap="2" alignItems="flex-start" pb="4">
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
        bg="#eeeeec"
        color="#111416"
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
      <HStack>
        <Button
          size="sm"
          isDisabled={!validParameters || status === "executing"}
          onClick={async () => {
            setIndexesOut("");
            setCmdOut("");
            setStatus("executing");
            // Check fasta index
            if (!(await hasIndexFile(fasta))) {
              setIndexesOut((prev) => `${prev}\nFasta index not found, creating..`);
              if (!(await createIndexFile("samtools", fasta))) {
                setIndexesOut((prev) => `${prev}\nCould not create index file, skipping`);
              }
            }
            // Check files index
            for (const file of files as { path: string }[]) {
              if (!(await hasIndexFile(file.path))) {
                setIndexesOut((prev) => `${prev}\n${file.path} index not found, creating..`);
                if (!(await createIndexFile("samtools", file.path))) {
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
        <Button
          size="sm"
          ml={2}
          isDisabled={status !== "finished"}
          onClick={async () => {
            const result: SaveDialogReturnValue = await electron.dialog("showSaveDialog", {
              filters: [{ name: "Log files", extensions: ["txt"] }],
              defaultPath: "hipstr-log.txt",
            });

            if (result.canceled || !result.filePath) {
              return;
            }

            try {
              await electron.fs("copyFileSync", [`${tempPath}/log.txt`, result.filePath]);
            } catch (err) {
              console.error(err);
              alert("Failed to save log file");
            }
          }}
        >
          Save Log
        </Button>
        <Button
          size="sm"
          ml={2}
          isDisabled={status !== "finished"}
          onClick={async () => {
            const result: SaveDialogReturnValue = await electron.dialog("showSaveDialog", {
              filters: [{ name: "VCF files", extensions: ["vcf.gz"] }],
              defaultPath: "str_calls.vcf.gz",
            });

            if (result.canceled || !result.filePath) {
              return;
            }

            try {
              await electron.fs("copyFileSync", [strVcfPath, result.filePath]);
            } catch (err) {
              console.error(err);
              alert("Failed to save VCF file");
            }
          }}
        >
          Save VCF
        </Button>
      </HStack>
    </VStack>
  );
};

async function createIndexFile(samtoolsPath: string, path: string) {
  try {
    await electron.execSync(`${samtoolsPath} index ${path}`);
    return true;
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
