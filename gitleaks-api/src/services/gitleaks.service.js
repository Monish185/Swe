// src/services/gitleaks.service.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execCommand } = require('../utils/execCommand');
const { GITLEAKS_CONFIG_PATH, GITLEAKS_BIN } = require('../config');

/**
 * Clone repoUrl into a temporary directory.
 * Requires `git` installed and available in PATH.
 */
async function cloneRepoToTemp(repoUrl) {
  const tempBase = fs.mkdtempSync(path.join(os.tmpdir(), 'gitleaks-')); // e.g. C:\Users\rahul\AppData\Local\Temp\gitleaks-XXXX
  const cmd = `git clone "${repoUrl}" "${tempBase}"`;

  await execCommand(cmd);

  return tempBase;
}

exports.runGitleaksScan = async ({ repoPath, repoUrl }) => {
  let workingPath = repoPath;
  let tempDirCreated = null;

  try {
    // If repoUrl is provided, clone it first
    if (repoUrl) {
      tempDirCreated = await cloneRepoToTemp(repoUrl);
      workingPath = tempDirCreated;
    }

    if (!workingPath) {
      throw new Error('No working path available for Gitleaks scan');
    }

    // temp report path (inside project folder)
    const reportPath = path.join(__dirname, '../../gitleaks-report.json');

    // use the path *as is* from env, just wrap in quotes
    const binary = `"${GITLEAKS_BIN}"`;

    const cmdParts = [
      `${binary} detect`,
      `--source "${workingPath}"`,
      `--report-path="${reportPath}"`,
      '--report-format=json',
    ];

    // if (GITLEAKS_CONFIG_PATH) {
    //   cmdParts.push(`--config="${GITLEAKS_CONFIG_PATH}"`);
    // }

    console.log('[gitleaks.service] Running gitleaks on:', workingPath);
    const cmd = cmdParts.join(' ');

    try {
      await execCommand(cmd);
    } catch (err) {
      // ⬇️ This is the important part
      // Gitleaks uses exit code 1 to mean "leaks found".
      // Only rethrow if it's some *other* kind of failure.
      if (err.code !== 1) {
        console.error('[gitleaks.service] Gitleaks failed with non-1 code:', err.code);
        throw err;
      }

      console.log(
        '[gitleaks.service] Gitleaks exited with code 1 (leaks found). Treating as successful scan.'
      );
    }

    // Now we ALWAYS try to read the report if the command completed.
    if (!fs.existsSync(reportPath)) {
      throw new Error('Gitleaks report file not found');
    }

    console.log('[gitleaks.service] Reading report:', reportPath);
    const raw = fs.readFileSync(reportPath, 'utf-8');

    let findings = [];
    try {
      findings = JSON.parse(raw);
    } catch (e) {
      console.error('Error parsing Gitleaks JSON:', e);
      findings = [];
    }

    return {
      totalFindings: Array.isArray(findings) ? findings.length : 0,
      findings,
    };
  } finally {
    // Cleanup temp cloned repo
    if (tempDirCreated && fs.existsSync(tempDirCreated)) {
      try {
        // recursive delete (Node 14+)
        fs.rmSync(tempDirCreated, { recursive: true, force: true });
      } catch (e) {
        console.error('Failed to remove temp dir:', e);
      }
    }
  }
};
