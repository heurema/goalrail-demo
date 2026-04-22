import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiPort = process.env.PORT ?? process.env.API_PORT ?? "4311";
const webPort = process.env.WEB_PORT ?? "5173";

console.log("Goalrail Demo Sandbox");
console.log("Current phase: Phase 5 demo-ready workflow-change slice");
console.log(`API URL: http://127.0.0.1:${apiPort}`);
console.log(`Web URL: http://127.0.0.1:${webPort}`);
console.log("Frontend shows a switchable baseline/Goalrail demo flow with local manual review, proof artifacts, and deterministic reset.");

const buildApi = spawn("npm", ["run", "api:build"], {
  cwd: rootDir,
  stdio: "inherit",
  env: process.env
});

const children = [];
let shuttingDown = false;

const stopAll = (signal) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (child.exitCode === null) {
      child.kill(signal);
    }
  }
};

process.on("SIGINT", () => stopAll("SIGINT"));
process.on("SIGTERM", () => stopAll("SIGTERM"));

buildApi.on("exit", (code) => {
  if (code !== 0) {
    process.exit(code ?? 1);
  }

  const api = spawn("node", ["apps/api/dist/main.js"], {
    cwd: rootDir,
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: apiPort
    }
  });

  const web = spawn("npm", ["-w", "apps/web", "run", "dev", "--", "--port", webPort], {
    cwd: rootDir,
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: webPort
    }
  });

  children.push(api, web);

  const handleExit = (source) => (childCode) => {
    if (!shuttingDown) {
      stopAll("SIGTERM");
      process.exit(childCode ?? (source === "api" ? 1 : 0));
    }
  };

  api.on("exit", handleExit("api"));
  web.on("exit", handleExit("web"));
});
