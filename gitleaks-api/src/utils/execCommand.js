// src/utils/execCommand.js
import { exec } from "child_process";

export function execCommand(command) {
  return new Promise((resolve, reject) => {
    console.log("\n[execCommand] Running:", command);

    exec(
      command,
      {
        maxBuffer: 1024 * 1024 * 10, // 10 MB
        timeout: 300000, // 5 minutes
      },
      (error, stdout, stderr) => {
        console.log("[execCommand] Finished:", command);

        if (error) {
          // Pass everything upward so caller decides what to do.
          return reject(Object.assign(error, { stdout, stderr }));
        }

        if (stderr) {
          console.warn("[execCommand] STDERR (non-fatal):", stderr);
        }

        resolve({ stdout, stderr });
      }
    );
  });
}
