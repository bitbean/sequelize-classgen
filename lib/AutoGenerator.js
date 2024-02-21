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
var AutoGenerator_exports = {};
__export(AutoGenerator_exports, {
  AutoGenerator: () => AutoGenerator
});
module.exports = __toCommonJS(AutoGenerator_exports);
var import_lodash = __toESM(require("lodash"));
var import_types = require("sequelize-auto/lib/types");
class AutoGenerator {
  dialect;
  tables;
  foreignKeys;
  hasTriggerTables;
  indexes;
  relations;
  space;
  options;
  /** Metadata collected for use in creating TypeBox schemas. */
  meta;
  constructor(tableData, dialect, options) {
    this.tables = tableData.tables;
    this.foreignKeys = tableData.foreignKeys;
    this.hasTriggerTables = tableData.hasTriggerTables;
    this.indexes = tableData.indexes;
    this.relations = tableData.relations;
    this.dialect = dialect;
    this.options = options;
    this.options.lang = this.options.lang || "es5";
    this.space = (0, import_types.makeIndent)(this.options.spaces, this.options.indentation);
    this.meta = {};
  }
  makeHeaderTemplate(table, params) {
    const tbl = this.tables[table];
    const meta = this.meta[table];
    const fields = import_lodash.default.keys(tbl);
    const importOptional = this.getTypeScriptCreationOptionalFields(table).length > 0;
    const importTypeBox = !this.options.noSchemas;
    const importSafeDate = importTypeBox && fields.some((field) => {
      var _a;
      return !!((_a = meta == null ? void 0 : meta[field]) == null ? void 0 : _a.dateFormat);
    });
    const Includeable = params.associations.names.length > 0 ? ", Includeable" : "";
    let header = "";
    const sp = this.space[1];
    if (this.options.lang === "ts") {
      header += "import * as Sequelize from 'sequelize';\n";
      if (importOptional) {
        header += `import { DataTypes${Includeable}, Model, Optional } from 'sequelize';
`;
      } else {
        header += `import { DataTypes${Includeable}, Model } from 'sequelize';
`;
      }
      if (importTypeBox) {
        header += "import { ";
        if (importOptional)
          header += "Maybe, ";
        if (importSafeDate)
          header += "SafeDate, ";
        header += "Static, Type } from '../../common/typing.js';\n";
      }
    } else if (this.options.lang === "es6") {
      header += "const Sequelize = require('sequelize');\n";
      header += "module.exports = (sequelize, DataTypes) => {\n";
      header += sp + "return #TABLE#.init(sequelize, DataTypes);\n";
      header += "}\n\n";
      header += "class #TABLE# extends Sequelize.Model {\n";
      header += sp + "static init(sequelize, DataTypes) {\n";
      if (this.options.useDefine) {
        header += sp + "return sequelize.define('#TABLE#', {\n";
      } else {
        header += sp + "return super.init({\n";
      }
    } else if (this.options.lang === "esm") {
      header += "import _sequelize from 'sequelize';\n";
      header += "const { Model, Sequelize } = _sequelize;\n\n";
      header += "export default class #TABLE# extends Model {\n";
      header += sp + "static init(sequelize, DataTypes) {\n";
      if (this.options.useDefine) {
        header += sp + "return sequelize.define('#TABLE#', {\n";
      } else {
        header += sp + "return super.init({\n";
      }
    } else {
      header += "const Sequelize = require('sequelize');\n";
      header += "module.exports = function(sequelize, DataTypes) {\n";
      header += sp + "return sequelize.define('#TABLE#', {\n";
    }
    return header;
  }
  generateText() {
    const tableNames = import_lodash.default.keys(this.tables);
    const text = {};
    tableNames.forEach((table) => {
      let str = "";
      const [_schemaName, tableNameOrig = null] = (0, import_types.qNameSplit)(table);
      const tableName = (0, import_types.makeTableName)(
        this.options.caseModel,
        tableNameOrig,
        this.options.singularize,
        this.options.lang
      );
      const associations = this.addTypeScriptAssociationMixins(table);
      if (this.options.lang === "ts") {
        const needed = import_lodash.default.keys(associations.needed).sort();
        needed.forEach((fkTable) => {
          const set = associations.needed[fkTable];
          const [_fkSchema, fkTableName = null] = (0, import_types.qNameSplit)(fkTable);
          const filename = (0, import_types.recase)(
            this.options.caseFile,
            fkTableName,
            this.options.singularize
          );
          str += "import type { ";
          str += Array.from(set.values()).sort().join(", ");
          if (this.options.lang === "ts" && this.options.tsEsm) {
            str += ` } from './${filename}.js';
`;
          } else {
            str += ` } from './${filename}';
`;
          }
        });
        str += "\nexport interface #TABLE#Attributes {\n";
        str += this.addTypeScriptFields(table, true) + "}\n\n";
        const primaryKeys = this.getTypeScriptPrimaryKeys(table);
        if (primaryKeys.length) {
          str += `export type #TABLE#Pk = ${primaryKeys.map((k) => `"${(0, import_types.recase)(this.options.caseProp, k)}"`).join(" | ")};
`;
          str += `export type #TABLE#Id = #TABLE#[#TABLE#Pk];
`;
        }
        const creationOptionalFields = this.getTypeScriptCreationOptionalFields(table);
        if (creationOptionalFields.length) {
          str += `export type #TABLE#OptionalAttributes = ${creationOptionalFields.map((k) => `"${(0, import_types.recase)(this.options.caseProp, k)}"`).join(" | ")};
`;
          str += "export type #TABLE#CreationAttributes = Optional<#TABLE#Attributes, #TABLE#OptionalAttributes>;\n\n";
        } else {
          str += "export type #TABLE#CreationAttributes = #TABLE#Attributes;\n\n";
        }
        str += "export class #TABLE# extends Model<#TABLE#Attributes, #TABLE#CreationAttributes> implements #TABLE#Attributes {\n";
        str += this.addTypeScriptFields(table, false);
        str += "\n" + associations.str;
        str += "\n" + this.space[1] + "static initModel(sequelize: Sequelize.Sequelize): typeof #TABLE# {\n";
        if (this.options.useDefine) {
          str += this.space[2] + "return sequelize.define('#TABLE#', {\n";
        } else {
          str += this.space[2] + "return #TABLE#.init({\n";
        }
      }
      str += this.addTable(table);
      const lang = this.options.lang;
      if (lang === "ts" && this.options.useDefine) {
        str += ") as typeof #TABLE#;\n";
      } else {
        str += ");\n";
      }
      if (lang === "es6" || lang === "esm" || lang === "ts") {
        if (this.options.useDefine) {
          str += this.space[1] + "}\n}\n";
        } else {
          str += this.space[1] + "}\n}\n";
        }
      } else {
        str += "};\n";
      }
      if (lang === "ts") {
        str += this.addNamespacedHelpers(table, {
          associations
        });
      }
      const re = new RegExp("#TABLE#", "g");
      str = str.replace(re, tableName);
      text[table] = this.makeHeaderTemplate(table, {
        associations
      }) + str;
    });
    return text;
  }
  // Create a string for the model of the table
  addTable(table) {
    const [schemaName, tableNameOrig] = (0, import_types.qNameSplit)(table);
    const space = this.space;
    let timestamps = this.options.additional && this.options.additional.timestamps === true || false;
    let paranoid = this.options.additional && this.options.additional.paranoid === true || false;
    let str = "";
    const fields = import_lodash.default.keys(this.tables[table]);
    fields.forEach((field, index) => {
      timestamps ||= this.isTimestampField(field);
      paranoid ||= this.isParanoidField(field);
      str += this.addField(table, field);
    });
    str = str.substring(0, str.length - 2) + "\n";
    str += space[1] + "}, {\n";
    if (!this.options.useDefine) {
      str += space[2] + "sequelize,\n";
    }
    str += space[2] + "tableName: '" + tableNameOrig + "',\n";
    if (schemaName && this.dialect.hasSchema) {
      str += space[2] + "schema: '" + schemaName + "',\n";
    }
    if (this.hasTriggerTables[table]) {
      str += space[2] + "hasTrigger: true,\n";
    }
    str += space[2] + "timestamps: " + timestamps + ",\n";
    if (paranoid) {
      str += space[2] + "paranoid: true,\n";
    }
    const hasadditional = import_lodash.default.isObject(this.options.additional) && import_lodash.default.keys(this.options.additional).length > 0;
    if (hasadditional) {
      import_lodash.default.each(this.options.additional, (value, key) => {
        if (key === "name") {
          str += space[2] + "name: {\n";
          str += space[3] + "singular: '" + table + "',\n";
          str += space[3] + "plural: '" + table + "'\n";
          str += space[2] + "},\n";
        } else if (key === "timestamps" || key === "paranoid") {
        } else {
          value = import_lodash.default.isBoolean(value) ? value : "'" + value + "'";
          str += space[2] + key + ": " + value + ",\n";
        }
      });
    }
    if (!this.options.noIndexes) {
      str += this.addIndexes(table);
    }
    str = space[2] + str.trim();
    str = str.substring(0, str.length - 1);
    str += "\n" + space[1] + "}";
    return str;
  }
  // Create a string containing field attributes (type, defaultValue, etc.)
  addField(table, field) {
    if (this.isIgnoredField(field)) {
      return "";
    }
    const foreignKey = this.foreignKeys[table] && this.foreignKeys[table][field] ? this.foreignKeys[table][field] : null;
    const fieldObj = this.tables[table][field];
    if (import_lodash.default.isObject(foreignKey)) {
      fieldObj.foreignKey = foreignKey;
    }
    const fieldName = (0, import_types.recase)(this.options.caseProp, field);
    let str = this.quoteName(fieldName) + ": {\n";
    const quoteWrapper = '"';
    const unique = fieldObj.unique || fieldObj.foreignKey && fieldObj.foreignKey.isUnique;
    const isSerialKey = fieldObj.foreignKey && fieldObj.foreignKey.isSerialKey || this.dialect.isSerialKey && this.dialect.isSerialKey(fieldObj);
    let wroteAutoIncrement = false;
    const space = this.space;
    const fieldAttrs = import_lodash.default.keys(fieldObj);
    fieldAttrs.forEach((attr) => {
      if (attr === "special" || attr === "elementType" || attr === "unique") {
        return true;
      }
      if (isSerialKey && !wroteAutoIncrement) {
        str += space[3] + "autoIncrement: true,\n";
        if (this.dialect.name === "postgres" && fieldObj.foreignKey && fieldObj.foreignKey.isPrimaryKey === true && (fieldObj.foreignKey.generation === "ALWAYS" || fieldObj.foreignKey.generation === "BY DEFAULT")) {
          str += space[3] + "autoIncrementIdentity: true,\n";
        }
        wroteAutoIncrement = true;
      }
      if (attr === "foreignKey") {
        if (foreignKey && foreignKey.isForeignKey) {
          str += space[3] + "references: {\n";
          str += space[4] + "model: '" + fieldObj[attr].foreignSources.target_table + "',\n";
          str += space[4] + "key: '" + fieldObj[attr].foreignSources.target_column + "'\n";
          str += space[3] + "}";
        } else {
          return true;
        }
      } else if (attr === "references") {
        return true;
      } else if (attr === "primaryKey") {
        if (fieldObj[attr] === true && (!import_lodash.default.has(fieldObj, "foreignKey") || !!fieldObj.foreignKey.isPrimaryKey)) {
          str += space[3] + "primaryKey: true";
        } else {
          return true;
        }
      } else if (attr === "autoIncrement") {
        if (fieldObj[attr] === true && !wroteAutoIncrement) {
          str += space[3] + "autoIncrement: true,\n";
          if (this.dialect.name === "postgres" && fieldObj.foreignKey && fieldObj.foreignKey.isPrimaryKey === true && (fieldObj.foreignKey.generation === "ALWAYS" || fieldObj.foreignKey.generation === "BY DEFAULT")) {
            str += space[3] + "autoIncrementIdentity: true,\n";
          }
          wroteAutoIncrement = true;
        }
        return true;
      } else if (attr === "allowNull") {
        str += space[3] + attr + ": " + fieldObj[attr];
      } else if (attr === "defaultValue") {
        let defaultVal = fieldObj.defaultValue;
        if (this.dialect.name === "mssql" && defaultVal && defaultVal.toLowerCase() === "(newid())") {
          defaultVal = null;
        }
        if (this.dialect.name === "mssql" && (["(NULL)", "NULL"].includes(defaultVal) || typeof defaultVal === "undefined")) {
          defaultVal = null;
        }
        if (defaultVal === null || defaultVal === void 0) {
          return true;
        }
        if (isSerialKey) {
          return true;
        }
        let val_text = defaultVal;
        if (import_lodash.default.isString(defaultVal)) {
          const field_type = fieldObj.type.toLowerCase();
          defaultVal = this.escapeSpecial(defaultVal);
          while (defaultVal.startsWith("(") && defaultVal.endsWith(")")) {
            defaultVal = defaultVal.replace(/^[(]/, "").replace(/[)]$/, "");
          }
          if (field_type === "bit(1)" || field_type === "bit" || field_type === "boolean") {
            val_text = /1|true/i.test(defaultVal) ? "true" : "false";
          } else if (this.isArray(field_type)) {
            val_text = defaultVal.replace(/^{/, "").replace(/}$/, "");
            if (val_text && this.isString(fieldObj.elementType)) {
              val_text = val_text.split(",").map((s) => `"${s}"`).join(",");
            }
            val_text = `[${val_text}]`;
          } else if (field_type.match(/^(json)/)) {
            val_text = defaultVal.replace(/\\"/g, '"');
          } else if (field_type === "uuid" && (defaultVal === "gen_random_uuid()" || defaultVal === "uuid_generate_v4()")) {
            val_text = "DataTypes.UUIDV4";
          } else if (defaultVal.match(/\w+\(\)$/)) {
            val_text = "Sequelize.Sequelize.fn('" + defaultVal.replace(/\(\)$/g, "") + "')";
          } else if (this.isNumber(field_type)) {
            if (defaultVal.match(/\(\)/g)) {
              val_text = "Sequelize.Sequelize.literal('" + defaultVal + "')";
            } else {
              val_text = defaultVal;
            }
          } else if (defaultVal.match(/\(\)/g)) {
            val_text = "Sequelize.Sequelize.literal('" + defaultVal + "')";
          } else if (field_type.indexOf("date") === 0 || field_type.indexOf("timestamp") === 0) {
            if (import_lodash.default.includes(
              [
                "current_timestamp",
                "current_date",
                "current_time",
                "localtime",
                "localtimestamp"
              ],
              defaultVal.toLowerCase()
            )) {
              val_text = "Sequelize.Sequelize.literal('" + defaultVal + "')";
            } else {
              val_text = quoteWrapper + defaultVal + quoteWrapper;
            }
          } else {
            val_text = quoteWrapper + defaultVal + quoteWrapper;
          }
        }
        str += space[3] + attr + ": " + val_text;
      } else if (attr === "comment" && (!fieldObj[attr] || this.dialect.name === "mssql")) {
        return true;
      } else {
        let val = attr !== "type" ? null : this.getSqType(table, field, fieldObj, attr);
        if (val == null) {
          val = fieldObj[attr];
          val = import_lodash.default.isString(val) ? quoteWrapper + this.escapeSpecial(val) + quoteWrapper : val;
        }
        str += space[3] + attr + ": " + val;
      }
      str += ",\n";
    });
    if (unique) {
      const uniq = import_lodash.default.isString(unique) ? quoteWrapper + unique.replace(/\"/g, '\\"') + quoteWrapper : unique;
      str += space[3] + "unique: " + uniq + ",\n";
    }
    if (field !== fieldName) {
      str += space[3] + "field: '" + field + "',\n";
    }
    str = str.trim().replace(/,+$/, "") + "\n";
    str = space[2] + str + space[2] + "},\n";
    return str;
  }
  addIndexes(table) {
    const indexes = this.indexes[table];
    const space = this.space;
    let str = "";
    if (indexes && indexes.length) {
      str += space[2] + "indexes: [\n";
      indexes.forEach((idx) => {
        str += space[3] + "{\n";
        if (idx.name) {
          str += space[4] + `name: "${idx.name}",
`;
        }
        if (idx.unique) {
          str += space[4] + "unique: true,\n";
        }
        if (idx.type) {
          if (["UNIQUE", "FULLTEXT", "SPATIAL"].includes(idx.type)) {
            str += space[4] + `type: "${idx.type}",
`;
          } else {
            str += space[4] + `using: "${idx.type}",
`;
          }
        }
        str += space[4] + `fields: [
`;
        idx.fields.forEach((ff) => {
          str += space[5] + `{ name: "${ff.attribute}"`;
          if (ff.collate) {
            str += `, collate: "${ff.collate}"`;
          }
          if (ff.length) {
            str += `, length: ${ff.length}`;
          }
          if (ff.order && ff.order !== "ASC") {
            str += `, order: "${ff.order}"`;
          }
          str += " },\n";
        });
        str += space[4] + "]\n";
        str += space[3] + "},\n";
      });
      str += space[2] + "],\n";
    }
    return str;
  }
  /** Get the sequelize type from the Field */
  getSqType(table, field, fieldObj, attr) {
    const attrValue = fieldObj[attr];
    if (!attrValue.toLowerCase) {
      console.log("attrValue", attr, attrValue);
      return attrValue;
    }
    const type = attrValue.toLowerCase();
    const length = type.match(/\(\d+\)/);
    const precision = type.match(/\(\d+,\d+\)/);
    let val = null;
    let typematch = null;
    if (type === "boolean" || type === "bit(1)" || type === "bit" || type === "tinyint(1)") {
      val = "DataTypes.BOOLEAN";
    } else if (type === "numrange") {
      val = "DataTypes.RANGE(DataTypes.DECIMAL)";
    } else if (type === "int4range") {
      val = "DataTypes.RANGE(DataTypes.INTEGER)";
    } else if (type === "int8range") {
      val = "DataTypes.RANGE(DataTypes.BIGINT)";
    } else if (type === "daterange") {
      val = "DataTypes.RANGE(DataTypes.DATEONLY)";
    } else if (type === "tsrange" || type === "tstzrange") {
      val = "DataTypes.RANGE(DataTypes.DATE)";
    } else if (typematch = type.match(/^(bigint|smallint|mediumint|tinyint|int)/)) {
      val = "DataTypes." + (typematch[0] === "int" ? "INTEGER" : typematch[0].toUpperCase());
      if (/unsigned/i.test(type)) {
        val += ".UNSIGNED";
      }
      if (/zerofill/i.test(type)) {
        val += ".ZEROFILL";
      }
    } else if (type === "nvarchar(max)" || type === "varchar(max)") {
      val = "DataTypes.TEXT";
    } else if (type.match(/n?varchar|string|varying/)) {
      val = "DataTypes.STRING" + (!import_lodash.default.isNull(length) ? length : "");
      if (length !== null && attr === "type") {
        import_lodash.default.set(
          this.meta,
          `${table}.${field}.length`,
          parseInt(("" + length).substring(1))
        );
      }
    } else if (type.match(/^n?char/)) {
      val = "DataTypes.CHAR" + (!import_lodash.default.isNull(length) ? length : "");
      if (length !== null && attr === "type") {
        import_lodash.default.set(
          this.meta,
          `${table}.${field}.length`,
          parseInt(("" + length).substring(1))
        );
      }
    } else if (type.match(/^real/)) {
      val = "DataTypes.REAL";
    } else if (type.match(/text$/)) {
      val = "DataTypes.TEXT" + (!import_lodash.default.isNull(length) ? length : "");
    } else if (type === "date") {
      val = "DataTypes.DATEONLY";
    } else if (type.match(/^(date|timestamp|year)/)) {
      val = "DataTypes.DATE" + (!import_lodash.default.isNull(length) ? length : "");
      if (type.match(/^(datetime|timestamp)/)) {
        import_lodash.default.set(this.meta, `${table}.${field}.dateFormat`, "datetime");
      }
    } else if (type.match(/^(time)/)) {
      val = "DataTypes.TIME";
    } else if (type.match(/^(float|float4)/)) {
      val = "DataTypes.FLOAT" + (!import_lodash.default.isNull(precision) ? precision : "");
    } else if (type.match(/^(decimal|numeric)/)) {
      val = "DataTypes.DECIMAL" + (!import_lodash.default.isNull(precision) ? precision : "");
    } else if (type.match(/^money/)) {
      val = "DataTypes.DECIMAL(19,4)";
    } else if (type.match(/^smallmoney/)) {
      val = "DataTypes.DECIMAL(10,4)";
    } else if (type.match(/^(float8|double)/)) {
      val = "DataTypes.DOUBLE" + (!import_lodash.default.isNull(precision) ? precision : "");
    } else if (type.match(/^uuid|uniqueidentifier/)) {
      val = "DataTypes.UUID";
    } else if (type.match(/^jsonb/)) {
      val = "DataTypes.JSONB";
    } else if (type.match(/^json/)) {
      val = "DataTypes.JSON";
    } else if (type.match(/^geometry/)) {
      const gtype = fieldObj.elementType ? `(${fieldObj.elementType})` : "";
      val = `DataTypes.GEOMETRY${gtype}`;
    } else if (type.match(/^geography/)) {
      const gtype = fieldObj.elementType ? `(${fieldObj.elementType})` : "";
      val = `DataTypes.GEOGRAPHY${gtype}`;
    } else if (type.match(/^array/)) {
      const eltype = this.getSqType(table, field, fieldObj, "elementType");
      val = `DataTypes.ARRAY(${eltype})`;
    } else if (type.match(/(binary|image|blob|bytea)/)) {
      val = "DataTypes.BLOB";
    } else if (type.match(/^hstore/)) {
      val = "DataTypes.HSTORE";
    } else if (type.match(/^inet/)) {
      val = "DataTypes.INET";
    } else if (type.match(/^cidr/)) {
      val = "DataTypes.CIDR";
    } else if (type.match(/^oid/)) {
      val = "DataTypes.INTEGER";
    } else if (type.match(/^macaddr/)) {
      val = "DataTypes.MACADDR";
    } else if (type.match(/^enum(\(.*\))?$/)) {
      const enumValues = this.getEnumValues(fieldObj);
      val = `DataTypes.ENUM(${enumValues})`;
    }
    return val;
  }
  getTypeScriptPrimaryKeys(table) {
    const fields = import_lodash.default.keys(this.tables[table]);
    return fields.filter((field) => {
      const fieldObj = this.tables[table][field];
      return fieldObj["primaryKey"];
    });
  }
  getTypeScriptCreationOptionalFields(table) {
    const fields = import_lodash.default.keys(this.tables[table]);
    return fields.filter((field) => {
      const fieldObj = this.tables[table][field];
      return fieldObj.allowNull || !!fieldObj.defaultValue || fieldObj.defaultValue === "" || fieldObj.autoIncrement || this.isTimestampField(field);
    });
  }
  /** Add schema to table so it will match the relation data.  Fixes mysql problem. */
  addSchemaForRelations(table) {
    if (!table.includes(".") && !this.relations.some((rel) => rel.childTable === table)) {
      const first = this.relations.find((rel) => !!rel.childTable);
      if (first) {
        const [schemaName, _tableName] = (0, import_types.qNameSplit)(first.childTable);
        if (schemaName) {
          table = (0, import_types.qNameJoin)(schemaName, table);
        }
      }
    }
    return table;
  }
  addTypeScriptAssociationMixins(table) {
    const sp = this.space[1];
    const needed = {};
    const names = [];
    let str = "";
    table = this.addSchemaForRelations(table);
    this.relations.forEach((rel) => {
      if (!rel.isM2M) {
        if (rel.childTable === table) {
          const pparent = import_lodash.default.upperFirst(rel.parentProp);
          str += `${sp}// ${rel.childModel} belongsTo ${rel.parentModel} via ${rel.parentId}
`;
          str += `${sp}declare ${rel.parentProp}?: ${rel.parentModel};
`;
          str += `${sp}declare get${pparent}: Sequelize.BelongsToGetAssociationMixin<${rel.parentModel}>;
`;
          str += `${sp}declare set${pparent}: Sequelize.BelongsToSetAssociationMixin<${rel.parentModel}, ${rel.parentModel}Id>;
`;
          str += `${sp}declare create${pparent}: Sequelize.BelongsToCreateAssociationMixin<${rel.parentModel}>;
`;
          needed[rel.parentTable] ??= /* @__PURE__ */ new Set();
          needed[rel.parentTable].add(rel.parentModel);
          needed[rel.parentTable].add(rel.parentModel + "Id");
          names.push(rel.parentProp);
        } else if (rel.parentTable === table) {
          needed[rel.childTable] ??= /* @__PURE__ */ new Set();
          const pchild = import_lodash.default.upperFirst(rel.childProp);
          if (rel.isOne) {
            str += `${sp}// ${rel.parentModel} hasOne ${rel.childModel} via ${rel.parentId}
`;
            str += `${sp}declare ${rel.childProp}?: ${rel.childModel};
`;
            str += `${sp}declare get${pchild}: Sequelize.HasOneGetAssociationMixin<${rel.childModel}>;
`;
            str += `${sp}declare set${pchild}: Sequelize.HasOneSetAssociationMixin<${rel.childModel}, ${rel.childModel}Id>;
`;
            str += `${sp}declare create${pchild}: Sequelize.HasOneCreateAssociationMixin<${rel.childModel}>;
`;
            needed[rel.childTable].add(rel.childModel);
            needed[rel.childTable].add(`${rel.childModel}Id`);
            needed[rel.childTable].add(`${rel.childModel}CreationAttributes`);
            names.push(rel.childProp);
          } else {
            const hasModel = rel.childModel;
            const sing = import_lodash.default.upperFirst((0, import_types.singularize)(rel.childProp));
            const lur = (0, import_types.pluralize)(rel.childProp);
            const plur = import_lodash.default.upperFirst(lur);
            str += `${sp}// ${rel.parentModel} hasMany ${rel.childModel} via ${rel.parentId}
`;
            str += `${sp}declare ${lur}?: ${rel.childModel}[];
`;
            str += `${sp}declare get${plur}: Sequelize.HasManyGetAssociationsMixin<${hasModel}>;
`;
            str += `${sp}declare set${plur}: Sequelize.HasManySetAssociationsMixin<${hasModel}, ${hasModel}Id>;
`;
            str += `${sp}declare add${sing}: Sequelize.HasManyAddAssociationMixin<${hasModel}, ${hasModel}Id>;
`;
            str += `${sp}declare add${plur}: Sequelize.HasManyAddAssociationsMixin<${hasModel}, ${hasModel}Id>;
`;
            str += `${sp}declare create${sing}: Sequelize.HasManyCreateAssociationMixin<${hasModel}>;
`;
            str += `${sp}declare remove${sing}: Sequelize.HasManyRemoveAssociationMixin<${hasModel}, ${hasModel}Id>;
`;
            str += `${sp}declare remove${plur}: Sequelize.HasManyRemoveAssociationsMixin<${hasModel}, ${hasModel}Id>;
`;
            str += `${sp}declare has${sing}: Sequelize.HasManyHasAssociationMixin<${hasModel}, ${hasModel}Id>;
`;
            str += `${sp}declare has${plur}: Sequelize.HasManyHasAssociationsMixin<${hasModel}, ${hasModel}Id>;
`;
            str += `${sp}declare count${plur}: Sequelize.HasManyCountAssociationsMixin;
`;
            needed[rel.childTable].add(hasModel);
            needed[rel.childTable].add(`${hasModel}Id`);
            names.push(lur);
          }
        }
      } else {
        if (rel.parentTable === table) {
          const isParent = rel.parentTable === table;
          const thisModel = isParent ? rel.parentModel : rel.childModel;
          const otherModel = isParent ? rel.childModel : rel.parentModel;
          const otherModelSingular = import_lodash.default.upperFirst(
            (0, import_types.singularize)(isParent ? rel.childProp : rel.parentProp)
          );
          const lotherModelPlural = (0, import_types.pluralize)(
            isParent ? rel.childProp : rel.parentProp
          );
          const otherModelPlural = import_lodash.default.upperFirst(lotherModelPlural);
          const otherTable = isParent ? rel.childTable : rel.parentTable;
          str += `${sp}// ${thisModel} belongsToMany ${otherModel} via ${rel.parentId} and ${rel.childId}
`;
          str += `${sp}declare ${lotherModelPlural}?: ${otherModel}[];
`;
          str += `${sp}declare get${otherModelPlural}: Sequelize.BelongsToManyGetAssociationsMixin<${otherModel}>;
`;
          str += `${sp}declare set${otherModelPlural}: Sequelize.BelongsToManySetAssociationsMixin<${otherModel}, ${otherModel}Id>;
`;
          str += `${sp}declare add${otherModelSingular}: Sequelize.BelongsToManyAddAssociationMixin<${otherModel}, ${otherModel}Id>;
`;
          str += `${sp}declare add${otherModelPlural}: Sequelize.BelongsToManyAddAssociationsMixin<${otherModel}, ${otherModel}Id>;
`;
          str += `${sp}declare create${otherModelSingular}: Sequelize.BelongsToManyCreateAssociationMixin<${otherModel}>;
`;
          str += `${sp}declare remove${otherModelSingular}: Sequelize.BelongsToManyRemoveAssociationMixin<${otherModel}, ${otherModel}Id>;
`;
          str += `${sp}declare remove${otherModelPlural}: Sequelize.BelongsToManyRemoveAssociationsMixin<${otherModel}, ${otherModel}Id>;
`;
          str += `${sp}declare has${otherModelSingular}: Sequelize.BelongsToManyHasAssociationMixin<${otherModel}, ${otherModel}Id>;
`;
          str += `${sp}declare has${otherModelPlural}: Sequelize.BelongsToManyHasAssociationsMixin<${otherModel}, ${otherModel}Id>;
`;
          str += `${sp}declare count${otherModelPlural}: Sequelize.BelongsToManyCountAssociationsMixin;
`;
          needed[otherTable] ??= /* @__PURE__ */ new Set();
          needed[otherTable].add(otherModel);
          needed[otherTable].add(`${otherModel}Id`);
          names.push(lotherModelPlural);
        }
      }
    });
    if (needed[table]) {
      delete needed[table];
    }
    return { names, needed, str };
  }
  addTypeScriptFields(table, isInterface) {
    const sp = this.space[1];
    const fields = import_lodash.default.keys(this.tables[table]);
    const notNull = "";
    let str = "";
    fields.forEach((field) => {
      if (!this.options.skipFields || !this.options.skipFields.includes(field)) {
        const name = this.quoteName((0, import_types.recase)(this.options.caseProp, field));
        const isOptional = this.getTypeScriptFieldOptional(table, field);
        const tsType = this.getTypeScriptType(table, field);
        if (tsType === "any" && this.options.eslintIgnoreAny) {
          str += `${sp}// eslint-disable-next-line @typescript-eslint/no-explicit-any
`;
        }
        str += `${sp}${!isInterface ? "declare " : ""}${name}${isOptional ? "?" : notNull}: ${tsType};
`;
      }
    });
    return str;
  }
  getTypeScriptFieldOptional(table, field) {
    const fieldObj = this.tables[table][field];
    return fieldObj.allowNull;
  }
  getTypeScriptType(table, field) {
    const fieldObj = this.tables[table][field];
    return this.getTypeScriptFieldType(fieldObj, "type");
  }
  getTypeScriptFieldType(fieldObj, attr) {
    const rawFieldType = fieldObj[attr] || "";
    const fieldType = String(rawFieldType).toLowerCase();
    let jsType;
    if (this.isArray(fieldType)) {
      const eltype = this.getTypeScriptFieldType(fieldObj, "elementType");
      jsType = eltype + "[]";
    } else if (this.isNumber(fieldType)) {
      jsType = "number";
    } else if (this.isBoolean(fieldType)) {
      jsType = "boolean";
    } else if (this.isDate(fieldType)) {
      jsType = "Date";
    } else if (this.isString(fieldType)) {
      jsType = "string";
    } else if (this.isEnum(fieldType)) {
      const values = this.getEnumValues(fieldObj);
      jsType = values.join(" | ");
    } else if (this.isJSON(fieldType)) {
      jsType = "object";
    } else {
      console.log(`Missing TypeScript type: ${fieldType || fieldObj["type"]}`);
      jsType = "any";
    }
    return jsType;
  }
  getEnumValues(fieldObj) {
    if (fieldObj.special) {
      return fieldObj.special.map((v) => `"${v}"`);
    } else {
      return fieldObj.type.substring(5, fieldObj.type.length - 1).split(",");
    }
  }
  isTimestampField(field) {
    const additional = this.options.additional;
    if (additional.timestamps === false) {
      return false;
    }
    return !additional.createdAt && (0, import_types.recase)("c", field) === "createdAt" || additional.createdAt === field || !additional.updatedAt && (0, import_types.recase)("c", field) === "updatedAt" || additional.updatedAt === field;
  }
  isParanoidField(field) {
    const additional = this.options.additional;
    if (additional.timestamps === false || additional.paranoid === false) {
      return false;
    }
    return !additional.deletedAt && (0, import_types.recase)("c", field) === "deletedAt" || additional.deletedAt === field;
  }
  isIgnoredField(field) {
    return this.options.skipFields && this.options.skipFields.includes(field);
  }
  escapeSpecial(val) {
    if (typeof val !== "string") {
      return val;
    }
    return val.replace(/[\\]/g, "\\\\").replace(/[\"]/g, '\\"').replace(/[\/]/g, "\\/").replace(/[\b]/g, "\\b").replace(/[\f]/g, "\\f").replace(/[\n]/g, "\\n").replace(/[\r]/g, "\\r").replace(/[\t]/g, "\\t");
  }
  /** Quote the name if it is not a valid identifier */
  quoteName(name) {
    return /^[$A-Z_][0-9A-Z_$]*$/i.test(name) ? name : "'" + name + "'";
  }
  isNumber(fieldType) {
    return /^(smallint|mediumint|tinyint|int|bigint|float|money|smallmoney|double|decimal|numeric|real|oid)/.test(
      fieldType
    );
  }
  isBoolean(fieldType) {
    return /^(boolean|bit)/.test(fieldType);
  }
  isDate(fieldType) {
    return /^(datetime|timestamp)/.test(fieldType);
  }
  isString(fieldType) {
    return /^(char|nchar|string|varying|varchar|nvarchar|text|longtext|mediumtext|tinytext|ntext|uuid|uniqueidentifier|date|time|inet|cidr|macaddr)/.test(
      fieldType
    );
  }
  isArray(fieldType) {
    return /(^array)|(range$)/.test(fieldType);
  }
  isEnum(fieldType) {
    return /^(enum)/.test(fieldType);
  }
  isJSON(fieldType) {
    return /^(json|jsonb)/.test(fieldType);
  }
  addNamespacedHelpers(table, params) {
    const content = [
      this.addTypeBoxSchemas(table),
      this.addIncludeFunction(params.associations.names)
    ].join("");
    if (!content)
      return "";
    return `
export namespace #TABLE# {${content}}
`;
  }
  addIncludeFunction(names) {
    if (!names.length)
      return "";
    return `
  /** Intellisense for associations to include. */
  export function include(
    ...keys: (${names.map((name) => `
      | "${name}"`).join("")}
      | Omit<Includeable, string>
    )[]
  ) {
    return keys;
  }
`;
  }
  // #region TypeBox Schema Types
  addTypeBoxSchemas(table) {
    if (this.options.noSchemas)
      return "";
    const fields = import_lodash.default.keys(this.tables[table]);
    const fieldProps = fields.map((field) => {
      const fieldName = (0, import_types.recase)(this.options.caseProp, field);
      const fieldObj = this.tables[table][field];
      return this.space[2] + `${fieldName}: ${this.getTypeBoxFieldType(
        table,
        field,
        fieldObj,
        "type"
      )},
`;
    }).join("");
    return `
  export const Row = Type.Object({
${fieldProps.trimEnd()}
  });
  export type Row = Static<typeof Row>;
`;
  }
  getTypeBoxFieldType(table, field, fieldObj, attr) {
    var _a, _b;
    const rawFieldType = fieldObj[attr] || "";
    const fieldType = String(rawFieldType).toLowerCase();
    let tbType;
    if (this.isArray(fieldType)) {
      const eltype = this.getTypeBoxFieldType(
        table,
        field,
        fieldObj,
        "elementType"
      );
      tbType = `Type.Array(${eltype})`;
    } else if (this.isNumber(fieldType)) {
      tbType = "Type.Number()";
    } else if (this.isBoolean(fieldType)) {
      tbType = "Type.Boolean()";
    } else if (this.isDate(fieldType)) {
      tbType = "SafeDate()";
    } else if (this.isString(fieldType)) {
      const length = (_b = (_a = this.meta[table]) == null ? void 0 : _a[field]) == null ? void 0 : _b.length;
      if (length) {
        tbType = `Type.String({ maxLength: ${length} })`;
      } else {
        tbType = "Type.String()";
      }
    } else if (this.isEnum(fieldType)) {
      const values = this.getEnumValues(fieldObj);
      tbType = `StringEnum("${values.join('","')}")`;
    } else if (this.isJSON(fieldType)) {
      tbType = "Type.Object({})";
    } else {
      console.log(`Missing TypeBox type: ${fieldType || fieldObj["type"]}`);
      tbType = "Type.Any()";
    }
    if (fieldObj.allowNull) {
      tbType = `Maybe(${tbType})`;
    }
    return tbType;
  }
  // #endregion
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AutoGenerator
});
