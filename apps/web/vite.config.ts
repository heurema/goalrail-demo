import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiPort = process.env.API_PORT ?? "4311";
const webPort = Number.parseInt(process.env.WEB_PORT ?? "5173", 10);

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: Number.isFinite(webPort) ? webPort : 5173,
    proxy: {
      "/api": `http://127.0.0.1:${apiPort}`,
      "/health": `http://127.0.0.1:${apiPort}`
    }
  }
});
