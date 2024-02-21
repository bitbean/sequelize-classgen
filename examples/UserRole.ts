import * as Sequelize from 'sequelize';
import { DataTypes, Includeable, Model, Optional } from 'sequelize';
import type { Role, RoleId } from './Role';
import type { User, UserId } from './User';

export interface UserRoleAttributes {
  id: number;
  user_id: number;
  role_id: number;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type UserRolePk = "id";
export type UserRoleId = UserRole[UserRolePk];
export type UserRoleOptionalAttributes = "id" | "created_at" | "updated_at" | "deleted_at";
export type UserRoleCreationAttributes = Optional<UserRoleAttributes, UserRoleOptionalAttributes>;

export class UserRole extends Model<UserRoleAttributes, UserRoleCreationAttributes> implements UserRoleAttributes {
  declare id: number;
  declare user_id: number;
  declare role_id: number;
  declare created_at: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;

  // UserRole belongsTo Role via role_id
  declare role?: Role;
  declare getRole: Sequelize.BelongsToGetAssociationMixin<Role>;
  declare setRole: Sequelize.BelongsToSetAssociationMixin<Role, RoleId>;
  declare createRole: Sequelize.BelongsToCreateAssociationMixin<Role>;
  // UserRole belongsTo User via user_id
  declare user?: User;
  declare getUser: Sequelize.BelongsToGetAssociationMixin<User>;
  declare setUser: Sequelize.BelongsToSetAssociationMixin<User, UserId>;
  declare createUser: Sequelize.BelongsToCreateAssociationMixin<User>;

  static initModel(sequelize: Sequelize.Sequelize): typeof UserRole {
    return UserRole.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'user_roles',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "user_roles_idx",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_id" },
          { name: "role_id" },
        ]
      },
      {
        name: "role_id",
        using: "BTREE",
        fields: [
          { name: "role_id" },
        ]
      },
    ]
  });
  }
}

export namespace UserRole {
  /** Intellisense for associations to include. */
  export function include(
    ...keys: (
      | "role"
      | "user"
      | Omit<Includeable, string>
    )[]
  ) {
    return keys;
  }
}
