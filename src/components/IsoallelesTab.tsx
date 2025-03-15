import {
  VStack,
  useToast,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  HStack,
  Input,
  Center,
  Checkbox,
  Select,
  Text,
} from "@chakra-ui/react";
import { FC, useMemo, useState } from "react";
import { FileParameter } from "src/components/FileParameter";
import { useAtom } from "jotai";
import { bedAtom, vcfPathAtom } from "src/jotai/execute";
import { getSamplesAndMarkersMap, SampleValues } from "src/lib/vcf";
import { getMarkersMap, Marker, parseBed } from "src/lib/bed";
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel } from "@tanstack/react-table";
import { utils as xlsxUtils, writeFile } from "xlsx";
import { useTranslation } from "react-i18next";

export const IsoallelesTab: FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [vcfPath, setVcfPath] = useAtom(vcfPathAtom);
  const [bedPath] = useAtom(bedAtom);
  const toast = useToast();
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [markerSamplesMap, setMarkerSamplesMap] = useState<{
    [sampleId: string]: { [markerId: string]: SampleValues };
  }>({});
  const { t } = useTranslation();

  return (
    <VStack gap="4" alignItems="flex-start" pb="4">
      <FileParameter
        label="VCF file"
        value={vcfPath}
        onChange={(path) => {
          if (!/\.vcf|\.vcf\.gz$/i.test(path)) {
            toast({
              title: t("fileDoesntHaveVcfGzExtension"),
              status: "error",
            });
            return;
          }
          setVcfPath(path);
        }}
      />

      <Button
        size="sm"
        disabled={!vcfPath}
        onClick={async () => {
          if (!vcfPath) {
            toast({
              title: t("vcfFileIsRequired"),
              status: "error",
            });
            return;
          } else if (vcfPath.endsWith(".gz")) {
            const result = await electron.extractGz(vcfPath);
            if (result !== true) {
              console.error(result);
              toast({
                title: t("errorExtractingVcfFile"),
                description: result.toString(),
                status: "error",
              });
              return;
            }
          }
          const bedContent = await electron.fs("readFileSync", [bedPath, { encoding: "utf8", flag: "r" }]);
          const markers = parseBed(bedContent);
          setMarkers(markers);
          const markersMap = getMarkersMap(markers);
          const vcfContent = await electron.fs("readFileSync", [
            vcfPath.replace(".gz", ""),
            { encoding: "utf8", flag: "r" },
          ]);
          const result = getSamplesAndMarkersMap(vcfContent, markersMap);
          setMarkerSamplesMap(result.markerSamplesMap);
        }}
      >
        {t("start")}
      </Button>
      {markerSamplesMap && <ResultsTable markers={markers} markerSamplesMap={markerSamplesMap} />}
    </VStack>
  );
};

function getLetterFromIndex(index: number) {
  if (index < 0) {
    return "";
  }
  return String.fromCharCode(65 + index);
}

const LEFT_ALIGN_COLUMNS = ["seq1", "seq2"];

