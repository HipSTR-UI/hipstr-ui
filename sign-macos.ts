const { signAsync } = require("@electron/osx-sign");
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");
require("dotenv").config();

if (!process.env.APPLE_DEVELOPER_IDENTITY) {
  throw new Error("APPLE_DEVELOPER_IDENTITY is not set in env file");
}

const APP_PATH = process.env.APP_PATH || "out/hipstr-ui-darwin-arm64/hipstr-ui.app";
const KEYCHAIN_PATH = process.env.KEYCHAIN_PATH;
const ENTITLEMENTS_PATH = process.env.ENTITLEMENTS_PATH;
const ENTITLEMENTS_INHERIT_PATH = process.env.ENTITLEMENTS_INHERIT_PATH;

/**
 * Recursively find executable files to sign inside a directory.
 */
function findExecutables(rootDir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(rootDir)) return results;
  const stack: string[] = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    const stats = fs.statSync(current);
    if (stats.isDirectory()) {
      const children = fs.readdirSync(current).map((c: string) => path.join(current, c));
      stack.push(...children);
      continue;
    }
    if (!stats.isFile()) continue;
    // Consider any file with any execute bit set as executable code to sign
    if ((stats.mode & 0o111) !== 0) {
      results.push(current);
      continue;
    }
    // Also sign .dylib and .so files if present
    if (/\.(dylib|so)$/i.test(current)) {
      results.push(current);
    }
  }
  return results;
}

function codesign(targetPath: string) {
  const args = [
    "--force",
    "--options",
    "runtime",
    "--timestamp",
    "--sign",
    process.env.APPLE_DEVELOPER_IDENTITY as string,
  ];
  if (KEYCHAIN_PATH) {
    args.push("--keychain", KEYCHAIN_PATH);
  }
  // Only add entitlements when signing the .app bundle (not leaf binaries)
  if (targetPath.endsWith(".app")) {
    if (ENTITLEMENTS_PATH) {
      args.push("--entitlements", ENTITLEMENTS_PATH);
    }
  }
  args.push(targetPath);
  execFileSync("codesign", args, { stdio: "inherit" });
}

const opts: any = {
  app: APP_PATH,
  identity: process.env.APPLE_DEVELOPER_IDENTITY,
  keychain: KEYCHAIN_PATH,
  hardenedRuntime: true,
  entitlements: ENTITLEMENTS_PATH,
  "entitlements-inherit": ENTITLEMENTS_INHERIT_PATH,
  entitlementsInherit: ENTITLEMENTS_INHERIT_PATH,
  "signature-flags": "library",
};

signAsync(opts)
  .then(function () {
    console.info("Application signed (bundle and helpers)");

    // Sign additional executable binaries we ship under Resources/binaries
    const extraBinariesRoot = path.join(APP_PATH, "Contents", "Resources", "binaries");
    const executables = findExecutables(extraBinariesRoot);
    if (executables.length > 0) {
      console.info(`Signing ${executables.length} embedded binaries...`);
      for (const executablePath of executables) {
        codesign(executablePath);
      }
    } else {
      console.info("No embedded binaries found to sign.");
    }

    // Re-sign the app bundle last to ensure a consistent seal
    codesign(APP_PATH);

    console.info("Application fully signed, including embedded binaries.");
  })
  .catch(function (err: Error) {
    console.error(err);
    process.exit(1);
  });
