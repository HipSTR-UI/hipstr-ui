import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Box, Heading, HStack, Input, List, ListItem, VStack, Text } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { markerSamplesMapAtom, resultsMarkersAtom } from "src/jotai/execute";
import type { Marker } from "src/lib/bed";
import type { SampleValues } from "src/lib/vcf";
import { ParentSize } from "@visx/responsive";
import { Group } from "@visx/group";
import { scaleLinear, scaleBand } from "@visx/scale";
import { Bar } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { useTooltip, TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { normalizeAllele } from "src/lib/allele";

export const VisualizeTab: FC<{ onFinish: () => void }> = () => {
  const { t } = useTranslation();
  const markers = useAtomValue(resultsMarkersAtom);
  const markerSamplesMap = useAtomValue(markerSamplesMapAtom);
  const [filter, setFilter] = useState("");
  const [selectedMarker, setSelectedMarker] = useState<string | null>(markers?.[0]?.name ?? null);

  // Ensure a marker is selected whenever markers load or change
  useEffect(() => {
    if ((!selectedMarker || !markers?.some((m) => m.name === selectedMarker)) && (markers?.length ?? 0) > 0) {
      setSelectedMarker(markers[0].name);
    }
  }, [markers, selectedMarker]);

  const filteredMarkers = useMemo(() => {
    return (markers || []).filter((m) => m.name.toLowerCase().includes(filter.toLowerCase()));
  }, [markers, filter]);

  const histogramData = useMemo(() => {
    const counts = new Map<number, number>();
    if (!selectedMarker) return [] as { key: number; count: number }[];

    Object.values(markerSamplesMap || {}).forEach((sampleMarkers: { [markerId: string]: SampleValues }) => {
      const values = sampleMarkers[selectedMarker];
      if (!values) return;
      const normalized1 = normalizeAllele(values.allele1, selectedMarker);
      const normalized2 = normalizeAllele(values.allele2, selectedMarker);
      if (normalized1 !== null) counts.set(normalized1, (counts.get(normalized1) || 0) + 1);
      if (normalized2 !== null) counts.set(normalized2, (counts.get(normalized2) || 0) + 1);
    });

    const keys = Array.from(counts.keys()).sort((a, b) => a - b);
    const histogram = keys.map((key) => ({ key, count: counts.get(key) || 0 }));
    return histogram;
  }, [markerSamplesMap, selectedMarker]);

  const hasData = (markers?.length || 0) > 0 && Object.keys(markerSamplesMap || {}).length > 0;

  return (
    <HStack alignItems="stretch" spacing={4} h="100%">
      <VStack w="260px" alignItems="stretch" spacing={3} flexShrink={0}>
        <Input placeholder={t("searchByMarker")} size="sm" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <Box overflowY="auto" borderWidth="1px" borderRadius="md" flexGrow={1}>
          <List>
            {filteredMarkers.map((m: Marker) => (
              <ListItem
                key={m.name}
                px={3}
                py={2}
                cursor="pointer"
                bg={selectedMarker === m.name ? "gray.100" : "transparent"}
                _hover={{ bg: "gray.50" }}
                onClick={() => setSelectedMarker(m.name)}
              >
                <Text fontFamily="mono">{m.name}</Text>
              </ListItem>
            ))}
          </List>
        </Box>
      </VStack>

      <VStack alignItems="stretch" spacing={4} flexGrow={1}>
        {!hasData && (
          <Text color="red.500">{t("noDataLoadResultsFirst", { defaultValue: "No data. Load results first." })}</Text>
        )}

        {hasData && selectedMarker && (
          <HStack alignItems="stretch" spacing={4}>
            <ChartCard title={t("histogram", { defaultValue: "Histogram" })}>
              <ParentSize>
                {({ width, height }) => <Histogram width={width} height={height} data={histogramData} />}
              </ParentSize>
            </ChartCard>
          </HStack>
        )}
      </VStack>
    </HStack>
  );
};

const ChartCard: FC<{ title: string; children: any }> = ({ title, children }) => {
  return (
    <VStack alignItems="stretch" spacing={2} flexGrow={1} minH="360px">
      <Heading as="h3" size="sm">
        {title}
      </Heading>
      <Box borderWidth="1px" borderRadius="md" p={2} flexGrow={1} minH="320px">
        {children}
      </Box>
    </VStack>
  );
};

const margin = { top: 10, right: 20, bottom: 30, left: 40 };

const Histogram: FC<{ width: number; height: number; data: { key: number; count: number }[] }> = ({
  width,
  height,
  data,
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip<{
    key: number;
    count: number;
  }>();
  const keys = data.map((d) => d.key.toString());
  const counts = data.map((d) => d.count);
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const xScale = scaleBand<string>({ domain: keys, range: [0, innerWidth], padding: 0.2 });
  const yScale = scaleLinear<number>({
    domain: [0, Math.max(1, Math.max(...counts, 0)) * 1.2],
    range: [innerHeight, 0],
  });

  return (
    <div style={{ position: "relative" }} ref={containerRef}>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <AxisLeft scale={yScale} tickFormat={(v) => `${v}`} />
          <AxisBottom top={innerHeight} scale={xScale} />
          {data.map((d) => {
            const x = xScale(d.key.toString());
            const barWidth = xScale.bandwidth();
            const y = yScale(d.count);
            const barHeight = innerHeight - y;
            if (x === undefined || Number.isNaN(y)) return null;
            return (
              <Bar
                key={d.key}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#03a9f4"
                onMouseMove={(event) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  showTooltip({
                    tooltipLeft: event.clientX - rect.left,
                    tooltipTop: event.clientY - rect.top - 16,
                    tooltipData: d,
                  });
                }}
                onMouseLeave={() => hideTooltip()}
              />
            );
          })}
        </Group>
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          top={tooltipTop}
          left={tooltipLeft}
          style={{ ...defaultStyles, background: "#1a202c", color: "#fff", borderRadius: 6, padding: "6px 8px" }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{`${t("allele", { defaultValue: "Allele" })}: ${tooltipData.key}`}</div>
            <div>{`${t("samples", { defaultValue: "Samples" })}: ${tooltipData.count}`}</div>
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
};
