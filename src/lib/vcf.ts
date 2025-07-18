import { Marker } from "src/lib/bed";

export type SampleValues = {
  gt: string;
  gb: string;
  q: string;
  pq: string;
  dp: string;
  allele1: number;
  allele2: number;
  ref: string;
  seq1: string;
  seq2: string;
};

export function getSamplesAndMarkersMap(vcfContent: string, markersMap: { [markerId: string]: Marker }) {
  const markerSamplesMap: {
    [sampleId: string]: {
      [markerId: string]: SampleValues;
    };
  } = {};
  const lines = vcfContent.split("\n");
  let samples: string[] = [];

  try {
    for (const line of lines) {
      if (line.startsWith("#CHROM")) {
        samples = line.split("\t").slice(9);
        samples.forEach((sample) => {
          markerSamplesMap[sample] = {};
        });
      }
    }

    for (const line of lines) {
      if (line.startsWith("#")) {
        continue;
      }

      try {
        const [chrom, pos, id, ref, alt, qual, filter, info, format, ...values] = line.split("\t");
        const altList = alt.split(",");

        values.forEach((sampleValues, index) => {
          if (!sampleValues) {
            return;
          }

          try {
            if (!format.startsWith("GT:GB:Q:PQ:DP")) {
              throw new Error("Invalid format, expecting GT:GB:Q:PQ:DP");
            }

            const [gt, gb, q, pq, dp] = sampleValues.split(":");
            const [bp1, bp2] = gb ? gb.split("|") : [];

            // Add error handling for missing markers
            if (!markersMap[id]) {
              console.warn(`Marker ${id} not found in markers map`);
              return;
            }

            const allele1 = gb ? markersMap[id].refAllele + parseInt(bp1, 10) / markersMap[id].period : null;
            const allele2 = gb ? markersMap[id].refAllele + parseInt(bp2, 10) / markersMap[id].period : null;

            const [gt1, gt2] = gt
              .split("|")
              .map((val) => parseInt(val, 10))
              .slice(0, 2);

            const seq1 = gt1 === 0 ? ref : altList[gt1 - 1];
            const seq2 = gt2 === 0 ? ref : altList[gt2 - 1];

            markerSamplesMap[samples[index]][id] = {
              gt,
              gb,
              q,
              pq,
              dp,
              allele1,
              allele2,
              ref,
              seq1,
              seq2,
            };
          } catch (error) {
            console.error(`Error processing sample values for line: ${line}`, error);
            // Continue processing other samples
          }
        });
      } catch (error) {
        console.error(`Error processing VCF line: ${line}`, error);
        // Continue processing other lines
      }
    }
  } catch (error) {
    console.error("Error parsing VCF content:", error);
    throw error;
  }

  return {
    samples,
    markerSamplesMap,
  };
}
