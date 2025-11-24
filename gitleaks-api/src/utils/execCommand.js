// src/utils/execCommand.js
const { exec } = require('child_process');

function execCommand(command) {
  return new Promise((resolve, reject) => {
    console.log('\n[execCommand] Running:', command);
    exec(
      command,
      {
        maxBuffer: 1024 * 1024 * 10,
        timeout: 300000,
      },
      (error, stdout, stderr) => {
        console.log('[execCommand] Finished:', command);

        if (error) {
          // We *don't* decide here if it's fatal or not, we just pass info up
          return reject(Object.assign(error, { stdout, stderr }));
        }

        if (stderr) {
          console.warn('[execCommand] STDERR (non-fatal):', stderr);
        }

        resolve({ stdout, stderr });
      }
    );
  });
}

module.exports = { execCommand };