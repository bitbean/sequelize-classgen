// import Path from "node:path";
// import FS from "node:fs/promises";
// import type { Plugin } from "esbuild";
import { build } from "esbuild";
import { glob } from "glob";

// /** Example plugin to copy static files */
// function copyStaticFiles(): Plugin {
//   return {
//     name: "copyStaticFiles",
//     setup(build) {
//       const { outdir = "dist" } = build.initialOptions;
//       const source = Path.join(__dirname, "../static");
//       const dest = Path.join(outdir, "static");
//       build.onEnd(async () => FS.cp(source, dest, { recursive: true }));
//     },
//   };
// }

(async function () {
  // Get all ts files
  const entryPoints = (await glob("src/**/*.ts"));
  // .filter(
  //   (p) => p !== "src/types.ts",
  // );

  build({
    entryPoints,
    logLevel: "info",
    outdir: "dist",
    bundle: false,
    minify: false,
    platform: "node",
    format: "cjs",
    sourcemap: "external",
    target: "node16",
    // plugins: [
    // //   copyStaticFiles(),
    // ],
  });
})();
