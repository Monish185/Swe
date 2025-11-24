// src/controllers/scan.controller.js
import { runGitleaksScan } from "../services/gitleaks.service.js";

export const scanRepo = async (req, res) => {
  try {
    const { repoPath, repoUrl } = req.body;

    if (!repoPath && !repoUrl) {
      return res.status(400).json({
        error: "Either repoPath (local path) or repoUrl (git url) is required",
      });
    }

    const result = await runGitleaksScan({ repoPath, repoUrl });

    return res.json({
      success: true,
      input: repoUrl || repoPath,
      totalFindings: result.totalFindings,
      findings: result.findings,
    });
  } catch (err) {
    console.error("Error in scanRepo controller:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to scan repo with Gitleaks",
      details: err.message,
    });
  }
};
