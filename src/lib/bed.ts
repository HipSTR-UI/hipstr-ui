export type Marker = {
  chrom: string;
  start: number;
  end: number;
  period: number;
  refAllele: number;
  name: string;
};

export function parseBed(bedContent: string): Marker[] {
  const lines = bedContent.split("\n");
  const markers = lines.map((line) => {
    const [chrom, start, end, period, refAllele, name] = line.split("\t");
    return {
      chrom,
      start: parseInt(start, 10),
      end: parseInt(end, 10),
      period: parseInt(period, 10),
      refAllele: parseInt(refAllele, 10),
      name,
    };
  });
  return markers;
}

export function getMarkersMap(markers: Marker[]) {
  const markersMap: { [markerId: string]: Marker } = {};
  markers.forEach((marker) => {
    markersMap[marker.name] = marker;
  });
  return markersMap;
}
