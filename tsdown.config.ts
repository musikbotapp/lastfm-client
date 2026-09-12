import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  fixedExtension: false,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
});
