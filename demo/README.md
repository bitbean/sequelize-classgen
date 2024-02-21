# Sequelize Class Generator Demo

## Usage

1. Copy the `demo` folder out of the repo so it doesn't use parent node_modules.
2. In the copied folder, run `npm i && cp .env.example .env`
3. Run the statements in `create-database.sql` to create the `cgdemo` database.
4. Edit `.env` and change the `DB_URL` to point to a test MySQL db. e.g.
   `DB_URL=mysql://root@localhost:3306/cgdemo` or
   `DB_URL=mysql://root:password@localhost:3306/cgdemo`

Now you can run the package script to generate models:

```sh
npm run generate-models
```

...which should show a bunch of `Executing ...` statements ending in `OK`.

Look in `src/db/main` to see your new files:

- `init-models.ts`
- `Role.ts`
- `User.ts`
- `UserRole.ts`

For examples of what these files should look like, see the `examples/` folder.

See the comments in `src/db/main/index.ts` and `src/db/main/init-custom.ts` for
advanced Model type customizations that won't conflict with generated files.
