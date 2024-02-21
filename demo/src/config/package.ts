import FS from "node:fs";
import Path from "node:path";

/** Path to the folder containing our `package.json` file. */
export const PKG_DIR = Path.resolve(
  __dirname,
  // For an ESM/"type":"mdule" package: new URL(import.meta.url).pathname,
  "../../",
);
/** Path to our `package.json` file. */
export const PKG_PATH = Path.join(PKG_DIR, "package.json");

const PKG_DATA = JSON.parse(FS.readFileSync(PKG_PATH).toString());

/** Name of this package from our `package.json` file. */
export const PKG_NAME = "" + PKG_DATA.name;
/** Version of this package from our `package.json` file. */
export const PKG_VER = "" + PKG_DATA.version;
