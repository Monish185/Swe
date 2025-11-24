# Gitleaks API Service

This is a small Node.js microservice that wraps the **Gitleaks** CLI and exposes it as a simple REST API.

You can send a **Git repository URL** (or local path), and the service will:

1. Clone the repo (if URL is provided)
2. Run `gitleaks detect` on it
3. Parse the JSON report
4. Return all detected **secrets/leaks** in a clean JSON response

This is designed to be plugged into a larger **SSDLC / DevSecOps** project as a “Secrets Scanning” component.

---

## 1. Features

- ✅ Scan any **public Git repo** by URL  
- ✅ Optional support for scanning **local repos** by path  
- ✅ Uses **Gitleaks** rules (no custom config required)  
- ✅ Handles both:
  - Clean repos (0 findings)
  - Repos WITH leaks (non-zero exit code)  
- ✅ Returns structured JSON output:
  - `totalFindings`
  - Full list of findings from Gitleaks report  
- ✅ Uses **environment variable** to locate `gitleaks.exe` (no hard-coded paths)

---

## 2. Project Structure

```text
gitleaks-api/
├─ src/
│  ├─ app.js              # Express app definition
│  ├─ server.js           # Server startup
│  ├─ routes/
│  │   └─ scan.routes.js  # /scan endpoints
│  ├─ controllers/
│  │   └─ scan.controller.js  # Request handling & validation
│  ├─ services/
│  │   └─ gitleaks.service.js # Core logic: clone + run gitleaks + parse report
│  ├─ utils/
│  │   └─ execCommand.js      # Helper to execute shell commands
│  └─ config/
│      └─ index.js            # Reads env variables (PORT, GITLEAKS_BIN, etc.)
├─ .env                       # Local environment config (ignored by git)
├─ .env.example               # Sample env vars (no secrets)
├─ package.json
├─ gitleaks-report.json       # Temporary report written by gitleaks (created at runtime)
└─ README.md

Create a .env file in the project root (gitleaks-api/.env):

PORT=5002
GITLEAKS_BIN=C:\gitleaks\gitleaks.exe

Install dependencies

From inside the gitleaks-api directory:

npm install

Start the server
npm run start




GET /

Description: Health check endpoint.

Example:

GET http://localhost:5002/



POST /scan/repo

Description:
Scan a repository for hardcoded secrets using Gitleaks.

You can pass either:

repoUrl → Git URL (GitHub, etc.)

or repoPath → Local filesystem path to an existing repo

At least one of repoUrl or repoPath is required.




Request (scan via repo URL)
POST http://localhost:5002/scan/repo
Content-Type: application/json


Body:

{
  "repoUrl": "https://github.com/namankhandelwal1607/MiniProject"
}