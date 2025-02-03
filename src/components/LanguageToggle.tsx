import { useAtom } from "jotai/index";
import { FC } from "react";
import { useTranslation } from "react-i18next";

import { Button, ButtonProps } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { languageAtom } from "src/jotai/language";
import { LANGUAGE_CODES } from "src/i18n/resources";

type LanguageToggleProps = {
  className?: ButtonProps["className"];
};

export const LanguageToggle: FC<LanguageToggleProps> = ({ className }) => {
  const [language, setLanguage] = useAtom(languageAtom);
  const { t } = useTranslation();

  const toggleLanguage = async () => {
    const currentIndex = LANGUAGE_CODES.indexOf(language);
    const nextIndex = currentIndex === LANGUAGE_CODES.length - 1 ? 0 : currentIndex + 1;
    const newLanguageCode = LANGUAGE_CODES[nextIndex];
    // const languageChanged = t("languageChanged");
    // const newLanguage = t(`languages.${newLanguageCode}`);
    await setLanguage(newLanguageCode);
    // Toast.show(`${languageChanged} ${newLanguage}`, {
    //   duration: Toast.durations.SHORT,
    // });
  };

  return (
    <Button variant="ghost" onClick={toggleLanguage}>
      <Text className="font-sansmedium">{language?.toUpperCase()}</Text>
    </Button>
  );
};
