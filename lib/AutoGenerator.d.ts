/// <reference types="./global.d.ts" />
/**
 * @file Modified version of AutoGenerator from sequelize-auto.
 *
 * Changes:
 * - Add `tsEsm` option so TypeScript files import `.js`, e.g.
 *   `from "./MyModel.js"`, required for TypeScript/Node ESM compatibility.
 * - Add `declare ` before class properties (TypeScript).
 * - Remove `:!` after class properties (TypeScript).
 * - Add options `initModelsDefault`, `noSchemas` and `tsEsm`.
 */
import type { ModelerOptions } from "./types";
import { ColumnDescription } from "sequelize";
import { DialectOptions, FKSpec } from "sequelize-auto/types/dialects/dialect-options";
import { AutoOptions, CaseFileOption, CaseOption, IndexSpec, LangOption, Relation, TableData } from "sequelize-auto/lib/types";
/** Generates text from each table in TableData */
export declare class AutoGenerator {
    dialect: DialectOptions;
    tables: {
        [tableName: string]: {
            [fieldName: string]: ColumnDescription;
        };
    };
    foreignKeys: {
        [tableName: string]: {
            [fieldName: string]: FKSpec;
        };
    };
    hasTriggerTables: {
        [tableName: string]: boolean;
    };
    indexes: {
        [tableName: string]: IndexSpec[];
    };
    relations: Relation[];
    space: string[];
    options: {
        indentation?: number;
        spaces?: boolean;
        lang?: LangOption;
        caseModel?: CaseOption;
        caseProp?: CaseOption;
        caseFile?: CaseFileOption;
        skipFields?: string[];
        additional?: any;
        schema?: string;
        singularize: boolean;
        useDefine: boolean;
        noIndexes?: boolean;
    } & ModelerOptions;
    /** Metadata collected for use in creating TypeBox schemas. */
    meta: {
        [tableName: string]: {
            [fieldName: string]: {
                /** This is currently only used to detect when SafeDate is needed. */
                dateFormat?: "date" | "datetime";
                length?: number;
            };
        };
    };
    constructor(tableData: TableData, dialect: DialectOptions, options: AutoOptions & ModelerOptions);
    makeHeaderTemplate(table: string, params: {
        associations: {
            names: string[];
        };
    }): string;
    generateText(): {
        [name: string]: string;
    };
    private addTable;
    private addField;
    private addIndexes;
    /** Get the sequelize type from the Field */
    private getSqType;
    private getTypeScriptPrimaryKeys;
    private getTypeScriptCreationOptionalFields;
    /** Add schema to table so it will match the relation data.  Fixes mysql problem. */
    private addSchemaForRelations;
    private addTypeScriptAssociationMixins;
    private addTypeScriptFields;
    private getTypeScriptFieldOptional;
    private getTypeScriptType;
    private getTypeScriptFieldType;
    private getEnumValues;
    private isTimestampField;
    private isParanoidField;
    private isIgnoredField;
    private escapeSpecial;
    /** Quote the name if it is not a valid identifier */
    private quoteName;
    private isNumber;
    private isBoolean;
    private isDate;
    private isString;
    private isArray;
    private isEnum;
    private isJSON;
    private addNamespacedHelpers;
    private addIncludeFunction;
    private addTypeBoxSchemas;
    private getTypeBoxFieldType;
}
