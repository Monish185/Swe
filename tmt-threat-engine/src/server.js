import express from "express";
import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";

import { cloneRepo } from "./utils/gitUtils.js";
import { scanRepo } from "./analysis/repoScanner.js";
import { detectTech } from "./analysis/techDetector.js";
import { generateModel } from "./analysis/modelGenerator.js";
import { runThreatAnalysis } from "./engine/ruleEngine.js";

const app = express();
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Main endpoint
app.post("/api/threat-model/run", async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) {
    return res.status(400).json({ error: "repoUrl is required" });
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

    console.log("Generating TMT-style model...");
    const { model, modelPath } = await generateModel({
      repoPath,
      scanId,
      techStack,
      scanInfo
    });

    console.log("Running threat analysis...");
    const { threats, summary } = await runThreatAnalysis({
      files: scanInfo.files,
      techStack,
      model
    });

    res.json({
      scanId,
      techStack,
      summary,
      threats,
      artifacts: {
        modelPath
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Threat analysis failed",
      details: err.message
    });
  }
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`TMT Threat Engine API running on port ${PORT} 🚀`);
});
