import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import * as readline from "readline";
import { exec } from "child_process";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

interface Version {
  major: number;
  minor: number;
  patch: number;
}

function parseVersion(version: string): Version {
  const [major, minor, patch] = version.replace("v", "").split(".").map(Number);
  return { major, minor, patch };
}

function formatVersion(version: Version): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}

function bumpVersion(version: Version, type: "major" | "minor" | "patch"): Version {
  const newVersion = { ...version };

  if (type === "major") {
    newVersion.major += 1;
    newVersion.minor = 0;
    newVersion.patch = 0;
  } else if (type === "minor") {
    newVersion.minor += 1;
    newVersion.patch = 0;
  } else {
    newVersion.patch += 1;
  }

  return newVersion;
}

function execCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error}`);
        reject(error);
        return;
      }
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      resolve();
    });
  });
}

async function updateVersions() {
  try {
    const rootPackagePath = join(process.cwd(), "package.json");

    // Read current versions
    const rootPackage = JSON.parse(readFileSync(rootPackagePath, "utf8"));

    console.log(`Current version: ${rootPackage.version}`);

    // Get version bump type, defaulting to patch
    const bumpType = (await question("What type of version bump? (major/minor/patch) [patch]: ")) || "patch";
    if (!["major", "minor", "patch"].includes(bumpType)) {
      throw new Error("Invalid version bump type. Must be major, minor, or patch.");
    }

    const currentVersion = parseVersion(rootPackage.version);
    const newVersion = bumpVersion(currentVersion, bumpType as "major" | "minor" | "patch");
    const versionString = formatVersion(newVersion);

    console.log(`\nThis will update the following files to version ${versionString}:`);
    console.log("- package.json");

    const confirm = await question("\nProceed with version bump? (y/n): ");
    if (confirm.toLowerCase() !== "y") {
      console.log("Version bump cancelled");
      rl.close();
      return;
    }

    // Update versions
    rootPackage.version = versionString;

    // Write files
    writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2));

    console.log("\nFiles updated successfully");

    const commands = [
      `git commit -am "chore: bump version to ${versionString}"`,
      `git tag -a v${versionString} -m "Version ${versionString}"`,
      "git push && git push --tags",
    ];

    console.log("\nThe following commands will be executed:");
    commands.forEach((cmd, i) => console.log(`${i + 1}. ${cmd}`));

    const executeConfirm = await question("\nExecute these commands? (y/n): ");
    if (executeConfirm.toLowerCase() === "y") {
      for (const command of commands) {
        console.log(`\nExecuting: ${command}`);
        await execCommand(command);
      }
      console.log("\nAll commands executed successfully");
    } else {
      console.log("\nCommands not executed. Please run them manually:");
      commands.forEach((cmd, i) => console.log(`${i + 1}. Run: ${cmd}`));
    }

    rl.close();
  } catch (error) {
    console.error("Error:", error);
    rl.close();
  }
}

updateVersions();
