// src/services/runGitleaksScan.js (ESM version)

import fs from "fs";
import os from "os";
import path from "path";
import { exec } from "child_process";
import { GITLEAKS_BIN, GITLEAKS_CONFIG_PATH } from "./config/index.js";

/**
 * Execute a shell command safely
 */
function execCommand(cmd, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd, maxBuffer: 1024 * 500 }, (err, stdout, stderr) => {
      if (err) {
        err.stderr = stderr;
        err.stdout = stdout;
        console.error("❌ Exec Error:", stderr || stdout);
        return reject(err);
      }
      resolve(stdout);
    });
  });
}

/**
 * Clone repo into a Linux-native WSL temp dir
 */
export async function cloneRepoToTemp(repoUrl) {
  const baseTmp = "/tmp"; // Always valid on WSL
  const tempDir = fs.mkdtempSync(path.join(baseTmp, "gitleaks-"));

  const cmd = `git clone --depth 1 "${repoUrl}" "${tempDir}"`;

  console.log("📥 Cloning into:", tempDir);
  await execCommand(cmd);

  return tempDir;
}

/**
 * Run Gitleaks scan on a repo
 */
export async function runGitleaksScan({ repoUrl, repoPath }) {
  let workingPath = repoPath;
  let tempDir = null;

  try {
    if (repoUrl) {
      tempDir = await cloneRepoToTemp(repoUrl);
      workingPath = tempDir;
    }

    if (!workingPath) {
      throw new Error("No working path provided for Gitleaks scan");
    }

    const reportPath = path.resolve(process.cwd(), "gitleaks-report.json");

    // Wrap binary in quotes, but keep safe for Linux paths
    const binary = `"${GITLEAKS_BIN}"`;

    const cmdParts = [
      `${binary} detect`,
      `--source="${workingPath}"`,
      `--report-path="${reportPath}"`,
      `--report-format=json`
    ];

    if (GITLEAKS_CONFIG_PATH) {
      cmdParts.push(`--config="${GITLEAKS_CONFIG_PATH}"`);
    }

    const cmd = cmdParts.join(" ");

    console.log("[Gitleaks] Running scan on:", workingPath);

    try {
      await execCommand(cmd);
    } catch (err) {
      // Exit code 1 = leaks found → Not a failure
      if (err.code !== 1) {
        console.error("[Gitleaks] Non-1 exit code:", err.code);
        throw err;
      }
      console.log("[Gitleaks] Exit code 1: Leaks found, continuing...");
    }

    if (!fs.existsSync(reportPath)) {
      throw new Error("Gitleaks report missing after scan.");
    }

    const raw = fs.readFileSync(reportPath, "utf-8");

    let findings = [];
    try {
      findings = JSON.parse(raw);
    } catch (e) {
      console.error("[Gitleaks] Failed to parse report JSON:", e);
    }

    return {
      totalFindings: Array.isArray(findings) ? findings.length : 0,
      findings,
      reportPath
    };
  } finally {
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {
        console.error("[Gitleaks] Cleanup failed:", e);
      }
    }
  }
}


