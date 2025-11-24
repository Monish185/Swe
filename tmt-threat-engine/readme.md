# TMT Threat Engine API

This is a small Node.js microservice that scans a **Git repository** for potential security issues and returns a **STRIDE-style threat summary**.

It’s designed to plug into your main SSDLC project as a separate service.  
Your main backend just sends a repo URL → gets back threats in JSON → shows them on the dashboard.

---

## 🔧 Features

- Accepts a **Git repo URL** (GitHub, GitLab, etc.)
- Clones the repo in a temporary folder
- Scans code files (`.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.java`, `.cs`, `.php`)
- Detects **tech stack** (Express, React, Next.js, Django, Spring, etc.)
- Generates a simplified **TMT-style model** (processes, data stores, data flows)
- Runs **rule-based STRIDE analysis**:
  - Hardcoded secrets / API keys
  - HTTP instead of HTTPS
  - SQL via string concatenation
  - `eval()` usage
  - CORS `*`
  - Weak crypto, JWT decode misuse, etc.
- Returns:
  - Overall **summary**
  - Detailed **threats[]** list
  - Path to generated **model file**

---

## 📁 Project Structure

```text
tmt-threat-engine/
  ├─ src/
  │  ├─ server.js              # Express server, main API entry
  │  ├─ analysis/
  │  │  ├─ repoScanner.js      # Recursively scan repo files
  │  │  ├─ techDetector.js     # Detect languages/frameworks
  │  │  └─ modelGenerator.js   # Build simple TMT-style model
  │  ├─ engine/
  │  │  ├─ ruleEngine.js       # Apply STRIDE rules + heuristics
  │  │  ├─ riskScorer.js       # Summary (bySeverity, byCategory)
  │  │  └─ strideRules.json    # List of pattern-based rules
  │  └─ utils/
  │     └─ gitUtils.js         # cloneRepo(repoUrl, destPath)
  │
  ├─ models/                   # Generated model JSON files
  ├─ tmp/                      # Temporary cloned repos
  ├─ package.json
  └─ README.md


From inside the tmt-threat-engine folder:

npm install
npm start

API Usage
Endpoint

URL

POST /api/threat-model/run


Full example (local)

POST http://localhost:6000/api/threat-model/run

Request Body
{
  "repoUrl": "https://github.com/user/some-repo"
}

Integrating with Main Backend

Your main backend should treat this as an internal microservice.

Example (Node + Axios):

import axios from "axios";

async function runThreatScan(repoUrl) {
  const response = await axios.post(
    "http://localhost:6000/api/threat-model/run",
    { repoUrl }
  );

  // Response contains: scanId, techStack, summary, threats, artifacts
  return response.data;
}


Then in your main backend controller/route:

// Example Express route in main backend
app.post("/api/scan-repo", async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) {
    return res.status(400).json({ error: "repoUrl is required" });
  }

  try {
    const result = await runThreatScan(repoUrl);
    // Optionally store result in DB before returning
    return res.json(result);
  } catch (err) {
    console.error("Error calling Threat Engine:", err.message);
    return res.status(500).json({ error: "Threat scan failed" });
  }
});