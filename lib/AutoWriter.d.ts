/// <reference types="./global.d.ts" />
/**
 * @file Modified version of AutoWriter from sequelize-auto.
 * Changes:
 * - Add `tsEsm` option so TypeScript files import `.js`, e.g.
 *   `from "./MyModel.js"`, required for TypeScript/Node ESM compatibility.
 */
import type { ModelerOptions } from "./types";
import { FKSpec, TableData } from "sequelize-auto";
import { AutoOptions, CaseFileOption, CaseOption, LangOption, Relation } from "sequelize-auto/lib/types";
/** Writes text into files from TableData.text, and writes init-models */
export declare class AutoWriter {
    tableText: {
        [name: string]: string;
    };
    foreignKeys: {
        [tableName: string]: {
            [fieldName: string]: FKSpec;
        };
    };
    relations: Relation[];
    space: string[];
    options: {
        caseFile?: CaseFileOption;
        caseModel?: CaseOption;
        caseProp?: CaseOption;
        directory: string;
        lang?: LangOption;
        noAlias?: boolean;
        noInitModels?: boolean;
        noWrite?: boolean;
        singularize?: boolean;
        useDefine?: boolean;
        spaces?: boolean;
        indentation?: number;
    } & ModelerOptions;
    constructor(tableData: TableData, options: AutoOptions & ModelerOptions);
    write(): Promise<void> | Promise<void[]>;
    private createInitString;
    private createFile;
    /** Create the belongsToMany/belongsTo/hasMany/hasOne association strings */
    private createAssociations;
    private createTsInitString;
    private createES5InitString;
    private createESMInitString;
}
