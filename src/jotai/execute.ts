import { atomWithDefault } from "jotai/utils";

/**
 * Atom for storing the files list for the execution
 */
export const filesAtom = atomWithDefault<string[] | null>(() => null);

// Reference genome fasta
export const fastaAtom = atomWithDefault<string | null>(() => null);

export const bedAtom = atomWithDefault<string | null>(() => null);

export const outputAtom = atomWithDefault<string | null>(() => null);
