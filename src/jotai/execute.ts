import { atomWithLocalStorage } from "src/lib/atomWithLocalStorage";
import { atom } from "jotai";
import type { Marker } from "src/lib/bed";
import type { SampleValues } from "src/lib/vcf";

/**
 * Atom for storing the files list for the execution
 */
export const filesAtom = atomWithLocalStorage("files", []);
export const fastaAtom = atomWithLocalStorage("fasta", "");
export const bedAtom = atomWithLocalStorage("bed", "");
export const paramsAtom = atomWithLocalStorage("params", {});
export const vcfPathAtom = atomWithLocalStorage("vcfPath", "");

// Controls visibility of Isoalleles tab (default hidden)
export const showIsoallelesTabAtom = atomWithLocalStorage<boolean>("showIsoallelesTab", false);

// Parsed results shared across tabs (not persisted)
export const resultsMarkersAtom = atom<Marker[]>([]);
export const markerSamplesMapAtom = atom<{
  [sampleId: string]: { [markerId: string]: SampleValues };
}>({});
