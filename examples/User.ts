import * as Sequelize from 'sequelize';
import { DataTypes, Includeable, Model, Optional } from 'sequelize';
import type { UserRole, UserRoleId } from './UserRole';

export interface UserAttributes {
  id: number;
  email: string;
  fname: string;
  lname: string;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
  login_attempts?: number;
  phone?: string;
  password?: string;
  last_login_at?: Date;
  failed_login_at?: Date;
  forgot_password_token?: string;
  forgot_password_at?: Date;
}

export type UserPk = "id";
export type UserId = User[UserPk];
export type UserOptionalAttributes = "id" | "created_at" | "updated_at" | "deleted_at" | "login_attempts" | "phone" | "password" | "last_login_at" | "failed_login_at" | "forgot_password_token" | "forgot_password_at";
export type UserCreationAttributes = Optional<UserAttributes, UserOptionalAttributes>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare email: string;
  declare fname: string;
  declare lname: string;
  declare created_at: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;
  declare login_attempts?: number;
  declare phone?: string;
  declare password?: string;
  declare last_login_at?: Date;
  declare failed_login_at?: Date;
  declare forgot_password_token?: string;
  declare forgot_password_at?: Date;

  // User hasMany UserRole via user_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof User {
    return User.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "email"
    },
    fname: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    lname: {
      type: DataTypes.STRING(255),
      allowNull: false
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
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    phone: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    failed_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    forgot_password_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    forgot_password_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users',
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
        name: "email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
  }
}

export namespace User {
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
