"use strict";
/**
 * @typedef {import("sequelize").Options} SequelizeOptions
 * @typedef {import("sequelize").ModelOptions} ModelOptions
 * @typedef {import("sequelize-auto/types/index").AutoOptions} AutoOptions
 * @typedef {import("@bitbean/sequelize-classgen").ModelerOptions} ModelerOptions
 */
// Load up our .env file, if any.
require("dotenv").config();
/** ENV var name for `getDbConfig` to use, e.g. `mysql://...` */
const ENV_DB_URL = "DB_URL";
/** Non-connection related config props @type {SequelizeOptions} */
const BASE_CONFIG = {
  dialect: "mysql",
  pool: { maxConnections: 5, maxIdleTime: 30 },

  logging: (log) => console.log(log),
  define: {
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  },
};
const dbConfig = getDbConfig();

/** @type {SequelizeOptions & AutoOptions & ModelerOptions} */
module.exports = {
  ...dbConfig,
  //
  // sequelize-classgen + sequelize-auto options
  //
  directory: "src/db/main/",
  skipTables: ["SequelizeMeta"],
  /** Global model options @type {ModelOptions} */
  additional: {
    // These timestamp fields don't exist on every table in this project...
    // However, that's OK because if sequelize-auto detects fields that match
    // the names of the timestamp fields, it turns them on automatically for
    // that model, so these aren't ever really needed here.
    //
    // paranoid: true,
    // timestamps: true,
    //
  },
  eslintIgnoreAny: true, // default = false
  noSchemas: true, // default = false
  // singularize: false, // default = true
  tsEsm: false, // default = true
  // initModelsDefault: false, // default = true
  //
  // - See docs of or output of sequelize-auto command to get more defaults...
};

function getDbConfig() {
  const { [ENV_DB_URL]: DB_URL } = process.env;
  if (!DB_URL) {
    throw new Error(`Missing ${ENV_DB_URL} env var.`);
  }
  const url = new URL(DB_URL);

  /** @type {SequelizeOptions} */
  const baseConfig = {
    ...BASE_CONFIG,
    username: url.username,
    password: url.password,
    database: url.pathname.substring(url.pathname.indexOf("/") + 1),
    host: url.hostname,
    port: parseInt(url.port || "3306"),
  };

  /** @type {SequelizeOptions} */
  const config = {
    development: baseConfig,
    staging: baseConfig,
    production: baseConfig,

    // CONSIDER: Not sure if we need this...
    ...baseConfig,
  };
  return config;
}
