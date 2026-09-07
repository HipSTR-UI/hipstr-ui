export function joinPath(pathSep: string, ...parts: string[]) {
  return parts.join(pathSep);
}

// Characters that never need quoting. Backslash is safe on cmd.exe (it has no
// special meaning there) but not in a POSIX shell, so it is platform dependent.
const POSIX_SAFE = /^[A-Za-z0-9_@%+=:,./-]+$/;
const WIN32_SAFE = /^[A-Za-z0-9_@%+=:,./\\-]+$/;

/**
 * Quote a value so the shell hands it to the binary untouched, e.g. paths
 * containing spaces or parentheses. Values that need no quoting are returned
 * as-is so the command shown to the user stays readable.
 */
export function quoteArg(value: string, platform: string) {
  const isWin32 = platform === "win32";
  if (!value || (isWin32 ? WIN32_SAFE : POSIX_SAFE).test(value)) {
    return value;
  }
  if (isWin32) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
