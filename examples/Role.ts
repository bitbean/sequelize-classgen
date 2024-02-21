import * as Sequelize from 'sequelize';
import { DataTypes, Includeable, Model } from 'sequelize';
import type { UserRole, UserRoleId } from './UserRole';

export interface RoleAttributes {
  id: number;
  code: string;
  name: string;
}

export type RolePk = "id";
export type RoleId = Role[RolePk];
export type RoleCreationAttributes = RoleAttributes;

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  declare id: number;
  declare code: string;
  declare name: string;

  // Role hasMany UserRole via role_id
  declare user_roles?: UserRole[];
  declare getUser_roles: Sequelize.HasManyGetAssociationsMixin<UserRole>;
  declare setUser_roles: Sequelize.HasManySetAssociationsMixin<UserRole, UserRoleId>;
  declare addUser_role: Sequelize.HasManyAddAssociationMixin<UserRole, UserRoleId>;
  declare addUser_roles: Sequelize.HasManyAddAssociationsMixin<UserRole, UserRoleId>;
  declare createUser_role: Sequelize.HasManyCreateAssociationMixin<UserRole>;
  declare removeUser_role: Sequelize.HasManyRemoveAssociationMixin<UserRole, UserRoleId>;
  declare removeUser_roles: Sequelize.HasManyRemoveAssociationsMixin<UserRole, UserRoleId>;
  declare hasUser_role: Sequelize.HasManyHasAssociationMixin<UserRole, UserRoleId>;
  declare hasUser_roles: Sequelize.HasManyHasAssociationsMixin<UserRole, UserRoleId>;
  declare countUser_roles: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Role {
    return Role.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'roles',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

export namespace Role {
  /** Intellisense for associations to include. */
  export function include(
    ...keys: (
      | "user_roles"
      | Omit<Includeable, string>
    )[]
  ) {
    return keys;
  }
}
