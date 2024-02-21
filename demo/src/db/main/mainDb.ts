import { Sequelize, Options } from "sequelize";
import { DB_URL } from "../../config/index.js";

const options: Options = {
  logging: (log: any) => console.log(log),
  // logging: (log: any) => logger.debug(log),
  define: {
    // paranoid: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    // timestamps: true,
    defaultScope: {
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
    },
    scopes: {
      /** Use with `MyModel.scope("timestamps").findMethod()` */
      timestamps: {
        attributes: {
          include: ["created_at", "updated_at"],
        },
      },
      /** Use with `MyModel.scope("deleted").findMethod()` */
      deleted: {
        attributes: {
          include: ["created_at", "updated_at", "deleted_at"],
        },
      },
    },
  },
};
export default new Sequelize(DB_URL, options);
