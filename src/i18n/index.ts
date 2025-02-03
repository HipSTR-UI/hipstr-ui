import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { RESOURCES } from "src/i18n/resources";
import { useAtomValue } from "jotai";
import { useState, useEffect } from "react";
import { languageAtom } from "src/jotai/language";

export const useInitI18n = () => {
  const [initialized, setInitialized] = useState(false);
  const language = useAtomValue(languageAtom);

  useEffect(() => {
    (async () => {
      await i18n
        .use(initReactI18next)
        .use(LanguageDetector)
        .init({
          // compatibilityJSON: "v3",
          resources: RESOURCES,
          lng: language,
          fallbackLng: "en",
          interpolation: {
            escapeValue: false,
          },
        });
      setInitialized(true);
    })();
  }, [language]);

  return {
    initialized,
  };
};
