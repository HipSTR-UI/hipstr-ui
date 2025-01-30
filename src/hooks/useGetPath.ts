import { useState } from "react";

export const useGetPath = (name: string) => {
  const [path, setPath] = useState("");

  useState(() => {
    (async () => {
      setPath(await electron.getPath(name));
    })();
  });

  return path;
};
