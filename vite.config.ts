import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/deepseek": {
        target: "https://api.deepseek.com",
        changeOrigin: true,
        rewrite: (pathName) => pathName.replace(/^\/api\/deepseek/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(rootDir, "src"),
    },
  },
});
