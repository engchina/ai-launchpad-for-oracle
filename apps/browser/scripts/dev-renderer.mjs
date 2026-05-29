import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createServer } from "vite";

const currentDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(currentDir, "..");

process.chdir(appRoot);

const server = await createServer({
  configFile: resolve(appRoot, "vite.renderer.config.ts")
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
