import { buildServer } from "./server.js";

const port = Number.parseInt(process.env.PORT ?? "4311", 10);
const host = process.env.HOST ?? "127.0.0.1";

const server = buildServer();

try {
  await server.listen({
    port,
    host
  });
  console.log(`TrialOps API listening at http://${host}:${port}`);
} catch (error) {
  console.error("Failed to start TrialOps API.");
  console.error(error);
  process.exit(1);
}
