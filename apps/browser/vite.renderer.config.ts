import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/renderer",
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: false
  },
  resolve: {
    alias: {
      "@renderer": resolve("src/renderer/src")
    }
  },
  plugins: [react()]
});
