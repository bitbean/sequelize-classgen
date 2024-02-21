import type {
  HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
} from "sequelize";
import { Role, RoleId } from "./Role";

declare module "./User" {
  interface User {
    // User hasOne Role via main_role_id
    main_role?: Role;
    getParent_address: HasOneGetAssociationMixin<Role>;
    setParent_address: HasOneSetAssociationMixin<Role, RoleId>;
    createParent_address: HasOneCreateAssociationMixin<Role>;
  }
}