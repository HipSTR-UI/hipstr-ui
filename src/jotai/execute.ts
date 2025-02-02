import { atomWithLocalStorage } from "src/lib/atomWithLocalStorage";

/**
 * Atom for storing the files list for the execution
 */
export const filesAtom = atomWithLocalStorage("files", []);
export const fastaAtom = atomWithLocalStorage("fasta", "");
export const bedAtom = atomWithLocalStorage("bed", "");
export const paramsAtom = atomWithLocalStorage("params", {});
export const vcfPathAtom = atomWithLocalStorage("vcfPath", "");
