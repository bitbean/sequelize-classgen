# Sequelize Class Generator

## Installation

```sh
npm add -D @bitbean/sequelize-classgen
```

See [demo/README.md](demo/README.md) to try the working demo.

## Usage

1. Copy the `example.sequelize-classgen.cjs` file into your project.
2. Rename it to `.sequelize-classgen.cjs`.
3. Edit the file to change the `directory` option and other options.
   Intellisense/Autocomplete should be helpful. You can also change the
   `getDbConfig` function in this file to use something other than an ENV var to
   get the basic db config.
4. Add a script to your `package.json`:

```json
"scripts": {
  "generate-models": "sequelize-classgen",
}
```

5. `npm run generate-models` The files should be in whatever `directory` you
   specified in the config.

If you want to pass a custom config you can do:

```json
"scripts": {
  "generate-models": "sequelize-classgen ./my-config.cjs",
}
```

or from the command-line, e.g. `npm run generate-models ./my-config.cjs`

## Differences with sequelize-auto

- Generated TypeScript models have `declare` before class properties.
- Removed the `:!` after associated class properties (TypeScript).
- Added options `initModelsDefault`, `noSchemas` and `tsEsm`. See
  [Advanced Configuration](#advanced-configuration) for details.
- Added a new static `include` function to each model to give intellisense when
  using the `include: [...]` option in your queries. See
  [Model Additions](#model-additions).
- Fixed TypeScript models call to `MyModel.init({...})` by always generating the
  `created_at`, `updated_at` fields even if `paranoid` is `true`.
- Only has a single (optional) CLI arg for a single `.js` config file. The
  default config file name is `.sequelize-classgen.cjs`.

## Advanced Configuration

Basic options are documented with `sequelize-auto` and `sequelize`. These
advanced options are part of `sequelize-classgen`.

### initModelsDefault option

The generated `initModels` code has been changed radically to simplify the
structure of the file and to make exporting models cleaner. To that end, we
prefer to `export default function initModels() {}` instead of
`export function initModels() {}`. We also `export * from "./MyModel.js` for
each model and that way your own `src/code/db/index.ts` file can just do
`export * from "./init-models";` which won't export the default `initModels`
(unless `initModelsDefault` is `false`).

Defaults to `true`.

### noSchemas option / TypeBox Schemas

This defaults to `false` since the `mui-fastify-template` project where this
code originated uses [TypeBox](https://www.npmjs.com/package/@sinclair/typebox)
to create JSON Schema objects and their associated TS types for use with the
OpenAPI/Swagger schema that gets registered with Fastify.

The schemas we generate are added as `MyModelName.Row` which is a TS type AND a
live JS object which represents the JSON Schema for the base row. Using TypeBox
you can build other JSON Schemas and types that exclude or add properties to the
base `Row` schema/type.

These schemas can be used in any situation where you need a JSON Schema object
and a corresponding TypeScript type. It would be nice to use with Express too.
See examples in `mui-fastify-template/backend/api-server/src/db/main/...`.

This is option is set to `false` in the example config, for most other projects.

### tsEsm option for ESM/Node modules

For Node packages that have `"type":"module"` in the package.json, TypeScript
code must only use `import` statements with `*.js` file extension. For example,
your TS code will have to do:

```ts
import { helper } from "./helper.js"; // <-- EVEN if the source is ./helper.ts
```

This is because the TypeScript team has vowed to
[never re-write import statements](https://github.com/microsoft/TypeScript/issues/49083).

To handle this, the `tsEsm` option was added. It defaults to `true`. The
`example.sequelize-classgen.cjs` file sets it to `false` so that the example is
ready for use in most projects which are not using ESM yet...

The ESM rules are also why the `.sequelize-classgen.cjs` file uses the `.cjs`
file extension. Otherwise, in Node packages with `"type": "module"`, you'll get
errors if it's named `.js` and if the file uses `require()` or doesn't follow
other ESM rules. The `.cjs` extension should work everywhere, even non-ESM
packages.

## Model Additions

Aside from the [TypeBox schemas](#noschemas-option--typebox-schemas) we also add
a TypeScript `namespace` to extend the Model class with some other things:

### static include function

A new static `include` function is generated for each model to give intellisense
when using the `include: [...]` option in your queries. For example:

```ts
const user = await User.findOne({
  where: { email: body.email.trim().toLowerCase() },
  include: User.include("parent_address", "parent_schools", "user_roles"),
});
```

or

```ts
const item = await GiftOrder.unscoped().findByPk(id, {
  include: GiftOrder.include(
    // 1st include, just by name of association
    "gift_items",
    // 2nd include with a specific scope to allow fetching timestamp fields...
    {
      as: "gift_transactions",
      model: GiftTransaction.unscoped(),
    },
  ),
});
```
