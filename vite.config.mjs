import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/-mystery-road-awe-2026-ex1/",
  plugins: [react()],
  build: {
    rolldownOptions: {
      input: {
        vanilla: fileURLToPath(new URL("./index.html", import.meta.url)),
        react: fileURLToPath(new URL("./react.html", import.meta.url)),
      },
    },
  },
});