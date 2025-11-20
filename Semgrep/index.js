// index.js
import express from "express";
import { exec } from "child_process";
import simpleGit from "simple-git";
import fs from "fs";
import util from "util";
import path from "path";

const execPromise = util.promisify(exec);
const app = express();
app.use(express.json());

app.post("/scan", async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) {
    console.log("[X] No repo URL provided in request.");
    return res.status(400).send("Repo URL required.");
  }

  const tempDir = path.join("/tmp", `repo-${Date.now()}`);
  console.log("====================================================");
  console.log(`[+] New scan started`);
  console.log(`[+] Target repo: ${repoUrl}`);
  console.log(`[+] Temporary directory: ${tempDir}`);
  console.log("====================================================");

  try {
    // Step 1️⃣ - Clone repo
    console.log("[1️⃣] Cloning repository...");
    await simpleGit().clone(repoUrl, tempDir);
    console.log("[✅] Clone completed successfully.");

    // Step 2️⃣ - Run Semgrep
    console.log("[2️⃣] Running Semgrep...");
    const semgrepPath = "/home/naman/.semgrep-env/bin/semgrep";
    console.log(`[ℹ️] Using Semgrep at: ${semgrepPath}`);

    const { stdout, stderr } = await execPromise(
      `${semgrepPath} --config auto --json ${tempDir}`,
      { timeout: 600000, maxBuffer: 1024 * 1024 * 200 } // 200MB buffer
    );

    if (stderr) console.warn("[⚠️] Semgrep stderr:", stderr);

    console.log("[✅] Semgrep scan completed. Parsing output...");

    // Step 3️⃣ - Parse and structure results
    const json = JSON.parse(stdout);
    const findings = json.results || [];

    const summary = {
      repo: repoUrl,
      total_findings: findings.length,
      severity_breakdown: findings.reduce(
        (acc, f) => {
          const sev = f.extra.severity || "INFO";
          acc[sev] = (acc[sev] || 0) + 1;
          return acc;
        },
        {}
      ),
    };

    const formattedFindings = findings.map((f) => ({
      severity: f.extra.severity || "INFO",
      rule_id: f.check_id || "N/A",
      file: f.path || "N/A",
      line: f.start?.line || 0,
      message: f.extra.message || "No message",
      category: f.extra.metadata?.category || "general",
      rule_link: f.extra.metadata?.source || "",
      shortlink: f.extra.metadata?.shortlink || "",
    }));

    console.log(`[ℹ️] Found ${findings.length} total findings.`);
    console.log(`[ℹ️] Severity breakdown:`, summary.severity_breakdown);

    // Step 4️⃣ - Create report
    const report = {
      summary,
      findings: formattedFindings,
    };

    // Step 5️⃣ - Write report to file
    const outputFile = path.join(process.cwd(), "a.json");
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    console.log(`[💾] Report saved to ${outputFile}`);

    // Step 6️⃣ - Send structured report to client
    console.log("[✅] Sending structured report to client.");
    res.json(report);
  } catch (err) {
    console.log("----------------------------------------------------");
    console.error("[❌] Error occurred during scan:", err.message);
    console.log("----------------------------------------------------");
    res.status(500).send(err.message || "Unknown error during scan.");
  } finally {
    // Step 7️⃣ - Cleanup
    try {
      console.log(`[🧹] Cleaning up directory: ${tempDir}`);
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log("[✅] Cleanup complete.");
    } catch (cleanupErr) {
      console.error("[⚠️] Cleanup failed:", cleanupErr.message);
    }
    console.log("====================================================\n");
  }
});

app.listen(3000, () => {
  console.log("🚀 Semgrep API running on http://localhost:3000");
  console.log("----------------------------------------------------");
});
