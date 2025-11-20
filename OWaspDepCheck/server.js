// server.js
import express from "express";
import { exec } from "child_process";
import simpleGit from "simple-git";
import fs from "fs";
import util from "util";
import path from "path";
import os from "os";

const execPromise = util.promisify(exec);
const app = express();
app.use(express.json());

// === CONFIG ===
const DEP_CHECK_PATH = "/home/naman/depcheck/dependency-check/bin/dependency-check.sh";
const NVD_API_KEY = "259c0ba1-05aa-4387-91cf-5505ac1fd7b6"; // Replace with your key
const OUTPUT_DIR = process.cwd(); // Save structured report in current working directory

app.post("/depcheck", async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) {
    console.log("[X] No repo URL provided.");
    return res.status(400).send("Repo URL required.");
  }

  const tempDir = path.join(os.tmpdir(), `repo-${Date.now()}`);
  const outputTarget = path.join(OUTPUT_DIR, `depcheck-report-${Date.now()}.json`);

  console.log("\n====================================================");
  console.log(`[+] 🧩 OWASP Dependency-Check Scan Started`);
  console.log(`[+] 🔗 Target repo: ${repoUrl}`);
  console.log(`[+] 📂 Temp directory: ${tempDir}`);
  console.log(`[+] 📄 Output target: ${outputTarget}`);
  console.log("====================================================");

  try {
    // Step 1️⃣ Clone repository
    console.log("[1️⃣] Cloning repository...");
    await simpleGit().clone(repoUrl, tempDir);
    console.log("[✅] Clone complete.");

    // Step 2️⃣ Run OWASP Dependency-Check
    console.log("[2️⃣] Running Dependency-Check...");

    const command = `${DEP_CHECK_PATH} \
      --project RepoScan \
      --scan ${tempDir} \
      --format JSON \
      --out ${outputTarget} \
      --nvdApiKey ${NVD_API_KEY}`;

    console.log(`[ℹ️] Executing: ${command}`);
    const { stderr } = await execPromise(command, {
      timeout: 900000,
      maxBuffer: 1024 * 1024 * 500,
    });

    if (stderr) console.warn("[⚠️] DepCheck stderr:", stderr);
    console.log("[✅] Dependency-Check completed.");

    // Step 3️⃣ Locate and parse the JSON report
    console.log("[3️⃣] Parsing JSON report...");

    let reportPath;
    if (fs.existsSync(outputTarget) && fs.statSync(outputTarget).isFile()) {
      reportPath = outputTarget;
    } else {
      reportPath = path.join(outputTarget, "dependency-check-report.json");
    }

    if (!fs.existsSync(reportPath)) {
      throw new Error(`Report file not found at ${reportPath}`);
    }

    const reportData = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    const dependencies = reportData.dependencies || [];
    const vulnerabilities = [];

    dependencies.forEach((dep) => {
      if (dep.vulnerabilities && dep.vulnerabilities.length > 0) {
        dep.vulnerabilities.forEach((vuln) => {
          vulnerabilities.push({
            fileName: dep.fileName,
            packagePath: dep.filePath,
            severity: vuln.severity,
            cve: vuln.name,
            cwe: vuln.cwe,
            description: vuln.description,
            source: vuln.source,
            cvssScore:
              vuln.cvssv3?.baseScore ||
              vuln.cvssv2?.baseScore ||
              "N/A",
            reference: vuln.references?.[0]?.url || "N/A",
          });
        });
      }
    });

    console.log(`[✅] Found ${vulnerabilities.length} vulnerabilities.`);

    // Step 4️⃣ Create structured summary
    const summary = {
      repo: repoUrl,
      total_dependencies: dependencies.length,
      vulnerable_dependencies: vulnerabilities.length,
      severities: vulnerabilities.reduce((acc, v) => {
        acc[v.severity] = (acc[v.severity] || 0) + 1;
        return acc;
      }, {}),
    };

    const structuredReport = { summary, vulnerabilities };

    // Step 5️⃣ Save structured JSON in current folder
    const structuredFile = path.join(process.cwd(), `structured-report-${Date.now()}.json`);
    fs.writeFileSync(structuredFile, JSON.stringify(structuredReport, null, 2));
    console.log(`[💾] Structured report saved to ${structuredFile}`);

    // Step 6️⃣ Respond with structured data
    res.json(structuredReport);
  } catch (err) {
    console.error("[❌] Error during Dependency-Check:", err.message);
    res.status(500).send(err.message);
  } finally {
    // Step 7️⃣ Cleanup
    try {
      console.log(`[🧹] Cleaning up ${tempDir}`);
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log("[✅] Cleanup complete.");
    } catch (cleanupErr) {
      console.error("[⚠️] Cleanup failed:", cleanupErr.message);
    }
    console.log("====================================================\n");
  }
});

app.listen(4000, () => {
  console.log("🚀 Dependency-Check API running on http://localhost:4000");
  console.log("----------------------------------------------------");
});
