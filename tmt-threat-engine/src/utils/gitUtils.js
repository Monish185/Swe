// src/utils/gitUtils.js
import { exec } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Clones a git repo into destPath.
 * Requires `git` installed on the machine.
 */
export function cloneRepo(repoUrl, destPath) {
  return new Promise((resolve, reject) => {
    // Ensure parent dir exists
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    const cmd = `git clone ${repoUrl} "${destPath}" --depth=1`;
    console.log("Running:", cmd);

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("Git clone error:", stderr);
        return reject(new Error(`Failed to clone repo: ${stderr}`));
      }
      console.log("Clone stdout:", stdout);
      resolve();
    });
  });
}
