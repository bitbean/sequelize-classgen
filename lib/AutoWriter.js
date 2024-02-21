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
var AutoWriter_exports = {};
__export(AutoWriter_exports, {
  AutoWriter: () => AutoWriter
});
module.exports = __toCommonJS(AutoWriter_exports);
var import_fs = __toESM(require("fs"));
var import_lodash = __toESM(require("lodash"));
var import_path = __toESM(require("path"));
var import_util = __toESM(require("util"));
var import_types = require("sequelize-auto/lib/types");
var import_mkdirp = require("mkdirp");
class AutoWriter {
  tableText;
  foreignKeys;
  relations;
  space;
  options;
  constructor(tableData, options) {
    this.tableText = tableData.text;
    this.foreignKeys = tableData.foreignKeys;
    this.relations = tableData.relations;
    this.options = options;
    this.space = (0, import_types.makeIndent)(this.options.spaces, this.options.indentation);
  }
  write() {
    if (this.options.noWrite) {
      return Promise.resolve();
    }
    import_mkdirp.mkdirp.sync(import_path.default.resolve(this.options.directory || "./models"));
    const tables = import_lodash.default.keys(this.tableText);
    const promises = tables.map((t) => {
      return this.createFile(t);
    });
    const isTypeScript = this.options.lang === "ts";
    const assoc = this.createAssociations(isTypeScript);
    const tableNames = tables.map((t) => {
      const [_schemaName, tableName] = (0, import_types.qNameSplit)(t);
      return tableName;
    }).sort();
    if (!this.options.noInitModels) {
      const initString = this.createInitString(
        tableNames,
        assoc,
        this.options.lang
      );
      const initFilePath = import_path.default.join(
        this.options.directory,
        "init-models" + (isTypeScript ? ".ts" : ".js")
      );
      const writeFile = import_util.default.promisify(import_fs.default.writeFile);
      const initPromise = writeFile(import_path.default.resolve(initFilePath), initString);
      promises.push(initPromise);
    }
    return Promise.all(promises);
  }
  createInitString(tableNames, assoc, lang) {
    switch (lang) {
      case "ts":
        return this.createTsInitString(tableNames, assoc);
      case "esm":
        return this.createESMInitString(tableNames, assoc);
      case "es6":
        return this.createES5InitString(tableNames, assoc, "const");
      default:
        return this.createES5InitString(tableNames, assoc, "var");
    }
  }
  createFile(table) {
    const [_schemaName, tableName = null] = (0, import_types.qNameSplit)(table);
    const fileName = (0, import_types.recase)(
      this.options.caseFile,
      tableName,
      this.options.singularize
    );
    const filePath = import_path.default.join(
      this.options.directory,
      fileName + (this.options.lang === "ts" ? ".ts" : ".js")
    );
    const writeFile = import_util.default.promisify(import_fs.default.writeFile);
    return writeFile(import_path.default.resolve(filePath), this.tableText[table]);
  }
  /** Create the belongsToMany/belongsTo/hasMany/hasOne association strings */
  createAssociations(typeScript) {
    let strBelongs = "";
    let strBelongsToMany = "";
    const sp = this.space[1];
    const rels = this.relations;
    rels.forEach((rel) => {
      if (rel.isM2M) {
        const asprop = (0, import_types.recase)(this.options.caseProp, (0, import_types.pluralize)(rel.childProp));
        strBelongsToMany += `${sp}${rel.parentModel}.belongsToMany(${rel.childModel}, { as: '${asprop}', through: ${rel.joinModel}, foreignKey: "${rel.parentId}", otherKey: "${rel.childId}" });
`;
      } else {
        const asParentProp = (0, import_types.recase)(this.options.caseProp, rel.parentProp);
        const bAlias = this.options.noAlias ? "" : `as: "${asParentProp}", `;
        strBelongs += `${sp}${rel.childModel}.belongsTo(${rel.parentModel}, { ${bAlias}foreignKey: "${rel.parentId}"});
`;
        const hasRel = rel.isOne ? "hasOne" : "hasMany";
        const asChildProp = (0, import_types.recase)(this.options.caseProp, rel.childProp);
        const hAlias = this.options.noAlias ? "" : `as: "${asChildProp}", `;
        strBelongs += `${sp}${rel.parentModel}.${hasRel}(${rel.childModel}, { ${hAlias}foreignKey: "${rel.parentId}"});
`;
      }
    });
    return strBelongsToMany + strBelongs;
  }
  // create the TypeScript init-models file to load all the models into Sequelize
  createTsInitString(tables, assoc) {
    let str = 'import type { Sequelize } from "sequelize";\n';
    const sp = this.space[1];
    const fileNames = [];
    const modelNames = [];
    tables.forEach((t) => {
      const fileName = (0, import_types.recase)(
        this.options.caseFile,
        t,
        this.options.singularize
      );
      fileNames.push(fileName);
      const modelName = (0, import_types.makeTableName)(
        this.options.caseModel,
        t,
        this.options.singularize,
        this.options.lang
      );
      modelNames.push(modelName);
      if (this.options.lang === "ts" && this.options.tsEsm) {
        str += `import { ${modelName} } from "./${fileName}.js";
`;
      } else {
        str += `import { ${modelName} } from "./${fileName}";
`;
      }
    });
    str += "\n";
    if (this.options.lang === "ts" && this.options.tsEsm) {
      fileNames.forEach((fileName) => {
        str += `export * from "./${fileName}.js";
`;
      });
    } else {
      fileNames.forEach((fileName) => {
        str += `export * from "./${fileName}";
`;
      });
    }
    str += "\n";
    str += `export ${this.options.initModelsDefault ? "default " : ""}function initModels(sequelize: Sequelize) {
`;
    modelNames.forEach((m) => {
      str += `${sp}${m}.initModel(sequelize);
`;
    });
    str += "\n" + assoc;
    str += "}\n";
    return str;
  }
  // create the ES5 init-models file to load all the models into Sequelize
  createES5InitString(tables, assoc, vardef) {
    let str = `${vardef} DataTypes = require("sequelize").DataTypes;
`;
    const sp = this.space[1];
    const modelNames = [];
    tables.forEach((t) => {
      const fileName = (0, import_types.recase)(
        this.options.caseFile,
        t,
        this.options.singularize
      );
      const modelName = (0, import_types.makeTableName)(
        this.options.caseModel,
        t,
        this.options.singularize,
        this.options.lang
      );
      modelNames.push(modelName);
      str += `${vardef} _${modelName} = require("./${fileName}");
`;
    });
    str += "\nfunction initModels(sequelize) {\n";
    modelNames.forEach((m) => {
      str += `${sp}${vardef} ${m} = _${m}(sequelize, DataTypes);
`;
    });
    str += "\n" + assoc;
    str += `
${sp}return {
`;
    modelNames.forEach((m) => {
      str += `${this.space[2]}${m},
`;
    });
    str += `${sp}};
`;
    str += "}\n";
    str += "module.exports = initModels;\n";
    str += "module.exports.initModels = initModels;\n";
    str += "module.exports.default = initModels;\n";
    return str;
  }
  // create the ESM init-models file to load all the models into Sequelize
  createESMInitString(tables, assoc) {
    let str = 'import _sequelize from "sequelize";\n';
    str += "const DataTypes = _sequelize.DataTypes;\n";
    const sp = this.space[1];
    const modelNames = [];
    tables.forEach((t) => {
      const fileName = (0, import_types.recase)(
        this.options.caseFile,
        t,
        this.options.singularize
      );
      const modelName = (0, import_types.makeTableName)(
        this.options.caseModel,
        t,
        this.options.singularize,
        this.options.lang
      );
      modelNames.push(modelName);
      str += `import _${modelName} from  "./${fileName}.js";
`;
    });
    str += "\nexport default function initModels(sequelize) {\n";
    modelNames.forEach((m) => {
      str += `${sp}const ${m} = _${m}.init(sequelize, DataTypes);
`;
    });
    str += "\n" + assoc;
    str += `
${sp}return {
`;
    modelNames.forEach((m) => {
      str += `${this.space[2]}${m},
`;
    });
    str += `${sp}};
`;
    str += "}\n";
    return str;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AutoWriter
});
