// Local
import initModels from "./init-models";
import initCustom from "./init-custom";
import mainDb from "./mainDb";
// NOTE: Generate init-models, User, Role and UserRole OR copy them from the
// repo example/ folder into here to see how this code works.

// Initialize

initModels(mainDb);
initCustom(mainDb);

// Export db

export { mainDb };

// Export models

export * from "./init-models";

// Export extra stuff added by custom

export * from "./init-custom";
