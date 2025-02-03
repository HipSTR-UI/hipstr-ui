import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

import { atomWithLocalStorage } from "src/lib/atomWithLocalStorage";

/**
 * Atom for storing the language
 */
export const languageAtom = atomWithLocalStorage("language", "en");

export const useLanguageCallback = () => {
  return useAtomCallback(
    useCallback((get) => {
      return get(languageAtom);
    }, [])
  );
};

languageAtom.onMount = (setAtom) => {
  // Locales comes empty with tests, assume 'en'.
  // setAtom((current) => (current ?? locales[0]?.languageCode) as LANGUAGE_KEY); // increment count on mount
};
