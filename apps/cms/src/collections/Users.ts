import type { CollectionConfig } from "payload";

// Admin/auth users. The create-first-user screen at /admin writes here.
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  fields: [
    // email + password are added automatically by `auth: true`.
  ],
};
