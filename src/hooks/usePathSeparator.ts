import { useState } from "react";

export const usePathSeparator = () => {
  const [sep, setSep] = useState("/");

  useState(() => {
    (async () => {
      setSep(await electron.getPathSep());
    })();
  });

  return sep;
};