const ResultsTable: FC<{
  markers: Marker[];
  markerSamplesMap: { [markerId: string]: { [sampleId: string]: SampleValues } };
}> = ({ markers: markersFromProps, markerSamplesMap }) => {
  const [markerSearchTerm, setMarkerSearchTerm] = useState("");
  const [sampleSearchTerm, setSampleSearchTerm] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    // "gt",
    // "gb",
    // "q",
    // "pq",
    "ref",
    // "period",
    "allele1",
    "allele2",
    // "dp",
    "seq1",
    "seq2",
  ]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { t } = useTranslation();

  const { markers, data, isoallelesList } = useMemo(() => {
    const isoallelesList: string[] = [];
    // Get unique markers
    const markerSet = new Set<string>();
    Object.entries(markerSamplesMap).forEach(([_, markers]) => {
      Object.keys(markers).forEach((marker) => markerSet.add(marker));
    });
    const markers = Array.from(markerSet).filter((marker) =>
      marker.toLowerCase().includes(markerSearchTerm.toLowerCase())
    );

    // Transform data to have samples as rows and markers as columns
    const rows: any[] = [];
    Object.entries(markerSamplesMap).forEach(([sample, markerValues]) => {
      const marker = markerSearchTerm;
      // Skip if sample doesn't match search term
      if (!marker || !sample.toLowerCase().includes(sampleSearchTerm.toLowerCase())) {
        return;
      }
      const mk = Object.values(markersFromProps).find((m) => m.name === marker);
      const values = markerValues[marker];
      if (
        (markerValues[marker].seq1 === values.ref || markerValues[marker].allele1 !== mk?.refAllele) &&
        (markerValues[marker].seq2 === values.ref || markerValues[marker].allele2 !== mk?.refAllele)
      ) {
        return;
      }

      const row: any = { sample };
      if (values) {
        if (values.allele1 === mk?.refAllele && values.seq1 !== values.ref && !isoallelesList.includes(values.seq1)) {
          isoallelesList.push(values.seq1);
        }
        const isoalleleIndex1 = isoallelesList.indexOf(values.seq1);
        if (values.allele2 === mk?.refAllele && values.seq2 !== values.ref && !isoallelesList.includes(values.seq2)) {
          isoallelesList.push(values.seq2);
        }
        const isoalleleIndex2 = isoallelesList.indexOf(values.seq2);
        if (selectedColumns.includes("gt")) {
          const [gt1, gt2] = values.gt?.split("|") || ["", ""];
          row[`${marker}_gt1`] = gt1;
          row[`${marker}_gt2`] = gt2;
        }
        if (selectedColumns.includes("gb")) {
          const [gb1, gb2] = values.gb?.split("|") || ["", ""];
          row[`${marker}_gb1`] = gb1;
          row[`${marker}_gb2`] = gb2;
        }
        if (selectedColumns.includes("q")) row[`${marker}_q`] = values.q;
        if (selectedColumns.includes("pq")) row[`${marker}_pq`] = values.pq;
        if (selectedColumns.includes("ref")) row[`${marker}_ref`] = mk?.refAllele;
        if (selectedColumns.includes("period")) row[`${marker}_period`] = mk?.period;
        if (selectedColumns.includes("allele1"))
          row[`${marker}_allele1`] = values.allele1 + getLetterFromIndex(isoalleleIndex1);
        if (selectedColumns.includes("allele2"))
          row[`${marker}_allele2`] = values.allele2 + getLetterFromIndex(isoalleleIndex2);
        if (selectedColumns.includes("dp")) row[`${marker}_dp`] = values.dp;

        // Add alt column that shows alt or ref sequence based on GT value
        if (selectedColumns.includes("seq1")) {
          row[`${marker}_seq1`] = values.seq1;
        }
        if (selectedColumns.includes("seq2")) {
          row[`${marker}_seq2`] = values.seq2;
        }
      }
      rows.push(row);
    });
    return { markers, data: rows, isoallelesList };
  }, [markerSamplesMap, markerSearchTerm, sampleSearchTerm, selectedColumns]);

  const columns = useMemo(() => {
    const cols: any[] = [
      {
        header: t("sample"),
        accessorKey: "sample",
      },
    ];

    markers.forEach((marker) => {
      const subColumns = [
        { key: "gt", header: t("gt1"), accessorKey: `${marker}_gt1` },
        { key: "gt", header: t("gt2"), accessorKey: `${marker}_gt2` },
        { key: "gb", header: t("gb1"), accessorKey: `${marker}_gb1` },
        { key: "gb", header: t("gb2"), accessorKey: `${marker}_gb2` },
        { key: "q", header: t("q"), accessorKey: `${marker}_q` },
        { key: "pq", header: t("pq"), accessorKey: `${marker}_pq` },
        { key: "ref", header: t("refAllele"), accessorKey: `${marker}_ref` },
        { key: "period", header: t("period"), accessorKey: `${marker}_period` },
        { key: "allele1", header: t("allele1"), accessorKey: `${marker}_allele1` },
        { key: "allele2", header: t("allele2"), accessorKey: `${marker}_allele2` },
        { key: "dp", header: t("dp"), accessorKey: `${marker}_dp` },
        { key: "seq1", header: t("seq1"), accessorKey: `${marker}_seq1` },
        { key: "seq2", header: t("seq2"), accessorKey: `${marker}_seq2` },
      ].filter((col) => selectedColumns.includes(col.key));

      cols.push({
        id: marker,
        header: () => <Center bg="gray.100">{marker}</Center>,
        columns: subColumns.map(({ header, accessorKey }) => ({
          header,
          accessorKey,
        })),
      });
    });

    return cols;
  }, [markers, selectedColumns]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
  });

  const handleExportToExcel = async () => {
    const worksheet = xlsxUtils.json_to_sheet([]);
    // Create first row with marker names
    const firstRow = [""];
    let colIndex = 1; // Start after sample column
    markers.forEach((marker) => {
      // Add marker name as first cell in the group
      firstRow[colIndex] = marker;
      // Fill remaining columns in group with empty strings
      const extraCols = (selectedColumns.includes("gt") ? 1 : 0) + (selectedColumns.includes("gb") ? 1 : 0);
      for (let i = 1; i < selectedColumns.length + extraCols; i++) {
        firstRow[colIndex + i] = "";
      }
      colIndex += selectedColumns.length + extraCols;
    });
    xlsxUtils.sheet_add_json(worksheet, [firstRow], { skipHeader: true });
    xlsxUtils.sheet_add_json(worksheet, data, { origin: 1 });
    // Replace second row with column names
    const secondRow = [t("sample")];
    markers.forEach(() => {
      // Grab the first marker column and use the subcolumns
      columns[1].columns.forEach((col: { header: string }) => {
        secondRow.push(col.header);
      });
    });
    xlsxUtils.sheet_add_json(worksheet, [secondRow], { skipHeader: true, origin: "A2" });

    const workbook = xlsxUtils.book_new();
    xlsxUtils.book_append_sheet(workbook, worksheet, t("results"));
    writeFile(workbook, "results.xlsx");
  };

  const marker = markersFromProps.find((m) => m.name === markerSearchTerm);
  const refSequence = Object.entries(markerSamplesMap)[0]?.[1]?.[markerSearchTerm]?.ref;
  return (
    <VStack alignSelf="stretch" spacing={4}>
      <VStack spacing={4} alignSelf="flex-start">
        <HStack spacing={4} alignSelf="stretch">
          <Input
            placeholder={t("searchBySample")}
            value={sampleSearchTerm}
            onChange={(e) => setSampleSearchTerm(e.target.value)}
            size="sm"
          />
          <Select
            size="sm"
            placeholder={t("selectMarker")}
            value={markerSearchTerm}
            onChange={(e) => setMarkerSearchTerm(e.target.value)}
            color={!markerSearchTerm ? "red.500" : ""}
          >
            {markersFromProps.map((marker) => (
              <option key={marker.name} value={marker.name}>
                {marker.name}
              </option>
            ))}
          </Select>
          <Button size="sm" onClick={handleExportToExcel} flexShrink={0}>
            {t("exportToExcel")}
          </Button>
        </HStack>
        {marker && (
          <IsoallelesTable refAllele={marker.refAllele} refSequence={refSequence} isoallelesList={isoallelesList} />
        )}
        <HStack spacing={2}>
          {[
            { key: "gt", label: t("gt") },
            { key: "gb", label: t("gb") },
            { key: "q", label: t("q") },
            { key: "pq", label: t("pq") },
            { key: "ref", label: t("refAllele") },
            { key: "period", label: t("period") },
            { key: "allele1", label: t("allele1") },
            { key: "allele2", label: t("allele2") },
            { key: "dp", label: t("dp") },
            { key: "seq1", label: t("seq1") },
            { key: "seq2", label: t("seq2") },
          ].map(({ key, label }) => (
            <Checkbox
              key={key}
              isChecked={selectedColumns.includes(key)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedColumns([...selectedColumns, key]);
                } else {
                  setSelectedColumns(selectedColumns.filter((col) => col !== key));
                }
              }}
            >
              {label}
            </Checkbox>
          ))}
        </HStack>
      </VStack>
      <Table variant="simple" size="sm">
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Th key={header.id} colSpan={header.colSpan} textAlign="center">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.map((row) => (
            <Tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Td
                  key={cell.id}
                  textAlign={LEFT_ALIGN_COLUMNS.includes(cell.column.id.split("_")[1]) ? "left" : "center"}
                  fontFamily={LEFT_ALIGN_COLUMNS.includes(cell.column.id.split("_")[1]) ? "mono" : ""}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
      <HStack spacing={2} alignSelf="flex-start">
        <Button onClick={() => table.setPageIndex(0)} isDisabled={!table.getCanPreviousPage()} size="sm">
          {"<<"}
        </Button>
        <Button onClick={() => table.previousPage()} isDisabled={!table.getCanPreviousPage()} size="sm">
          {"<"}
        </Button>
        <Button onClick={() => table.nextPage()} isDisabled={!table.getCanNextPage()} size="sm">
          {">"}
        </Button>
        <Button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          isDisabled={!table.getCanNextPage()}
          size="sm"
        >
          {">>"}
        </Button>
        <Text>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </Text>
        <Select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          size="sm"
          w="120px"
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </Select>
      </HStack>
    </VStack>
  );
};

const IsoallelesTable: FC<{
  refAllele: number;
  refSequence: string;
  isoallelesList: string[];
}> = ({ refAllele, refSequence, isoallelesList }) => {
  const { t } = useTranslation();

  const highlightDifferences = (sequence: string) => {
    return sequence.split("").map((char, i) => {
      if (i >= refSequence.length || char !== refSequence[i]) {
        return (
          <Text as="span" color="red" key={i}>
            {char}
          </Text>
        );
      }
      return char;
    });
  };

  return (
    <VStack spacing={2} w="100%">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>{t("allele")}</Th>
            <Th>{t("sequence")}</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td fontFamily="mono">{refAllele}</Td>
            <Td fontFamily="mono">{refSequence}</Td>
          </Tr>
          {isoallelesList.map((isoallele, index) => (
            <Tr key={isoallele}>
              <Td fontFamily="mono">
                {refAllele}
                {getLetterFromIndex(index)}
              </Td>
              <Td fontFamily="mono">{highlightDifferences(isoallele)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </VStack>
  );
};
