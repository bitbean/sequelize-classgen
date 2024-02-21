/** @file Custom runner for sequelize-auto using code from that project. */
import Path from "path";
// import type { DialectOptions } from "sequelize-auto/types/dialects/dialect-options";
import { Options as SequelizeOptions } from "sequelize";
import { AutoOptions, SequelizeAuto, TableData } from "sequelize-auto";
// import { makeTableName, qNameSplit } from "sequelize-auto/lib/types";
// Local
import { AutoGenerator } from "./AutoGenerator";
import { AutoWriter } from "./AutoWriter";

type GeneratorOptions = ConstructorParameters<typeof AutoGenerator>[2];

const { dialects } = require("sequelize-auto/lib/dialects/dialects");

export async function main() {
  const configPath = Path.join(
    process.cwd(),
    // arg[0] = "node.exe", arg[1] = "/to/node_modules/.bin/sequelize-classgen"
    process.argv[2] ?? ".sequelize-classgen.cjs",
  );
  console.log(configPath, "PATH FROM:", process.argv.length, process.argv);
  const config = require(Path.resolve(configPath)) as Partial<GeneratorOptions>;

  console.log("Generating custom models...");
  await generateModels(config).catch((err) => console.error("" + err));
  console.log("OK");
}

async function generateModels(config: Partial<GeneratorOptions>) {
  // console.log("CONFIG", config); if (process) return;

  const options: GeneratorOptions = {
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
    noAlias: false, //            default
    noInitModels: false, //       default
    noIndexes: false, //          default
    noWrite: false, //            default
    pkSuffixes: null as any, //          default
    singularize: true,
    spaces: true, //              default
    storage: config.database, //  default
    skipTables: ["SequelizeMeta"], // default = null
    skipFields: null as any, //          default
    schema: undefined, //         default
    /** @type {string[] | string | null} */
    tables: null as any, //              default
    useDefine: false, //          default
    views: false, //              default
    tsEsm: true,
    initModelsDefault: true,
    ...(config as any),
  };
  const sqlAuto = new SequelizeAuto(
    options.database!,
    options.username!,
    options.password!,
    options as any,
  );
  let td = await sqlAuto.build();
  td = sqlAuto.relate(td);
  const tt = generate(sqlAuto, td, options);
  td.text = tt;
  await write(td, options);
  return td;
}

function generate(
  sqlAuto: SequelizeAuto,
  td: TableData,
  options: SequelizeOptions & AutoOptions,
) {
  const dialect = dialects[sqlAuto.sequelize.getDialect()];
  const generator = new AutoGenerator(td, dialect, options);
  return generator.generateText();
}

async function write(td: TableData, options: SequelizeOptions & AutoOptions) {
  const writer = new AutoWriter(td, options);
  return writer.write();
}
