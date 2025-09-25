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
import { bedAtom, vcfPathAtom, resultsMarkersAtom, markerSamplesMapAtom } from "src/jotai/execute";
import { getSamplesAndMarkersMap, SampleValues } from "src/lib/vcf";
import { getMarkersMap, Marker, parseBed } from "src/lib/bed";
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel } from "@tanstack/react-table";
import { utils as xlsxUtils, writeFile } from "xlsx";
import { useTranslation } from "react-i18next";

export const ResultsTab: FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [vcfPath, setVcfPath] = useAtom(vcfPathAtom);
  const [bedPath] = useAtom(bedAtom);
  const toast = useToast();
  const [markers, setMarkers] = useAtom(resultsMarkersAtom);
  const [markerSamplesMap, setMarkerSamplesMap] = useAtom(markerSamplesMapAtom);
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
          if (!result) {
            return;
          }
          setMarkerSamplesMap(result.markerSamplesMap);
        }}
      >
        {t("start")}
      </Button>
      {markerSamplesMap && <ResultsTable markers={markers} markerSamplesMap={markerSamplesMap} />}
    </VStack>
  );
};

const ResultsTable: FC<{
  markers: Marker[];
  markerSamplesMap: { [markerId: string]: { [sampleId: string]: SampleValues } };
}> = ({ markers: markersFromProps, markerSamplesMap }) => {
  const [markerSearchTerm, setMarkerSearchTerm] = useState("");
  const [sampleSearchTerm, setSampleSearchTerm] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "gt",
    "gb",
    "q",
    "pq",
    // "ref",
    // "period",
    "allele1",
    "allele2",
    "dp",
  ]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { t } = useTranslation();

  // Rewrites specific allele fractional parts at display/export time
  const rewriteAlleleDecimal = (val: number | null | undefined) => {
    if (val === null || val === undefined) return val as any;
    const integerPart = Math.floor(val);
    const fractionalPart = val - integerPart;
    const approx = (a: number, b: number) => Math.abs(a - b) < 1e-6;

    let newFraction = fractionalPart;
    if (approx(fractionalPart, 0.75) || approx(fractionalPart, 0.35)) {
      newFraction = 0.3;
    } else if (approx(fractionalPart, 0.25) || approx(fractionalPart, 0.5)) {
      newFraction = 0.2;
    }

    const rewritten = integerPart + newFraction;
    return newFraction === 0.2 || newFraction === 0.3 ? parseFloat(rewritten.toFixed(1)) : rewritten;
  };

  const { markers, data } = useMemo(() => {
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
      // Skip if sample doesn't match search term
      if (!sample.toLowerCase().includes(sampleSearchTerm.toLowerCase())) {
        return;
      }

      const row: any = { sample };
      markers.forEach((marker) => {
        const values = markerValues[marker];
        if (values) {
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
          const mk = Object.values(markersFromProps).find((m) => m.name === marker);
          if (selectedColumns.includes("ref")) row[`${marker}_ref`] = mk?.refAllele;
          if (selectedColumns.includes("period")) row[`${marker}_period`] = mk?.period;
          if (selectedColumns.includes("allele1")) row[`${marker}_allele1`] = rewriteAlleleDecimal(values.allele1);
          if (selectedColumns.includes("allele2")) row[`${marker}_allele2`] = rewriteAlleleDecimal(values.allele2);
          if (selectedColumns.includes("dp")) row[`${marker}_dp`] = values.dp;
        }
      });
      rows.push(row);
    });
    return { markers, data: rows };
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
          <Input
            placeholder={t("searchByMarker")}
            value={markerSearchTerm}
            onChange={(e) => setMarkerSearchTerm(e.target.value)}
            size="sm"
          />
          <Button size="sm" onClick={handleExportToExcel} flexShrink={0}>
            {t("exportToExcel")}
          </Button>
        </HStack>
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
                <Td key={cell.id} textAlign="center">
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
