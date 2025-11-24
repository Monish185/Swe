import fs from "fs";
import path from "path";

/**
 * Detects basic tech stack from repo.
 * Returns: { language: [], frameworks: [], packageManager, hasFrontend, hasBackend }
 */
export async function detectTech(repoPath) {
  const result = {
    languages: new Set(),
    frameworks: new Set(),
    packageManager: null,
    hasFrontend: false,
    hasBackend: false
  };

  const packageJsonPath = path.join(repoPath, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    result.languages.add("JavaScript");
    result.packageManager = "npm/yarn";

    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    };

    if (deps.express) {
      result.frameworks.add("Express");
      result.hasBackend = true;
    }
    if (deps["@nestjs/core"]) {
      result.frameworks.add("NestJS");
      result.hasBackend = true;
    }
    if (deps.react || deps["react-dom"]) {
      result.frameworks.add("React");
      result.hasFrontend = true;
    }
    if (deps.next) {
      result.frameworks.add("Next.js");
      result.hasFrontend = true;
      result.hasBackend = true;
    }
  }

  // Python (rough guess)
  if (fs.existsSync(path.join(repoPath, "requirements.txt"))) {
    result.languages.add("Python");
    const req = fs.readFileSync(
      path.join(repoPath, "requirements.txt"),
      "utf8"
    );
    if (/django/i.test(req)) {
      result.frameworks.add("Django");
      result.hasBackend = true;
    }
    if (/flask/i.test(req)) {
      result.frameworks.add("Flask");
      result.hasBackend = true;
    }
  }

  // Java (Maven/Gradle)
  if (fs.existsSync(path.join(repoPath, "pom.xml"))) {
    result.languages.add("Java");
    result.frameworks.add("Spring (Maven project)");
    result.hasBackend = true;
  }

  if (fs.existsSync(path.join(repoPath, "build.gradle"))) {
    result.languages.add("Java");
    result.frameworks.add("Spring (Gradle project)");
    result.hasBackend = true;
  }

  return {
    languages: Array.from(result.languages),
    frameworks: Array.from(result.frameworks),
    packageManager: result.packageManager,
    hasFrontend: result.hasFrontend,
    hasBackend: result.hasBackend
  };
}
