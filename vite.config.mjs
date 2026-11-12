import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/-mystery-road-awe-2026-ex1/",
  plugins: [react()],
  server: {
    // Exercise 6 – Demo 4: Anfragen an /api leitet der Vite-Dev-Server an das
    // lokale Backend weiter. Fuer den Browser ist es derselbe Origin -> kein CORS.
    // Gilt nur fuer `vite dev`, nicht fuer den Build/GitHub-Pages-Deploy.
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  build: {
    rolldownOptions: {
      input: {
        vanilla: fileURLToPath(new URL("./index.html", import.meta.url)),
        react: fileURLToPath(new URL("./react.html", import.meta.url)),
      },
    },
  },
});
