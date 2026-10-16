import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build` → dist/ (julkaisu Verceliin).
// `npm run build:single` → dist-single/index.html, kaikki yhdessä tiedostossa esikatselua varten.
export default defineConfig(({ mode }) =>
  mode === "single"
    ? { plugins: [viteSingleFile()], build: { target: "es2022", outDir: "dist-single", assetsInlineLimit: 100_000_000 } }
    : { build: { target: "es2022" } },
);
