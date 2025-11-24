import fs from "fs";
import path from "path";

/**
 * Generates a simple DFD-style model from tech stack + scan info.
 * Saves to /models/<scanId>.json and returns { model, modelPath }.
 */
export async function generateModel({ repoPath, scanId, techStack, scanInfo }) {
  const appName = path.basename(repoPath);

  const model = {
    id: scanId,
    appName,
    techStack,
    createdAt: new Date().toISOString(),
    // VERY simplified model – enough for your project demo
    processes: [],
    dataStores: [],
    dataFlows: [],
    metadata: {
      hasEnvFile: scanInfo.hasEnvFile,
      envFiles: scanInfo.envFiles
    }
  };

  // Infer basic processes & data stores from tech stack
  if (techStack.hasBackend) {
    model.processes.push({
      id: "P1",
      name: "Backend API Server",
      trustBoundary: "Server Network"
    });
  }

  if (techStack.hasFrontend) {
    model.processes.push({
      id: "P2",
      name: "Web Frontend",
      trustBoundary: "Client / Browser"
    });
  }

  // Assume a DB if we see common DB keywords in files
  const dbKeywords = /(mongoose|mongodb|mysql|pg\.connect|sequelize|typeorm|prisma)/i;
  const usesDb = scanInfo.files.some((f) => dbKeywords.test(f.content));

  if (usesDb) {
    model.dataStores.push({
      id: "D1",
      name: "Application Database",
      type: "Database",
      trustBoundary: "Server Network"
    });
  }

  // Data flows
  if (techStack.hasFrontend && techStack.hasBackend) {
    model.dataFlows.push({
      id: "DF1",
      from: "Web Frontend",
      to: "Backend API Server",
      description: "HTTP(S) requests from client to server"
    });
  }

  if (techStack.hasBackend && usesDb) {
    model.dataFlows.push({
      id: "DF2",
      from: "Backend API Server",
      to: "Application Database",
      description: "CRUD operations on DB"
    });
  }

  // Save model JSON
  const modelsDir = path.resolve(process.cwd(), "models");
  fs.mkdirSync(modelsDir, { recursive: true });

  const modelPath = path.join(modelsDir, `${scanId}.tmt-model.json`);
  fs.writeFileSync(modelPath, JSON.stringify(model, null, 2), "utf8");

  return { model, modelPath };
}
