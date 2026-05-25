import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { createServer } from "vite";

const currentDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(currentDir, "..");

const server = await createServer({
  root: resolve(appRoot, "src/renderer"),
  configFile: false,
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: false
  },
  resolve: {
    alias: {
      "@renderer": resolve(appRoot, "src/renderer/src")
    }
  },
  plugins: [react()]
});

await server.listen();
server.printUrls();

process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await server.close();
  process.exit(0);
});

setInterval(() => {
  // Keep the process alive when launched by Codex without an attached stdin.
}, 60_000);
