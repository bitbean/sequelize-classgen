export interface ModelerOptions {
  /** Set `true` to print eslint-disable-next-line commands above usage of `any`. */
  eslintIgnoreAny?: boolean;
  /** Set `true` to make `initModels` a default export. */
  initModelsDefault?: boolean;
  /** Set `true` to NOT generate a TypeBox `Row` schema for each model. */
  noSchemas?: boolean;
  /** Set `true` for Node projects with `"type":"module"` in package.json */
  tsEsm?: boolean;
}
