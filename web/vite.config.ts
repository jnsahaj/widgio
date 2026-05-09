import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const root = resolve(__dirname);
const repoRoot = resolve(__dirname, "..");

export default defineConfig({
  root,
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(root, "src"),
      "@shared": resolve(repoRoot, "src/shared"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/widgets": "http://127.0.0.1:4242",
      "/threads": "http://127.0.0.1:4242",
      "/events": { target: "http://127.0.0.1:4242", ws: false, changeOrigin: true },
      "/health": "http://127.0.0.1:4242",
    },
  },
  build: {
    outDir: resolve(repoRoot, "dist/client"),
    emptyOutDir: true,
    sourcemap: false,
  },
});
