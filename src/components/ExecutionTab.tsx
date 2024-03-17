import { Heading, Button, VStack, useToast, Divider, Code, Box } from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import { FC } from "react";
import { bedAtom, fastaAtom, filesAtom, outputAtom } from "src/jotai/execute";

export const ExecutionTab: FC = () => {
  const toast = useToast();
  const [fasta] = useAtom(fastaAtom);
  const [bed] = useAtom(bedAtom);
  const [output] = useAtom(outputAtom);
  const files = useAtomValue(filesAtom);

  const filesStr = (files ?? []).join(",");

  const validParameters = !!fasta && !!bed && !!output;
  return (
    <VStack gap="2" alignItems="flex-start">
      <Heading as="h3" size="sm">
        Command to execute
      </Heading>

      <Box maxW="100%" overflow="auto">
        <Code>
          HipSTR --bams {filesStr} --fasta {fasta} --regions {bed} --str-vcf {output} --min-reads 8 --def-stutter-model
          --max-str-len 127
        </Code>
      </Box>

      <Divider mt="4" />
      <Button
        size="sm"
        isDisabled={!validParameters}
        onClick={async () => {
          //
        }}
      >
        Execute
      </Button>
    </VStack>
  );
};

{
  /* <Button
          onClick={async () => {
            // ipcRender.invoke("render-to-main-to-render", "Ping 2 (invoke from render process)").then((result) => {
            //   console.log(result);
            // }); // Pong 2 (handle from main process)
            const result = await ipcRender.invoke("execute", "ping -c 4 8.8.8.8");
            console.log(result);
          }}
        >
          Execute command
        </Button> */
}
