import enTranslation from "./locales/en/translation.json";
import esTranslation from "./locales/es/translation.json";
import ptTranslation from "./locales/pt/translation.json";

export const RESOURCES = {
  en: {
    translation: enTranslation,
  },
  es: {
    translation: esTranslation,
  },
  pt: {
    translation: ptTranslation,
  },
};

export type LANGUAGE_KEY = keyof typeof RESOURCES;
export const LANGUAGE_CODES: LANGUAGE_KEY[] = ["en", "es", "pt"];
