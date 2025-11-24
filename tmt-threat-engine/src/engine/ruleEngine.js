import path from "path";
import strideRules from "./strideRules.json" with { type: "json" };
import { buildSummary } from "./riskScorer.js";

/**
 * Runs STRIDE-style rules over scanned files plus some heuristic checks.
 * Input: { files, techStack, model }
 * Output: { threats, summary }
 */
export async function runThreatAnalysis({ files, techStack, model }) {
  const rawThreats = [];

  // 1) Pattern-based rules from strideRules.json
  for (const rule of strideRules) {
    const regex = new RegExp(rule.regex, "i");

    for (const file of files) {
      const ext = path.extname(file.path);

      if (rule.fileExtensions && !rule.fileExtensions.includes(ext)) {
        continue;
      }

      if (regex.test(file.content)) {
        rawThreats.push({
          ruleId: rule.id,
          title: rule.title,
          description: rule.description,
          category: rule.category,
          severity: rule.severity,
          file: {
            path: file.path,
            lineStart: null,
            lineEnd: null,
            snippet: null
          }
        });
      }
    }
  }

  // 2) Heuristic rules based on overall project

  // 2a) Express app without Helmet middleware
  const isExpress = techStack.frameworks?.includes("Express");
  if (isExpress) {
    const usesHelmet = files.some((f) => /helmet\(/i.test(f.content));
    if (!usesHelmet) {
      rawThreats.push({
        ruleId: "HEUR-EXP-001",
        title: "Express app without Helmet middleware",
        description:
          "Express application does not appear to use Helmet, which helps set secure HTTP headers.",
        category: "Information Disclosure",
        severity: "Medium",
        file: {
          path: null,
          lineStart: null,
          lineEnd: null,
          snippet: null
        }
      });
    }

    // 2b) Express app without any basic rate limiter
    const usesRateLimit = files.some(
      (f) => /express-rate-limit|rateLimit\(/i.test(f.content)
    );
    if (!usesRateLimit) {
      rawThreats.push({
        ruleId: "HEUR-EXP-002",
        title: "Express app without rate limiting",
        description:
          "Express application does not appear to use any basic rate limiting, which can help mitigate brute-force or DoS attacks.",
        category: "Denial of Service",
        severity: "Low",
        file: {
          path: null,
          lineStart: null,
          lineEnd: null,
          snippet: null
        }
      });
    }
  }

  // 2c) Presence of .env files (from model.metadata)
  if (model?.metadata?.hasEnvFile) {
    rawThreats.push({
      ruleId: "HEUR-CONF-001",
      title: ".env configuration files present in repo",
      description:
        "Environment configuration files (.env*) are present in the repository and may contain sensitive information.",
      category: "Information Disclosure",
      severity: "Medium",
      file: {
        path: (model.metadata.envFiles && model.metadata.envFiles[0]) || null,
        lineStart: null,
        lineEnd: null,
        snippet: null
      }
    });
  }

  // 3) Assign per-scan threat IDs
  const threats = rawThreats.map((t, index) => ({
    id: `T-${(index + 1).toString().padStart(4, "0")}`,
    ...t
  }));

  const summary = buildSummary(threats);

  return { threats, summary };
}
