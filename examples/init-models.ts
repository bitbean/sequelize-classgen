import type { Sequelize } from "sequelize";
import { Role } from "./Role";
import { UserRole } from "./UserRole";
import { User } from "./User";

export * from "./Role";
export * from "./UserRole";
export * from "./User";

export default function initModels(sequelize: Sequelize) {
  Role.initModel(sequelize);
  UserRole.initModel(sequelize);
  User.initModel(sequelize);

  UserRole.belongsTo(Role, { as: "role", foreignKey: "role_id"});
  Role.hasMany(UserRole, { as: "user_roles", foreignKey: "role_id"});
  UserRole.belongsTo(User, { as: "user", foreignKey: "user_id"});
  User.hasMany(UserRole, { as: "user_roles", foreignKey: "user_id"});
}
