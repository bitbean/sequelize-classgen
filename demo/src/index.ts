import { User } from "./db";

async function main() {
  console.log("Hello");

  const id = 1;
  const user = await User.findByPk(id);
  if (!user) {
    console.log(`User ${id} not found.`);
    return;
  }

  // Try intellisense for:
  // user.main_role
  
}
main();
