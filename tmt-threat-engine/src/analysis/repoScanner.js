import fs from "fs";
import path from "path";

/**
 * Recursively collects code files from the repo.
 * Returns { files: [{ path, content }], hasEnvFile, envFiles }
 */
export async function scanRepo(repoPath) {
  const codeExtensions = [
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".py",
    ".java",
    ".cs",
    ".php"
  ];

  const files = [];
  const envFiles = [];
  let hasEnvFile = false;

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Ignore git folder & node_modules
      if (
        entry.name === ".git" ||
        entry.name === "node_modules" ||
        entry.name === "dist" ||
        entry.name === "build"
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        const ext = path.extname(entry.name);

        if (entry.name.startsWith(".env")) {
          hasEnvFile = true;
          envFiles.push(fullPath);
        }

        if (codeExtensions.includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, "utf8");
            files.push({ path: fullPath, content });
          } catch (err) {
            console.warn("Could not read file:", fullPath, err.message);
          }
        }
      }
    }
  }

  walk(repoPath);

  return {
    files,
    hasEnvFile,
    envFiles
  };
}
