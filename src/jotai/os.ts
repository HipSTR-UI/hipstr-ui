import { atomWithDefault } from "jotai/utils";

/**
 * Atom for storing arch and platform.
 */
export const osAtom = atomWithDefault<
  Promise<{ arch: string; platform: string; resourcesPath: string; dirName: string }>
>(async () => {
  const arch = await electron.os("arch");
  const platform = await electron.os("platform");
  const resourcesPath = await electron.process("resourcesPath");
  const dirName = await electron.dirName();
  return { resourcesPath, arch, platform, dirName };
});
