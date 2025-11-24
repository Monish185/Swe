import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";

import { cloneRepo } from "./gitUtils.js";
import { scanRepo } from "../analysis/repoScanner.js";
import { detectTech } from "../analysis/techDetector.js";
import { generateModel } from "../analysis/modelGenerator.js";
import { runThreatAnalysis } from "../engine/ruleEngine.js";

/**
 * Main function to run threat model analysis without Express/API
 */
export async function runThreatModel(repoUrl) {
  if (!repoUrl) {
    throw new Error("repoUrl is required");
  }

  const scanId = uuid();
  const tmpDir = path.resolve(process.cwd(), "tmp");
  fs.mkdirSync(tmpDir, { recursive: true });

  const repoPath = path.join(tmpDir, scanId);

  try {
    console.log(`Cloning repo ${repoUrl} → ${repoPath}`);
    await cloneRepo(repoUrl, repoPath);

    console.log("Scanning repo files...");
    const scanInfo = await scanRepo(repoPath);

    console.log("Detecting tech stack...");
    const techStack = await detectTech(repoPath);

    console.log("Generating threat model JSON...");
    const { model, modelPath } = await generateModel({
      repoPath,
      scanId,
      techStack,
      scanInfo,
    });

    console.log("Running threat analysis rules...");
    const { threats, summary } = await runThreatAnalysis({
      files: scanInfo.files,
      techStack,
      model,
    });

    console.log(`Threat model completed for scan ${scanId}`);

    return {
      scanId,
      techStack,
      summary,
      threats,
      artifacts: { modelPath },
    };
  } catch (err) {
    console.error("[❌] Threat model failed:", err);
    throw err;
  }
}
