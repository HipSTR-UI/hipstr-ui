import { Table, Tbody, Td, Th, Thead, Tr, useToast, VStack, Text, Button } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { FC, useEffect, useState } from "react";
import { FileParameter } from "src/components/FileParameter";
import { bedAtom } from "src/jotai/execute";

export const BedTab: FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const toast = useToast();
  const [bed, setBed] = useAtom(bedAtom);
  const [bedContent, setBedContent] = useState<string[]>([]);

  useEffect(() => {
    if (!bed) {
      return;
    }
    (async () => {
      const content = await electron.fs("readFileSync", [bed, "utf8"]);
      setBedContent(content.split("\n"));
    })();
  }, [bed]);

  return (
    <VStack alignItems="flex-start">
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
      {bed && <Text fontWeight="bold">{bedContent.length} markers found</Text>}
      {bed && (
        <Table size="sm" variant="simple" mt={4}>
          <Thead>
            <Tr>
              <Th>Chrom.</Th>
              <Th>Start</Th>
              <Th>End</Th>
              <Th>Period</Th>
              <Th>Ref. Allele</Th>
              <Th>Name</Th>
            </Tr>
          </Thead>
          <Tbody>
            {bedContent.map((line, i) => {
              if (!line.trim()) return null;
              const [chrom, start, end, period, refAllele, name] = line.split("\t");
              return (
                <Tr key={i}>
                  <Td>{chrom}</Td>
                  <Td>{start}</Td>
                  <Td>{end}</Td>
                  <Td>{period}</Td>
                  <Td>{refAllele}</Td>
                  <Td>{name}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
      <Button size="sm" onClick={onFinish}>
        Continue
      </Button>
    </VStack>
  );
};
