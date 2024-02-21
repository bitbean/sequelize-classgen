"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var generate_models_exports = {};
__export(generate_models_exports, {
  main: () => main
});
module.exports = __toCommonJS(generate_models_exports);
var import_path = __toESM(require("path"));
var import_sequelize_auto = require("sequelize-auto");
var import_AutoGenerator = require("./AutoGenerator");
var import_AutoWriter = require("./AutoWriter");
const { dialects } = require("sequelize-auto/lib/dialects/dialects");
async function main() {
  const configPath = import_path.default.join(
    process.cwd(),
    // arg[0] = "node.exe", arg[1] = "/to/node_modules/.bin/sequelize-classgen"
    process.argv[2] ?? ".sequelize-classgen.cjs"
  );
  console.log(configPath, "PATH FROM:", process.argv.length, process.argv);
  const config = require(import_path.default.resolve(configPath));
  console.log("Generating custom models...");
  await generateModels(config).catch((err) => console.error("" + err));
  console.log("OK");
}
async function generateModels(config) {
  const options = {
    //
    // Set values or `default` same as node_modules/.bin/sequelize-auto.
    //
    /** @type {import("sequelize").ModelOptions} */
    additional: {
      // These timestamp fields don't exist on every table in this project...
      // paranoid: true,
      // timestamps: true,
    },
    caseModel: "p",
    caseFile: "p",
    caseProp: "o",
    indentation: 2,
    lang: "ts",
    noAlias: false,
    //            default
    noInitModels: false,
    //       default
    noIndexes: false,
    //          default
    noWrite: false,
    //            default
    pkSuffixes: null,
    //          default
    singularize: true,
    spaces: true,
    //              default
    storage: config.database,
    //  default
    skipTables: ["SequelizeMeta"],
    // default = null
    skipFields: null,
    //          default
    schema: void 0,
    //         default
    /** @type {string[] | string | null} */
    tables: null,
    //              default
    useDefine: false,
    //          default
    views: false,
    //              default
    tsEsm: true,
    initModelsDefault: true,
    ...config
  };
  const sqlAuto = new import_sequelize_auto.SequelizeAuto(
    options.database,
    options.username,
    options.password,
    options
  );
  let td = await sqlAuto.build();
  td = sqlAuto.relate(td);
  const tt = generate(sqlAuto, td, options);
  td.text = tt;
  await write(td, options);
  return td;
}
function generate(sqlAuto, td, options) {
  const dialect = dialects[sqlAuto.sequelize.getDialect()];
  const generator = new import_AutoGenerator.AutoGenerator(td, dialect, options);
  return generator.generateText();
}
async function write(td, options) {
  const writer = new import_AutoWriter.AutoWriter(td, options);
  return writer.write();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});
