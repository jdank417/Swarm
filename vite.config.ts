import { resolve } from "node:path";
import { defineConfig } from "vite";

const pages = ["index", "projects", "project", "work", "about", "sailing"];

// Relative base so the build works at https://<user>.github.io/<repo>/ and on any other host.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    target: "es2022",
    rollupOptions: { input: Object.fromEntries(pages.map((p) => [p, resolve(__dirname, `${p}.html`)])) },
  },
});
