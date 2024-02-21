import dotenv from "dotenv";

dotenv.config();

export type ConfigEnv = "development" | "staging" | "production";

const {
  // Standard
  NODE_ENV: node_env = "development",
  LOG_LEVEL = "debug",
  TZ,

  // Database
  DB_URL = "mysql://root@localhost:3306/defaultdb",
} = process.env;

const NODE_ENV: ConfigEnv = node_env as ConfigEnv;
const __DEV__ = NODE_ENV === "development";

export {
  // Standard
  __DEV__,
  NODE_ENV,
  LOG_LEVEL,
  TZ,

  // Database
  DB_URL,
};
