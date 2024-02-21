import type {
  Sequelize,
  HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
} from "sequelize";
import { User } from "./User";
import { Role, RoleId } from "./Role";

export default function initCustom(sequelize: Sequelize) {
  User.hasOne(Role, { as: "mainRole", foreignKey: "main_role_id" });
}

type MyNestedType = string | number;

declare module "./User" {
  // Here's how to easily expand the User class with a new field type.
  interface User {
    // User hasOne Role via main_role_id
    main_role?: Role;
    getParent_address: HasOneGetAssociationMixin<Role>;
    setParent_address: HasOneSetAssociationMixin<Role, RoleId>;
    createParent_address: HasOneCreateAssociationMixin<Role>;
  }

  // Here's how you nest a type inside User (e.g. User.MyNestedType) and attach
  // static methods:
  export namespace User {
    export {
      MyNestedType, // Just a type.
      otherStaticMethod, // Type of static method we will attach below.
    };
  }
}

function otherStaticMethod() {
  return "Hello!";
}
// You must assign the static method here or else it will fail at runtime.
User.otherStaticMethod = otherStaticMethod;

// CONSIDER: The above could also be in a separate file, User.custom.ts, then:
// export * from "./User.custom";
// export * from "./Role.custom";
// ...
// OR at the top:
// import from "./User.custom";
// import from "./Role.custom";
// ...
// However, of course then you have to copy all the Mixin imports all over.
// Each .custom.ts file could also have it's own initCustom() function too.
//
// If the customizations are limited, putting everything in one file is fine.
