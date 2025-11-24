// src/services/gitleaks.service.js
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { execCommand } from "../utils/execCommand.js";
import { GITLEAKS_CONFIG_PATH, GITLEAKS_BIN } from "../config/index.js";

// const { GITLEAKS_CONFIG_PATH, GITLEAKS_BIN } = config;

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Clone repoUrl into a temporary directory.
 * Requires `git` installed and available in PATH.
 */
async function cloneRepoToTemp(repoUrl) {
  const tempBase = fs.mkdtempSync(path.join(os.tmpdir(), "gitleaks-"));
  const cmd = `git clone "${repoUrl}" "${tempBase}"`;

  await execCommand(cmd);
  return tempBase;
}

export async function runGitleaksScan({ repoPath, repoUrl }) {
  let workingPath = repoPath;
  let tempDirCreated = null;

  try {
    // If repoUrl is provided → clone repo first
    if (repoUrl) {
      tempDirCreated = await cloneRepoToTemp(repoUrl);
      workingPath = tempDirCreated;
    }

    if (!workingPath) {
      throw new Error("No working path available for Gitleaks scan");
    }

    // Save report inside project folder
    const reportPath = path.join(__dirname, "../../gitleaks-report.json");

    const binary = `"${GITLEAKS_BIN}"`; // Use env-provided path

    const cmdParts = [
      `${binary} detect`,
      `--source "${workingPath}"`,
      `--report-path="${reportPath}"`,
      "--report-format=json",
    ];

    // If config path exists → enable it
    // if (GITLEAKS_CONFIG_PATH) {
    //   cmdParts.push(`--config="${GITLEAKS_CONFIG_PATH}"`);
    // }

    console.log("[gitleaks.service] Running gitleaks on:", workingPath);

    const cmd = cmdParts.join(" ");

    try {
      await execCommand(cmd);
    } catch (err) {
      // Exit code 1 = leaks found → NOT an error
      if (err.code !== 1) {
        console.error(
          "[gitleaks.service] Gitleaks failed with non-1 code:",
          err.code
        );
        throw err;
      }

      console.log(
        "[gitleaks.service] Gitleaks exited with code 1 (leaks found). Treating as successful scan."
      );
    }

    // Check report exists
    if (!fs.existsSync(reportPath)) {
      throw new Error("Gitleaks report file not found");
    }

    console.log("[gitleaks.service] Reading report:", reportPath);

    const raw = fs.readFileSync(reportPath, "utf-8");

    let findings = [];
    try {
      findings = JSON.parse(raw);
    } catch (err) {
      console.error("Error parsing Gitleaks JSON:", err);
      findings = [];
    }

    return {
      totalFindings: Array.isArray(findings) ? findings.length : 0,
      findings,
    };
  } finally {
    // Cleanup cloned temp repo
    if (tempDirCreated && fs.existsSync(tempDirCreated)) {
      try {
        fs.rmSync(tempDirCreated, { recursive: true, force: true });
      } catch (err) {
        console.error("Failed to remove temp dir:", err);
      }
    }
  }
}
